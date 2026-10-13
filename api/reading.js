/**
 * POST /api/reading
 *
 * Takes a computed 만세력, returns the interpretation as JSON.
 *
 * This function exists for exactly one reason: the API key must never reach the
 * browser. Anything in the page source is extractable, and a leaked key gets
 * scraped and burned. The key lives in Vercel's environment and only this
 * function ever sees it.
 *
 * Parley (MIT's gateway) speaks the Anthropic Messages API, so this is a plain
 * fetch with no SDK and no dependencies to install.
 *
 * Environment variables:
 *   SAJU_PARLEY_API_KEY this reader's own Parley key (sk-parley-v1-...), or else
 *   ANTHROPIC_API_KEY + ANTHROPIC_BASE_URL
 *   READING_MODEL       optional, defaults to claude-sonnet-5
 */

import { SYSTEM_PROMPT, buildUserMessage } from './_prompt.js';
import { cacheKey, readCached, writeCached } from './_cache.js';

/**
 * Haiku by default: measured against this prompt it returns a full reading in
 * about 15 seconds, where Sonnet takes around 67 because it reasons at length
 * first. Both stayed inside the word budgets. Nobody waits a minute for a
 * fortune, so speed wins here.
 *
 * Set READING_MODEL=claude-sonnet-5 to trade the wait for more depth.
 */
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

/**
 * The reading itself is ~1,000 words, which is around 1,500 tokens of JSON.
 * The ceiling is far higher than that because the model may reason before it
 * answers, and those tokens come out of the same budget: at 2,400 the entire
 * allowance went on thinking and the response came back with an empty content
 * array and stop_reason "max_tokens". Headroom is cheap; a blank reading is not.
 */
const MAX_TOKENS = 12000;

/**
 * A crude guard on the API key.
 *
 * Once this is on a public URL, every reading spends the owner's quota and
 * anyone with the link can generate them. This caps how many one address may
 * ask for per hour.
 *
 * It is per-instance, not global: Vercel runs several, and each keeps its own
 * counter, so the real ceiling is this number times however many are warm. That
 * is fine for what it defends against — someone looping the endpoint — and it
 * is not a security control. If this ever needs to be exact, it needs a shared
 * store rather than a bigger number here.
 */
const RATE_LIMIT = Number(process.env.READINGS_PER_HOUR || 20);
const WINDOW_MS = 60 * 60 * 1000;
const seen = new Map();

