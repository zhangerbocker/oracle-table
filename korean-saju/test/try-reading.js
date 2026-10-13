/**
 * Run a real reading and check it against the prompt's word budgets.
 *
 *   node korean-saju/test/try-reading.js
 *   node korean-saju/test/try-reading.js 1992-02-20 20:50 seoul female
 *
 * Needs the dev server running with a key:
 *   ANTHROPIC_API_KEY=sk-parley-... npm run dev
 *
 * The point of this script is not the prose -- it is the table at the end.
 * A prompt that specifies word budgets is worthless if the model ignores them,
 * and the only way to know is to count.
 */

import { computeChart } from '../engine/pillars.js';
import { analyseChart, majorCycles } from '../engine/analysis.js';
import { buildPayload } from '../engine/narrative.js';
import { buildBirth } from '../engine/places.js';
import { soulAnimal } from '../data/soul-animals.js';
import { ensureHighlights, missingHighlights } from '../data/highlight.js';

const [, , date = '1992-02-20', time = '20:50', placeId = 'seoul', sex = 'female'] = process.argv;
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:4173/api/reading';

/** field path -> word ceiling, straight from the prompt. */
const BUDGETS = {
  identity: 90,
  elements: 90,
  strengths: 85,
  'themes[0].body': 55,
  'themes[1].body': 55,
  'themes[2].body': 55,
  'career.body': 100,
  love: 110,
  family: 85,
  'chapters.summary': 45,
  'chapters.now': 50,
  'chapters.next': 45,
  'advice.stop': 35,
  'advice.keep': 35,
  'advice.truth': 30,
};

/**
 * Words and phrases that mean the plain-language rules slipped. Flagged rather
 * than failed, since context matters — but they are what to look at first.
 */
const JARGON = [
  'day master', 'pillar', 'stem', 'branch', 'hollow', 'Tomb stage', 'Severance',
  'the universe', 'energies', 'cosmic',
  // The payload names the ten relationships; the model likes to quote them back
  // as "the Creator force in your chart", which tells the reader nothing.
  'Challenger star', 'Creator star', 'Challenger force', 'Creator force',
  'Peer force', 'Rival force', 'Performer force', 'Nurturer force',
  'Officer force', 'force in your chart',
];

const TOTAL_BUDGET = 1000;

const words = (s) => (typeof s === 'string' ? s.trim().split(/\s+/).filter(Boolean).length : 0);
const get = (obj, path) =>
  path.replace(/\[(\d+)\]/g, '.$1').split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

const { birth, place } = buildBirth({ date, time, placeId });
const chart = computeChart(birth);
const analysis = analyseChart(chart);
const cycles = majorCycles(chart, sex);
const art = soulAnimal(chart.pillars.day.cycle);

const payload = buildPayload(chart, analysis, cycles, {
  animal: art.animal,
  description: art.line,
});

console.log(`\n  ${date} ${time}, ${sex}, ${place.name}`);
console.log(`  ${['year', 'month', 'day', 'hour'].map((k) => chart.pillars[k]?.label.hanja ?? '--').join(' ')}`);
console.log(`  Soul animal: ${art.animal} (${art.name}, day pillar ${art.n} of 60)\n`);
console.log('  calling the reader...\n');

const started = Date.now();
let response;
try {
  response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
} catch (error) {
  console.error(`  Could not reach ${ENDPOINT}`);
  console.error(`  Is the dev server running?  ANTHROPIC_API_KEY=... npm run dev\n`);
  process.exit(1);
}

const elapsed = ((Date.now() - started) / 1000).toFixed(1);

if (!response.ok) {
  console.error(`  ${response.status}: ${await response.text()}\n`);
  process.exit(1);
}

const raw = await response.json();

// Count what the reader marked itself, before the gaps get filled, so the
// table can show how much of the highlighting is the model's work.
const fromModel = (JSON.stringify(raw).match(/\*\*(.+?)\*\*/g) ?? []).length;
const reading = ensureHighlights(raw);

// --- the prose -------------------------------------------------------------
const show = (title, text) => {
  if (!text) return;
  console.log(`\n  ── ${title} ${'─'.repeat(Math.max(0, 58 - title.length))}\n`);
  for (const line of wrap(text, 72)) console.log(`  ${line}`);
};

