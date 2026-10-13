import { tossCoins, readCast, LINE_INFO } from "./cast.js";
import { LINE_POSITIONS } from "./hexagrams.js";
import { CHIBI_SVG, coinHTML } from "./chibi.svg.js";

// true: Claude (through Parley, see api/oracle.js) writes an interpretation of each cast,
// visitors can ask follow-ups, and the built-in reading folds away under "Learn more".
// false: every reading uses only the built-in text in hexagrams.js.
const LIVE_READINGS = true;
const API_URL = document.querySelector('meta[name="oracle-api"]')?.content || "/api/oracle";
const MAX_FOLLOWUPS = 6;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const $ = (id) => document.getElementById(id);
const els = {
  ask: $("ask"), question: $("question"),
  cast: $("cast"), stage: $("stage"), hint: document.querySelector(".hint-key"), status: $("status"), toss: $("toss"), lines: $("lines"),
  result: $("result"), hexcards: $("hexcards"), reading: $("reading"), details: $("details"), builtin: $("builtin"),
  followup: $("followup"), followupInput: $("followup-input"), followupNote: $("followup-note"), again: $("again"),
};

let state = null; // { question, lines, history, busy, autoCasting, followups }

// ---------- Stage setup ----------

els.stage.innerHTML = CHIBI_SVG + [0, 1, 2].map(coinHTML).join("");
const coins = [...els.stage.querySelectorAll(".coin")];
const part = (id) => els.stage.querySelector(`#${id}`);
const chibi = {
  arms: part("chibi-arms"), head: part("chibi-head"), eyes: part("chibi-eyes"),
  smile: part("chibi-smile"), gasp: part("chibi-gasp"), bubble: part("chibi-bubble"), body: part("chibi-body"),
};

const LAND_X = [0.27, 0.5, 0.73];
const HAND = { x: 0.5, y: 0.72 };

function coinTransform(coin, x, y, scale = 1) {
  const r = els.stage.getBoundingClientRect();
  const s = coin.offsetWidth;
  return `translate(${x * r.width - s / 2}px, ${y * r.height - s / 2}px) scale(${scale})`;
}

function placeCoin(coin, i) {
  coin.style.transform = coinTransform(coin, LAND_X[i], 0.9);
}
addEventListener("resize", () => coins.forEach((c, i) => c.style.opacity !== "" && placeCoin(c, i)));

// Idle blinking keeps the character alive between tosses.
(function blinkLoop() {
  setTimeout(() => {
    if (!reducedMotion.matches) blink();
    blinkLoop();
  }, 2500 + Math.random() * 3000);
})();

function blink() {
  return chibi.eyes.animate(
    [{ transform: "scaleY(1)" }, { transform: "scaleY(.1)" }, { transform: "scaleY(1)" }],
    { duration: 180 },
  ).finished;
}

// ---------- Toss animation ----------

