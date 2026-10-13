/**
 * A plain-English summary of what a chart actually contains.
 *
 * This is deliberately *not* the reading. It states facts the engine is certain
 * of — what you have most of, what you have none of — in one short paragraph,
 * so the chart means something the instant it appears and still means something
 * if the reading service is unreachable. Interpretation is the reader's job.
 */

import { ELEMENT_INFO } from '../engine/constants.js';

/** What an abundance of each element does. Kept to a clause. */
const ABUNDANT = {
  wood: 'builds and expands, and starts more than it finishes',
  fire: 'runs hot and visible, and burns through its fuel fast',
  earth: 'settles and accumulates, and resists being moved',
  metal: 'cuts and finishes, and holds standards other people find sharp',
  water: 'adapts and goes deep, and rarely stays in one shape',
};

/** What an absence costs. */
const ABSENT = {
  wood: 'beginnings are hard — the blank page costs you more than it costs other people',
  fire: 'you under-signal, and get read as uninterested when you are the opposite',
  earth: 'nothing settles, and routine will feel like a cage while working like a keel',
  metal: 'endings are hard, and you keep things long past their usefulness',
  water: 'you act before you reflect, and skip the step where you ask what is really going on',
};

const list = (items) => {
  const names = items.map((e) => ELEMENT_INFO[e].en);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

/**
 * One short paragraph describing the balance of a chart.
 * @param {object} balance From {@link elementBalance}
 * @param {number} total Number of visible characters (8, or 6 with no birth time)
 */
export function describeBalance(balance, total = 8) {
  const { simple, absent } = balance;
  const ranked = [...Object.keys(simple)].sort((a, b) => simple[b] - simple[a]);

  const top = ranked[0];
  const topCount = simple[top];
  // A tie at the top means the chart is spread, not dominated.
  const tied = ranked.filter((e) => simple[e] === topCount);

  const parts = [];
  // A chart with no dominant element is a different story from a lopsided one,
  // and the two descriptions must not end up arguing with each other below.
  const even = tied.length >= 3;

  if (even) {
    parts.push(
      `Your chart is unusually even — no element takes charge. ` +
      `That is rarer than it sounds, and it means nothing in you is exaggerated enough to carry you on its own.`,
    );
  } else if (tied.length === 2) {
    parts.push(
      `${list(tied)} share the lead at ${topCount} of your ${total} characters. ` +
      `A chart split between two forces pulls in two directions, and you will feel it as indecision that is really just balance.`,
    );
  } else {
    parts.push(
      `${ELEMENT_INFO[top].en} is strongest — ${topCount} of your ${total} characters. ` +
      `A chart weighted this way ${ABUNDANT[top]}.`,
    );
  }

  if (absent.length === 1) {
    parts.push(`${ELEMENT_INFO[absent[0]].en} is missing entirely: ${ABSENT[absent[0]]}.`);
  } else if (absent.length > 1) {
    const [first, ...rest] = absent;
    parts.push(
      `${list(absent)} are missing entirely. With no ${ELEMENT_INFO[first].en}, ${ABSENT[first]}` +
      (rest.length === 1 ? `; with no ${ELEMENT_INFO[rest[0]].en}, ${ABSENT[rest[0]]}` : '') + '.',
    );
  } else if (!even) {
    // Nothing is missing outright, but something is still the weak point.
    const thin = ranked[ranked.length - 1];
    parts.push(
      `Every element is present, which sounds like balance and is not — ` +
      `${ELEMENT_INFO[thin].en} is thin enough to behave like an absence: ${ABSENT[thin]}.`,
    );
  } else {
    // An even chart with nothing missing: say what that costs, without
    // contradicting the sentence above by calling anything scarce.
    parts.push(
      `Nothing is missing either, so there is no single gap to point at. ` +
      `Charts like this are adaptable and slow to specialise.`,
    );
  }

  return parts.join(' ');
}

/**
 * A score out of 100 for how well put together a chart is.
 *
 * A caveat worth stating plainly: the tradition has no such number, and no
 * serious practitioner would give one. Every chart has something it is good
 * for. What this actually measures is BALANCE — how evenly the five elements
 * are spread, whether your own element has enough support to act on, and
 * whether anything is missing outright. That is a real thing the tradition
 * cares about, and it is the honest thing to put a number on.
 *
 * Scored so that a typical chart lands in the sixties or seventies. Nobody
 * should open their fortune and be told they are a 12.
 */
export function chartScore(balance, strength) {
  const counts = Object.values(balance.simple);
  const total = counts.reduce((a, b) => a + b, 0) || 1;

  // 1. Evenness, 0-40. Compare against a perfectly flat spread.
  const ideal = total / 5;
  const spread = counts.reduce((sum, n) => sum + Math.abs(n - ideal), 0);
  const worstSpread = 2 * (total - ideal); // everything piled on one element
  const evenness = Math.round(40 * (1 - spread / worstSpread));

  // 2. Support, 0-35. Being close to balanced beats being extreme either way.
  const distanceFromBalanced = Math.abs(strength.ratio - 0.5); // 0 .. 0.5
  const support = Math.round(35 * (1 - Math.min(1, distanceFromBalanced / 0.32)));

  // 3. Completeness, 0-25. Each missing element costs.
  const completeness = Math.max(0, 25 - balance.absent.length * 14);

  const raw = evenness + support + completeness;
  // Compress into 38-96: a chart is never worthless, and never perfect.
  const score = Math.round(38 + (raw / 100) * 58);

  // A chart with a hole in it is never "exceptionally balanced", however evenly
  // the remaining elements are spread. The label has to respect that even when
  // the arithmetic does not.
  const band = balance.absent.length
    ? (score >= 72 ? { label: 'Strong, with one thing missing', tone: 'good' }
      : score >= 60 ? { label: 'Workable, with a clear gap', tone: 'mid' }
      : { label: 'Strongly tilted', tone: 'low' })
    : (score >= 82 ? { label: 'Exceptionally balanced', tone: 'high' }
      : score >= 70 ? { label: 'Well balanced', tone: 'good' }
      : score >= 58 ? { label: 'Workable', tone: 'mid' }
      : { label: 'Strongly tilted', tone: 'low' });

  return {
    score,
    ...band,
    parts: { evenness, support, completeness },
    /** What the number is actually saying, in one sentence. */
    note: scoreNote(score, balance, strength),
  };
}

function scoreNote(score, balance, strength) {
  if (balance.absent.length > 1) {
    return 'Two elements are missing outright, which is what pulls this down — ' +
      'it means two whole modes of operating are not naturally available to you.';
  }
  if (balance.absent.length === 1) {
    return `One element is missing, so this chart does one thing conspicuously ` +
      `badly and other things well. That is more useful than being average at everything.`;
  }
  if (score >= 78) {
    return 'Nothing is missing and nothing dominates. You have more options than ' +
      'most people, which is its own problem — you may never be forced to specialise.';
  }
  if (!strength.strong) {
    return 'Everything is present, but your own element is outnumbered: you have ' +
      'the full range available and not much power behind any of it.';
  }
  return 'Everything is present and you have the force to use it. The risk is ' +
    'momentum rather than lack.';
}

/** A one-line verdict on how well supported the day master is. */
export function describeStrength(strength, dayElement) {
  const name = ELEMENT_INFO[dayElement].en;
  const reaching = ELEMENT_INFO[strength.useful].en;

  const base = {
    'very-strong': `Your ${name} is very well supported — more force available than most situations need.`,
    strong: `Your ${name} is well supported, and holds its position under pressure.`,
    weak: `Your ${name} is outnumbered: you run on support rather than reserves, so environment matters enormously.`,
    'very-weak': `Your ${name} is heavily outnumbered — almost everything here pulls at it, and very little feeds it.`,
  }[strength.label];

  return `${base} What the chart reaches for is ${reaching}.`;
}
