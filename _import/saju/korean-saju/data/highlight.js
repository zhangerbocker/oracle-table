/**
 * Guarantee one highlighted phrase per section.
 *
 * The reading is asked to wrap its key phrase in **asterisks**, but a model
 * reliably marks only two or three fields out of twelve however firmly it is
 * told otherwise. Rather than keep tightening the prompt, this fills the gaps:
 * if a field came back unmarked, pick its strongest sentence and mark that.
 *
 * Deterministic, so the same reading always highlights the same line.
 */

/** Fields that are prose and should carry a highlight. */
const PROSE_PATHS = [
  'identity',
  'elements',
  'strengths',
  'career.body',
  'love',
  'family',
  'chapters.summary',
  'chapters.now',
  'chapters.next',
  'advice.stop',
  'advice.keep',
  'advice.truth',
];

const hasMark = (text) => /\*\*.+?\*\*/.test(text);
const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Score a sentence on how much it deserves to be the line someone underlines.
 *
 * What makes a good highlight here is a direct claim about the reader, short
 * enough to read in one glance. Setup sentences and long qualified ones lose.
 */
function score(sentence, index, total) {
  const words = wordCount(sentence);
  let n = 0;

  if (/^you\b/i.test(sentence.trim())) n += 4;        // a claim about them
  if (/\byou\b/i.test(sentence)) n += 1;

  if (words >= 6 && words <= 16) n += 4;
  else if (words >= 17 && words <= 22) n += 2;
  else if (words > 26) n -= 3;
  else if (words < 5) n -= 2;

  // Sentences that name a mechanism tend to be the memorable ones.
  if (/\b(because|which means|so you|until|instead)\b/i.test(sentence)) n += 1;

  if (index === 0 && total > 1) n -= 1;               // usually scene-setting
  if (index === total - 1 && total > 1) n += 1;       // usually the punch

  return n;
}

/**
 * Trim an over-long sentence down to its first clause, so the highlight stays
 * a phrase rather than becoming a highlighted paragraph.
 */
function tighten(sentence) {
  const trimmed = sentence.trim();
  if (wordCount(trimmed) <= 18) return trimmed;

  // Prefer a clause break; fall back to the first 14 words.
  const clause = trimmed.split(/\s+(?=[—–-]\s)|,\s|;\s/)[0];
  if (clause && wordCount(clause) >= 5 && wordCount(clause) <= 18) return clause.trim();

  return trimmed.split(/\s+/).slice(0, 14).join(' ');
}

/** Add a highlight to one string if it has none. */
export function ensureHighlight(text) {
  if (typeof text !== 'string' || !text.trim()) return text;
  if (hasMark(text)) return text;

  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (!sentences.length) return text;

  let best = null;
  let bestScore = -Infinity;
  sentences.forEach((sentence, i) => {
    const n = score(sentence, i, sentences.length);
    if (n > bestScore) { bestScore = n; best = sentence; }
  });
  if (!best) return text;

  const phrase = tighten(best);
  // Mark the first occurrence only, and only if it is still present verbatim.
  const at = text.indexOf(phrase);
  if (at === -1) return text;

  return text.slice(0, at) + '**' + phrase + '**' + text.slice(at + phrase.length);
}

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
const set = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o == null ? o : o[k]), obj);
  if (target && last in target) target[last] = value;
};

/**
 * Make sure every prose section of a reading carries at least one highlight.
 * Mutates and returns the reading.
 */
export function ensureHighlights(reading) {
  if (!reading || typeof reading !== 'object') return reading;

  for (const path of PROSE_PATHS) {
    const value = get(reading, path);
    if (typeof value === 'string') set(reading, path, ensureHighlight(value));
  }

  for (const theme of reading.themes ?? []) {
    if (theme && typeof theme.body === 'string') theme.body = ensureHighlight(theme.body);
  }

  return reading;
}

/** Which prose fields still lack a highlight. Empty when all is well. */
export function missingHighlights(reading) {
  const missing = [];
  for (const path of PROSE_PATHS) {
    const value = get(reading, path);
    if (typeof value === 'string' && value.trim() && !hasMark(value)) missing.push(path);
  }
  (reading.themes ?? []).forEach((t, i) => {
    if (t?.body && !hasMark(t.body)) missing.push(`themes[${i}].body`);
  });
  return missing;
}