async function animateToss(result) {
  const faces = result.coins.map((c) => (c === "heads" ? 0 : 180));

  if (reducedMotion.matches) {
    coins.forEach((coin, i) => {
      coin.querySelector(".coin-spin").style.transform = `rotateY(${faces[i]}deg)`;
      placeCoin(coin, i);
      coin.style.opacity = "1";
    });
    return;
  }

  // Gather the coins back into the hands.
  await Promise.all(coins.map((c) => {
    const from = c.style.opacity || "0";
    c.style.opacity = "0";
    return c.animate([{ opacity: from }, { opacity: 0 }], { duration: 150 }).finished;
  }));
  setExpression("neutral");

  // Shake, shake, shake…
  await chibi.arms.animate(
    [0, -4, 4, -4, 4, -3, 3, 0].map((x, k) => ({ transform: `translate(${x}px, ${k % 2 ? -2 : 0}px)` })),
    { duration: 620, easing: "ease-in-out" },
  ).finished;

  // …and flick!
  chibi.arms.animate(
    [{ transform: "translateY(0) scaleY(1)" }, { transform: "translateY(-22px) scaleY(1.06)", offset: 0.35 }, { transform: "translateY(0) scaleY(1)" }],
    { duration: 520, easing: "cubic-bezier(.2,.8,.3,1)" },
  );
  chibi.head.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-4px)", offset: 0.35 }, { transform: "translateY(0)" }],
    { duration: 520 },
  );

  const flights = coins.map((coin, i) => {
    const spin = coin.querySelector(".coin-spin");
    const duration = 1150 + i * 140;
    const peakY = 0.06 + Math.random() * 0.08;
    const peakX = HAND.x + (LAND_X[i] - HAND.x) * 0.55;
    const turns = 3 + i + Math.floor(Math.random() * 2);
    spin.style.transform = `rotateY(${faces[i]}deg)`;
    spin.animate(
      [{ transform: "rotateY(0deg) rotateX(20deg)" }, { transform: `rotateY(${turns * 360 + faces[i]}deg) rotateX(0deg)` }],
      { duration: duration * 0.9, easing: "cubic-bezier(.3,.6,.4,1)" },
    );
    placeCoin(coin, i);
    coin.style.opacity = "1";
    return coin.animate(
      [
        { transform: coinTransform(coin, HAND.x, HAND.y, 0.6), opacity: 0, easing: "cubic-bezier(.2,.7,.4,1)" },
        { transform: coinTransform(coin, peakX, peakY, 1.05), opacity: 1, offset: 0.42, easing: "cubic-bezier(.55,0,.85,.4)" },
        { transform: coinTransform(coin, LAND_X[i], 0.9, 1), offset: 0.82, easing: "ease-out" },
        { transform: coinTransform(coin, LAND_X[i], 0.86, 1), offset: 0.9, easing: "ease-in" },
        { transform: coinTransform(coin, LAND_X[i], 0.9, 1), opacity: 1 },
      ],
      { duration, delay: i * 70, fill: "backwards" },
    ).finished;
  });
  await Promise.all(flights);
}