function overRateLimit(req) {
  if (RATE_LIMIT <= 0) return false; // explicitly disabled

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();

  // Opportunistic cleanup; this map must not grow without bound.
  if (seen.size > 5000) {
    for (const [key, times] of seen) {
      if (!times.some((t) => now - t < WINDOW_MS)) seen.delete(key);
    }
  }

  const times = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= RATE_LIMIT) {
    seen.set(ip, times);
    return true;
  }
  times.push(now);
  seen.set(ip, times);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  // Validate the request before looking at configuration, so a malformed body
  // gets told it is malformed rather than blamed on the server.
  const payload = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!payload || !payload.pillars || !payload.yourCoreElement) {
    return res.status(400).json({ error: 'Body must be a computed chart payload.' });
  }

  // The saju reader's own Parley key wins; otherwise the shared ANTHROPIC_* pair.
  const sajuKey = cleanEnv(process.env.SAJU_PARLEY_API_KEY);
  const apiKey = sajuKey || cleanEnv(process.env.ANTHROPIC_API_KEY);
  const baseUrl = (sajuKey
    ? 'https://parley.api.mit.edu'
    : cleanEnv(process.env.ANTHROPIC_BASE_URL) || 'https://api.anthropic.com'
  ).replace(/\/+$/, '');

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing SAJU_PARLEY_API_KEY. Set it in the Vercel project environment.',
    });
  }

  const model = process.env.READING_MODEL || DEFAULT_MODEL;

  // Same chart, same model, same reading — no reason to pay for it twice.
  // Checked before the rate limit, so re-reading a chart someone already has
  // never counts against them.
  const key = cacheKey(payload, model);
  const cached = await readCached(key);
  if (cached) {
    console.log('[reading] cache hit');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Reading-Cache', 'hit');
    return res.status(200).json(cached);
  }

  if (overRateLimit(req)) {
    console.warn('[reading] rate limited');
    return res.status(429).json({
      error: 'Too many readings from this address in the last hour. Try again later.',
    });
  }

  try {
    const upstream = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        // The system prompt is long and identical on every request, so cache it.
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        // Note: no assistant prefill. Prefilling "{" is the usual way to stop a
        // model preambling its way into invalid JSON, but Parley rejects it
        // ("the conversation must end with a user message"), so the prompt
        // carries that job and parseReading below cleans up what comes back.
        messages: [
          { role: 'user', content: buildUserMessage(payload) },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      console.error('[reading] upstream error', upstream.status, detail.slice(0, 500));
      return res.status(502).json({
        error: 'The reading service rejected the request.',
        status: upstream.status,
        detail: detail.slice(0, 500),
      });
    }

    const data = await upstream.json();
    const text = extractText(data);

    const reading = parseReading(text);
    if (!reading) {
      // Log enough to diagnose without dumping the whole payload: gateways do
      // not always return the response shape their documentation implies.
      console.error('[reading] could not read a reading from the response');
      console.error('  stop_reason :', data.stop_reason ?? data.choices?.[0]?.finish_reason ?? '(none)');
      console.error('  top keys    :', Object.keys(data).join(', '));
      console.error('  block types :', (data.content ?? []).map((b) => b?.type).join(', ') || '(no content array)');
      console.error('  usage       :', JSON.stringify(data.usage ?? {}));
      console.error('  text (600)  :', text ? text.slice(0, 600) : '(empty)');
      return res.status(502).json({ error: 'The reading came back malformed.' });
    }

    await writeCached(key, reading);

    // Identical charts produce identical readings, so let the CDN keep them too.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Reading-Cache', 'miss');
    return res.status(200).json(reading);
  } catch (error) {
    console.error('[reading] failed', error);
    // Include the cause: on a server this is the only way to see why the
    // upstream call failed, and it is an error path with nothing secret in it.
    return res.status(500).json({
      error: 'Could not reach the reading service.',
      cause: String(error?.cause?.code || error?.code || error?.message || error).slice(0, 200),
      host: baseUrl,
    });
  }
}

/**
 * Get the assistant's text out of a response.
 *
 * Anthropic returns `content: [{type:'text', text}]`, but a gateway may wrap or
 * reshape that, and newer models can put a thinking block first. Try the known
 * shapes rather than assuming one.
 */
function extractText(data) {
  if (typeof data?.completion === 'string') return data.completion; // legacy
  if (typeof data?.content === 'string') return data.content;

  if (Array.isArray(data?.content)) {
    const text = data.content
      .filter((b) => b?.type === 'text' || typeof b?.text === 'string')
      .map((b) => b.text ?? '')
      .join('');
    if (text) return text;
  }

  // OpenAI-compatible shape, in case the gateway normalises to it.
  const choice = data?.choices?.[0];
  if (typeof choice?.message?.content === 'string') return choice.message.content;
  if (Array.isArray(choice?.message?.content)) {
    return choice.message.content.map((b) => b?.text ?? '').join('');
  }
  if (typeof choice?.text === 'string') return choice.text;

  return '';
}

/**
 * Pull the JSON object out of whatever the model actually sent.
 *
 * Without a prefill to anchor it, the reply can arrive bare, wrapped in a code
 * fence, or with a sentence of preamble in front. Try the clean cases first,
 * then fall back to slicing between the outermost braces.
 */
function parseReading(text) {
  const attempts = [];

  const trimmed = text.trim();
  attempts.push(trimmed);

  // Strip a ```json ... ``` fence if there is one.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) attempts.push(fenced[1]);

  // Last resort: everything between the first { and the last }.
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last > first) attempts.push(trimmed.slice(first, last + 1));

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && parsed.identity) return parsed;
    } catch {
      /* try the next shape */
    }
  }
  return null;
}

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

/**
 * Clean an environment variable before it is used in a URL or a header.
 *
 * Values arrive from shells, dashboards and pasted text, and pick things up on
 * the way: a trailing newline, surrounding quotes, or a UTF-8 byte order mark
 * (U+FEFF) from a PowerShell pipe. A BOM is invisible everywhere you would look
 * at it and makes `fetch` fail with "Cannot convert argument to a ByteString",
 * which says nothing about the real cause.
 */
function cleanEnv(value) {
  if (!value) return '';
  return String(value)
    .replace(/^﻿/, '')
    .trim()
    .replace(/^["']|["']$/g, '');
}
