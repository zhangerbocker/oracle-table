/**
 * Turning a computed chart into the payload the reader model receives, and
 * calling the serverless function that talks to Parley.
 *
 * The chart itself is computed locally and instantly. Only the *interpretation*
 * requires a network call, which is why the page renders the 만세력 immediately
 * and fills the reading in afterwards.
 */

import { computeChart } from './pillars.js';
import { analyseChart, majorCycles, tenGod } from './analysis.js';
import { HIDDEN_STEMS, STEMS, TEN_GODS } from './constants.js';
import { soulAnimal } from '../data/soul-animals.js';
import { ensureHighlights } from '../data/highlight.js';

/** Where the serverless function lives. Same origin, so no CORS. */
const ENDPOINT = '/api/reading';

// ---------------------------------------------------------------------------
// Payload
// ---------------------------------------------------------------------------

/**
 * Everything the model needs, and nothing it does not.
 *
 * Deliberately pre-digested: the model should spend its attention on
 * interpretation, not on re-deriving 십성 from raw stems. Anything the engine
 * can state as a fact is stated as a fact.
 */
export function buildPayload(chart, analysis, cycles, imageryText) {
  /**
   * What each of the four pillars is traditionally held to govern. Supplied in
   * plain English because the model writes with the vocabulary it is given: fed
   * "hour pillar" it writes "your hour pillar is hollow", which means nothing
   * to the reader. Fed "later life", it writes about later life.
   */
  const COVERS = {
    year: 'early life, and the family you came from',
    month: 'upbringing, parents, and working life',
    day: 'you yourself, and your closest relationship',
    hour: 'later life, children, and what you produce',
  };

  // Everything here is pre-translated and de-jargoned. The reading is
  // English-only and plain-language; a model shown technical terms will reach
  // for them no matter what the prompt says.
  const pillar = (kind) => {
    const p = chart.pillars[kind];
    if (!p) return null;
    const stage = analysis.stages[kind].forDayMaster;
    return {
      covers: COVERS[kind],
      isYou: kind === 'day' || undefined,
      element: `${p.stem.yin ? 'yin' : 'yang'} ${p.stem.element}`,
      sign: `${p.branch.element} (${p.branch.animal})`,
      forceAtWork: kind === 'day' ? undefined : tenGod(chart.dayMasterIndex, p.stemIndex).en,
      alsoCarries: HIDDEN_STEMS[p.branchIndex]
        .map((h) => `${STEMS[h.stem].element} ${tenGod(chart.dayMasterIndex, h.stem).en}`)
        .join(', '),
      phase: `${stage.en} — ${stage.note}`,
      thisAreaIsEmpty: analysis.voids.affected.some((v) => v.kind === kind) || undefined,
    };
  };

  const current = currentCycle(cycles, chart);

  return {
    imagery: imageryText,

    birth: {
      date: `${chart.timing.solarDate.year}-${pad(chart.timing.solarDate.month)}-${pad(chart.timing.solarDate.day)}`,
      clockTime: `${pad(chart.timing.clockTime.hour)}:${pad(chart.timing.clockTime.minute)}`,
      trueSolarTime: `${pad(chart.timing.solarTime.hour)}:${pad(chart.timing.solarTime.minute)}`,
      timeKnown: !chart.timing.timeUnknown,
    },

    pillars: {
      hour: pillar('hour'),
      day: pillar('day'),
      month: pillar('month'),
      year: pillar('year'),
    },

    yourCoreElement: {
      element: chart.dayMaster.element,
      polarity: chart.dayMaster.yin ? 'yin' : 'yang',
    },

    howWellSupported: {
      verdict: analysis.strength.label,
      ratio: Number(analysis.strength.ratio.toFixed(2)),
      note: analysis.strength.hasSeason
        ? 'born in a season that feeds their core element'
        : 'born in a season that does not feed their core element',
    },

    elements: {
      visibleCount: analysis.balance.simple,
      weightedPercent: Object.fromEntries(
        Object.entries(analysis.balance.percent).map(([k, v]) => [k, Math.round(v)]),
      ),
      absent: analysis.balance.absent,
      dominant: analysis.balance.dominant,
      reachingFor: analysis.strength.useful,
      avoid: analysis.strength.unfavourable,
    },

    forcesAtWork: {
      tally: Object.fromEntries(
        Object.entries(analysis.godTally).map(([key, n]) => [TEN_GODS[key].en, n]),
      ),
      strongest: TEN_GODS[analysis.dominantGod].en,
      strongestFamily: analysis.dominantGroup,
    },

    balanceOfYinAndYang: `${analysis.polarity.yang} yang / ${analysis.polarity.yin} yin out of 8`,

    emptyAreasOfLife: analysis.voids.affected.map((v) => COVERS[v.kind]),

    seasonRuledBy: `${analysis.commander.stem.element}`,

    lifeChapters: {
      note: 'Life divides into ten-year chapters. Describe them as periods of a life, not as technical cycles.',
      direction: cycles.forward ? 'forward' : 'reverse',
      firstChapterStartsAtAge: cycles.startAge,
      current: current && {
        ageRange: `${current.age}-${current.age + 9}`,
        forceAtWork: current.god.en,
        phase: current.stage.en,
      },
      next: current && nextAfter(cycles, current),
      all: cycles.cycles.map((c) => `age ${c.age}: ${c.god.en}`),
    },
  };
}