function setExpression(kind) {
  const surprised = kind === "surprised";
  chibi.smile.style.opacity = surprised ? "0" : "1";
  chibi.gasp.setAttribute("opacity", surprised ? "1" : "0");
  chibi.bubble.setAttribute("opacity", "0");
  if (reducedMotion.matches) return;
  if (surprised) {
    chibi.bubble.setAttribute("opacity", "1");
    chibi.bubble.animate([{ transform: "scale(0)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
    chibi.body.animate([{ transform: "translateY(0)" }, { transform: "translateY(-6px)" }, { transform: "translateY(0)" }], { duration: 300 });
  } else if (kind === "happy") {
    chibi.head.animate([{ transform: "rotate(0)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0)" }], { duration: 600 });
  }
}

// ---------- Casting flow ----------

function renderLine(value, index) {
  const { yang, changing } = LINE_INFO[value];
  const li = document.createElement("li");
  li.className = "line" + (changing ? " changing" : "");
  li.setAttribute("aria-label", `Line ${index + 1}: ${value}, ${LINE_INFO[value].label}`);
  li.innerHTML =
    `<span class="val">${value}</span>` +
    (yang ? `<span class="bar"></span>` : `<span class="bar"></span><span class="bar"></span>`) +
    (changing ? `<span class="mark">${yang ? "○" : "✕"}</span>` : "");
  return li;
}

function renderPlaceholders() {
  els.lines.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const li = document.createElement("li");
    li.className = "line placeholder";
    li.innerHTML = `<span class="bar"></span>`;
    els.lines.append(li);
  }
}

async function tossOnce() {
  if (!state || state.busy || state.lines.length >= 6) return;
  state.busy = true;
  setCastButtons(false);

  const result = tossCoins();
  await animateToss(result);
  const index = state.lines.length;
  state.lines.push(result.value);
  els.lines.children[index].replaceWith(renderLine(result.value, index));
  setExpression(LINE_INFO[result.value].changing ? "surprised" : "happy");

  const n = state.lines.length;
  const heads = result.coins.filter((c) => c === "heads").length;
  const tally = `${heads} head${heads === 1 ? "" : "s"}, ${3 - heads} tail${heads === 2 ? "" : "s"}`;
  els.status.textContent = `${tally} · ${LINE_INFO[result.value].label}` + (n < 6 ? ` · toss ${n + 1} of 6` : "");

  state.busy = false;
  if (n === 6) {
    state.autoCasting = false;
    els.toss.hidden = els.hint.hidden = true;
    setTimeout(revealResult, reducedMotion.matches ? 0 : 700);
  } else {
    setCastButtons(true);
  }
}

// One press casts all six lines, bottom first.
async function castAll() {
  if (!state || state.autoCasting || state.lines.length >= 6) return;
  state.autoCasting = true;
  setCastButtons(false);
  while (state && state.autoCasting && state.lines.length < 6) {
    await tossOnce();
    await wait(reducedMotion.matches ? 120 : 450);
  }
}

function setCastButtons(enabled) {
  els.toss.disabled = !enabled || Boolean(state?.autoCasting);
}

function start(question) {
  state = { question, lines: [], history: [], busy: false, autoCasting: false, followups: 0 };
  coins.forEach((c) => { c.style.opacity = "0"; c.getAnimations().forEach((a) => a.cancel()); });
  renderPlaceholders();
  setExpression("neutral");

  els.ask.hidden = true;
  els.result.hidden = true;
  els.cast.hidden = false;
  els.toss.hidden = els.hint.hidden = false;
  setCastButtons(true);
  els.status.textContent = "Six tosses, one for each line";

  let echo = els.cast.querySelector(".question-echo");
  if (!echo) {
    echo = document.createElement("p");
    echo.className = "question-echo";
    els.cast.prepend(echo);
  }
  echo.textContent = question ? `“${question}”` : "A reading for this moment";
  // Focus the casting area, not the button: the Enter that submitted the question would
  // otherwise also "click" the button and start tossing. Space then tosses via the handler below.
  els.cast.tabIndex = -1;
  els.cast.focus({ preventScroll: true });
}

function resetToAsk() {
  state = null;
  els.cast.hidden = true;
  els.result.hidden = true;
  els.ask.hidden = false;
  els.question.select();
  els.question.focus();
  scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
}

// ---------- Reading ----------

function hexcard(hex, role) {
  return `<div class="hexcard">
    <div class="role">${role}</div>
    <div class="han" lang="zh-Hans">${hex.han}</div>
    <div class="name">${hex.name}</div>
    <div class="meta">${hex.number} · ${hex.pinyin} · ${hex.upper.symbol} ${hex.upper.image} over ${hex.lower.symbol} ${hex.lower.image}</div>
  </div>`;
}

async function revealResult() {
  const cast = readCast(state.lines);
  state.cast = cast;
  els.hexcards.innerHTML = hexcard(cast.primary, "Present")
    + (cast.relating ? `<span class="arrow" aria-hidden="true">→</span>` + hexcard(cast.relating, "Becoming") : "");
  els.builtin.innerHTML = builtInReading(cast);
  els.details.open = false;
  els.followup.hidden = true;
  els.followupNote.textContent = "";
  els.result.hidden = false;
  els.result.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });

  if (!LIVE_READINGS) return showBuiltInOnly(cast);

  const myState = state;
  els.reading.innerHTML = `<p class="reading-label">The oracle's interpretation</p>`;
  els.details.hidden = false;
  const block = appendPending();
  try {
    const text = await fetchReading(myState);
    if (state !== myState) return;
    fillBlock(block, text);
    myState.history.push({ role: "assistant", content: text });
    updateFollowupNote();
  } catch (err) {
    if (state !== myState) return;
    console.warn("Live reading unavailable, showing the built-in text.", err);
    showBuiltInOnly(cast, true);
  }
}

// The built-in reading becomes the main reading: used when live readings are off or fail.
function showBuiltInOnly(cast, fallback = false) {
  els.details.hidden = true;
  els.reading.innerHTML = builtInReading(cast)
    + (fallback ? `<p class="note">The oracle is resting, so this is the built-in reading.</p>` : "");
}

function appendPending() {
  const div = document.createElement("div");
  div.className = "pending";
  div.innerHTML = `<p class="thinking">The oracle is reading your coins<span class="dots" aria-hidden="true"></span></p>`;
  els.reading.append(div);
  return div;
}

