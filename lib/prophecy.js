// The Claude-powered prophecy, shared by the local server (server.js)
// and the Vercel function (api/prophecy.js).
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const MODEL = process.env.SORTING_HAT_MODEL || "claude-sonnet-5-5";
const PARLEY_BASE_URL = "https://parley.api.mit.edu";
const MAX_BODY_BYTES = 8_000;

// ---------- Request validation ----------

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
const HOUSES = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];
const short = (max) => z.string().trim().min(1).max(max);

const ProphecyRequest = z.object({
  sign: z.enum(SIGNS),
  house: z.enum(HOUSES),
  wand: z.object({
    wood: short(40),
    core: short(40),
    length: short(20),
    flexibility: short(40),
  }),
  answers: z.array(short(200)).max(8).default([]),
});

const ProphecyResponse = z.object({
  title: z.string().min(1).max(120),
  prophecy: z.string().min(1).max(1500),
  wandLore: z.string().min(1).max(600),
});

const PROPHECY_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "A fun nickname, 2-4 plain words, e.g. 'The Brave Explorer'." },
    prophecy: { type: "string", description: "The Sorting Hat's reading: 3-5 short sentences, 45-70 words." },
    wandLore: { type: "string", description: "One short, friendly sentence on why this wand picked them." },
  },
  required: ["title", "prophecy", "wandLore"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are a friendly, funny talking Sorting Hat on a fan-made website. People of all ages read your reading in a few seconds, so it has to be quick, clear, and fun.

The house and wand are already decided. Don't change or question them. Just tell the person, in a warm and playful way, why they fit and give them a fun little prediction about their future.

How to write it:
- Talk like you're chatting with a friend. Use "you". Use everyday words a 10-year-old would understand.
- Keep sentences short. One idea per sentence. No long chains of commas, semicolons, or flowery metaphors.
- Pick only the one or two most telling details (their sign, or a quiz answer) and have fun with them. Don't recap every answer.
- A light joke or gentle tease is great; never mean. Family-friendly.
- End with a short, upbeat prediction that's specific and a little silly or exciting.
- Use your own words. Don't quote or closely copy lines from the books or films.

Example of the right tone and length (for a Leo in Gryffindor):
"Oh, a Leo! I could feel your confidence the second I landed on your head. You'd rather charge through a dark forest than sit around wondering what's in it. That's Gryffindor all over. Fair warning: you'll make a new best friend this year, probably by rescuing them from something embarrassing."`;

// ---------- Claude ----------

// The Hat's own Parley key wins; otherwise the SDK's usual ANTHROPIC_API_KEY.
// With neither, there is no client and the page uses its built-in fortunes.
let client;
function getClient() {
  if (client !== undefined) return client;
  const parleyKey = process.env.SORTING_HAT_PARLEY_API_KEY;
  if (parleyKey) client = new Anthropic({ apiKey: parleyKey, baseURL: PARLEY_BASE_URL });
  else if (process.env.ANTHROPIC_API_KEY) client = new Anthropic();
  else client = null;
  return client;
}

const usingParley = () => Boolean(process.env.SORTING_HAT_PARLEY_API_KEY);

async function writeProphecy({ sign, house, wand, answers }) {
  const details = [
    `Zodiac sign: ${sign}`,
    `Sorted into: ${house}`,
    `Wand: ${wand.length} ${wand.wood} wood with a ${wand.core} core, ${wand.flexibility}`,
    answers.length
      ? `Their personality-quiz answers:\n${answers.map((a) => `- ${a}`).join("\n")}`
      : "They skipped the personality questions, so read them by the stars alone.",
  ].join("\n");

  const anthropic = getClient();
  if (!anthropic) throw new Error("No API key set");
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    // Server-side fallback is an Anthropic API feature; Parley may not pass it through.
    ...(usingParley() ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }),
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: PROPHECY_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Give your reading for this person.\n\n${details}` }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Model declined the request");
  }
  const text = response.content.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("No text in model response");
  return ProphecyResponse.parse(JSON.parse(firstJsonObject(text)));
}

/** Return the first complete {...} object in `text`, ignoring anything after it. */
export function firstJsonObject(text) {
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return text.slice(start, i + 1);
  }
  return text;
}

// ---------- Tiny rate limiter (per IP, per minute, per running instance) ----------

const RATE_LIMIT = 10;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  for (const [key, times] of hits) {
    if (times.every((t) => now - t >= 60_000)) hits.delete(key);
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// ---------- Entry point ----------

/**
 * Handle a POST /api/prophecy body. Returns { status, body } for the caller to send.
 * Any failure returns { fallback: true } so the page uses its built-in fortunes.
 */
export async function handleProphecy(rawBody, ip = "unknown") {
  if (rateLimited(ip)) {
    return { status: 429, body: { fallback: true, error: "The Hat needs a moment to rest. Try again shortly." } };
  }

  let input;
  try {
    if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) throw new Error("Body too large");
    input = ProphecyRequest.parse(JSON.parse(rawBody));
  } catch {
    return { status: 400, body: { fallback: true, error: "Invalid request" } };
  }

  try {
    const prophecy = await writeProphecy(input);
    return { status: 200, body: { fallback: false, ...prophecy } };
  } catch (err) {
    console.error("Prophecy generation failed:", err?.message ?? err);
    return { status: 200, body: { fallback: true } };
  }
}