function currentCycle(cycles, chart) {
  const age = approximateAge(chart);
  // The cycle whose starting age is the highest one not yet passed.
  let found = null;
  for (const c of cycles.cycles) {
    if (age >= c.age) found = c;
  }
  return found ?? cycles.cycles[0];
}

function nextAfter(cycles, current) {
  const i = cycles.cycles.indexOf(current);
  const next = cycles.cycles[i + 1];
  if (!next) return null;
  return {
    ageRange: `${next.age}-${next.age + 9}`,
    forceAtWork: next.god.en,
    phase: next.stage.en,
  };
}

/** Good enough for picking a 대운 — exact birthdays do not change the decade. */
function approximateAge(chart) {
  const now = new Date();
  return now.getUTCFullYear() - chart.timing.solarDate.year;
}

const pad = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// The call
// ---------------------------------------------------------------------------

/**
 * Generate a reading for a birth.
 *
 * @param {object} birth        See computeChart
 * @param {object} options
 * @param {'male'|'female'} options.sex
 * @param {object} [options.imageryText]  { name, description } for the 물상
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{reading: object, payload: object}>}
 */
export async function generateNarrative(birth, { sex, imageryText, signal } = {}) {
  const chart = computeChart(birth);
  const analysis = analyseChart(chart);
  const cycles = majorCycles(chart, sex ?? 'female');

  const art = soulAnimal(chart.pillars.day.cycle);
  const payload = buildPayload(chart, analysis, cycles, {
    animal: art.animal,
    description: imageryText?.description ?? art.line,
  });

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new ReadingError(response.status, detail);
  }

  // The reader marks its own key phrases, but only ever a few of them. Fill in
  // the rest so every section has one.
  const reading = ensureHighlights(await response.json());
  return { reading, chart, analysis, cycles, art, payload };
}

export class ReadingError extends Error {
  constructor(status, detail) {
    super(`Reading request failed (${status})`);
    this.status = status;
    this.detail = detail;
  }
}

/** Compute everything local, with no network call -- used to render the chart
 *  immediately while the reading is still in flight. */
export function computeLocal(birth, sex = 'female') {
  const chart = computeChart(birth);
  const analysis = analyseChart(chart);
  const cycles = majorCycles(chart, sex);
  return { chart, analysis, cycles, art: soulAnimal(chart.pillars.day.cycle) };
}