function fillBlock(block, text) {
  block.className = "answer";
  block.innerHTML = renderMarkdown(text);
}

async function fetchReading(s) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: s.question, lines: s.lines, history: s.history }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || typeof data.answer !== "string" || !data.answer.trim()) {
    const err = new Error((data && data.error) || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data.answer;
}

async function askFollowup(q) {
  const s = state;
  if (!s || s.busy || s.followups >= MAX_FOLLOWUPS) return;
  s.busy = true;
  s.followups++;
  els.followupInput.value = "";
  els.followupInput.disabled = true;

  const qEl = document.createElement("p");
  qEl.className = "turn-q";
  qEl.textContent = q;
  els.reading.append(qEl);
  const block = appendPending();
  s.history.push({ role: "user", content: q });
  try {
    const text = await fetchReading(s);
    if (state !== s) return;
    fillBlock(block, text);
    s.history.push({ role: "assistant", content: text });
  } catch (err) {
    s.history.pop();
    s.followups--;
    block.className = "answer";
    block.innerHTML = err.status === 429
      ? `<p class="note">The oracle needs a short rest. Try again in a few minutes.</p>`
      : `<p class="note">The oracle lost its train of thought. Try asking again.</p>`;
  } finally {
    s.busy = false;
    if (state === s) {
      els.followupInput.disabled = false;
      updateFollowupNote();
      if (s.followups < MAX_FOLLOWUPS) els.followupInput.focus();
    }
  }
}

function updateFollowupNote() {
  const left = MAX_FOLLOWUPS - state.followups;
  els.followup.hidden = left <= 0;
  els.followupNote.textContent = left <= 0
    ? "The coins have said what they can. Cast again for a new question."
    : `${left} follow-up${left === 1 ? "" : "s"} left for this cast.`;
}

function builtInReading({ primary, relating, changingLines, lines }) {
  const section = (label, hex) =>
    `<section class="part"><h3>${label}${hex.name}</h3><p class="gist">${hex.gist}</p><p>${hex.reading}</p></section>`;

  let html = section("", primary);
  if (changingLines.length) {
    const notes = changingLines.map((n) => {
      const pos = LINE_POSITIONS[n - 1];
      const turn = lines[n - 1] === 9
        ? "Strength here has reached its peak and is turning to yield."
        : "Yielding here has reached its limit and is turning to strength.";
      return `<li><strong>Line ${n}, ${pos.name}:</strong> ${pos.note} ${turn}</li>`;
    }).join("");
    html += `<section class="part"><h3>Changing line${changingLines.length > 1 ? "s" : ""}</h3><ul class="line-notes">${notes}</ul></section>`;
    html += section("Becoming: ", relating);
  } else {
    html += `<section class="part"><p class="note">No changing lines: the situation is settled, and this hexagram speaks on its own.</p></section>`;
  }
  const question = (relating ?? primary).question;
  html += `<section class="part"><p class="sit-with">${question}</p></section>`;
  return html;
}

// Tiny, safe markdown: escape first, then **bold**, *italic*, ### headings, - lists.
function renderMarkdown(src) {
  const esc = src.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return esc.split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (!b) return "";
    const h = b.match(/^#{1,4}\s+(.*)$/);
    if (h && !b.includes("\n")) return `<h3>${inline(h[1])}</h3>`;
    const lines = b.split("\n");
    if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>`).join("")}</ul>`;
    }
    return `<p>${inline(b).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Events ----------

els.ask.addEventListener("submit", (e) => {
  e.preventDefault();
  start(els.question.value.trim());
});
els.toss.addEventListener("click", castAll);
els.stage.addEventListener("click", castAll);
els.again.addEventListener("click", resetToAsk);
els.followup.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = els.followupInput.value.trim();
  if (q) askFollowup(q);
});
addEventListener("keydown", (e) => {
  if (e.code !== "Space" || els.cast.hidden || !els.result.hidden) return;
  if (e.target.closest("input, textarea, button") || document.querySelector(":popover-open")) return;
  e.preventDefault();
  castAll();
});