show('WHO THE CHART SAYS YOU ARE', reading.identity);
show('THE FIVE ELEMENTS IN YOU', reading.elements);
show('WHAT YOU HAVE GOING FOR YOU', reading.strengths);
for (const [i, theme] of (reading.themes ?? []).entries()) {
  show(`PATTERN ${i + 1}: ${theme.title ?? ''}`, theme.body);
}
show('WORK & MONEY', [
  reading.career?.body,
  (reading.career?.fits ?? []).map((f) => `  + ${f}`).join('\n'),
  (reading.career?.avoid ?? []).map((a) => `  - ${a}`).join('\n'),
].filter(Boolean).join('\n\n'));
show('LOVE  [collapsed]', reading.love);
show('FAMILY  [collapsed]', reading.family);
show('CHAPTERS  [collapsed]', [reading.chapters?.summary, reading.chapters?.now, reading.chapters?.next]
  .filter(Boolean).join('\n\n'));
show('ADVICE', [
  `STOP  ${reading.advice?.stop}`,
  `KEEP  ${reading.advice?.keep}`,
  `TRUTH ${reading.advice?.truth}`,
].join('\n\n'));

// --- the table that matters ------------------------------------------------
console.log(`\n\n  ── BUDGET CHECK ${'─'.repeat(44)}\n`);
console.log(`  ${'field'.padEnd(22)}${'words'.padStart(6)}${'budget'.padStart(8)}   `);

let total = 0;
let overruns = 0;
for (const [path, budget] of Object.entries(BUDGETS)) {
  const value = get(reading, path);
  const n = words(value);
  total += n;
  const over = n > budget;
  if (over) overruns++;
  const flag = value == null ? '  MISSING' : over ? `  OVER by ${n - budget}` : '';
  console.log(`  ${path.padEnd(22)}${String(n).padStart(6)}${String(budget).padStart(8)}${flag}`);
}

console.log(`  ${'─'.repeat(36)}`);
console.log(`  ${'TOTAL'.padEnd(22)}${String(total).padStart(6)}${String(TOTAL_BUDGET).padStart(8)}` +
  (total > TOTAL_BUDGET ? `  OVER by ${total - TOTAL_BUDGET}` : ''));
console.log(`\n  ${overruns} of ${Object.keys(BUDGETS).length} fields over budget` +
  `  ·  ${elapsed}s  ·  ~${Math.round(total / 200 * 10) / 10} min read\n`);

if (overruns > 2 || total > TOTAL_BUDGET) {
  console.log('  -> The budgets are being ignored. Tighten rule 1 in api/_prompt.js,');
  console.log('     or move the word caps into each field description.\n');
}

// --- plain-language check -------------------------------------------------
const whole = JSON.stringify(reading).toLowerCase();
const found = JARGON.filter((term) => whole.includes(term.toLowerCase()));
if (found.length) {
  console.log(`  JARGON SLIPPED THROUGH: ${found.join(', ')}`);
  console.log('     Check each one is explained in brackets, or tighten rule 3.\n');
} else {
  console.log('  Plain language: no flagged jargon.\n');
}

const korean = JSON.stringify(reading).match(/[가-힯㄰-㆏一-鿿]/g);
if (korean) console.log(`  KOREAN/HANJA IN OUTPUT: ${[...new Set(korean)].join('')}\n`);

// --- highlights -----------------------------------------------------------
const gaps = missingHighlights(reading);
const marks = (JSON.stringify(reading).match(/\*\*(.+?)\*\*/g) ?? []).length;
console.log(`  Highlights: ${marks} across ${marks + gaps.length} sections` +
  (gaps.length ? `  MISSING: ${gaps.join(', ')}` : '  (every section covered)'));
if (fromModel !== null) {
  console.log(`              ${fromModel} written by the reader, ${marks - fromModel} filled in\n`);
} else {
  console.log('');
}

function wrap(text, width) {
  const out = [];
  for (const para of String(text).split('\n')) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of para.split(/\s+/)) {
      if (line && (line + ' ' + word).length > width) { out.push(line); line = word; }
      else line = line ? line + ' ' + word : word;
    }
    if (line) out.push(line);
  }
  return out;
}
