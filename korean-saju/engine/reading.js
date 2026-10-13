/**
 * Assembles a chart plus its analysis into a structured, renderable reading.
 *
 * The output is plain data -- no HTML, no DOM. Whatever renders it (this app's
 * vanilla UI today, a React component later) decides how it looks.
 */

import { computeChart } from './pillars.js';
import { analyseChart, tenGod } from './analysis.js';
import { ELEMENT_INFO, STEMS, BRANCHES, PRINCIPAL_STEM, mod, pillarLabel } from './constants.js';
import {
  DAY_MASTERS, STRENGTH_READINGS, ELEMENT_DOMINANT, ELEMENT_MISSING,
  TEN_GOD_READINGS, USEFUL_ELEMENT, ANNUAL_READINGS, SEASON_NOTES,
} from './content.js';

/**
 * Build the full reading.
 *
 * @param {object} birth    See {@link computeChart}
 * @param {object} [options]
 * @param {number} [options.forYear] 사주 year to read the forecast for.
 *                                   Defaults to the current one.
 */
export function generateReading(birth, options = {}) {
  const chart = computeChart(birth, options);
  const analysis = analyseChart(chart);

  const dayMaster = DAY_MASTERS[chart.dayMasterIndex];
  const stem = STEMS[chart.dayMasterIndex];
  const element = stem.element;

  // --- 세운: the year ahead ------------------------------------------------
  const forYear = options.forYear ?? currentSajuYear();
  const annualStem = mod(forYear - 4, 10);
  const annualBranch = mod(forYear - 4, 12);
  const annualGod = tenGod(chart.dayMasterIndex, annualStem);

  // --- 월령: the season of birth -------------------------------------------
  const seasonElement = STEMS[PRINCIPAL_STEM[chart.monthBranchIndex]].element;

  const { balance, strength } = analysis;

  return {
    chart,
    analysis,

    /** The one-line identity. */
    headline: {
      title: dayMaster.title,
      stem: { ko: stem.ko, hanja: stem.hanja, en: stem.en },
      element,
      elementInfo: ELEMENT_INFO[element],
      polarity: stem.yin ? 'yin' : 'yang',
      image: dayMaster.image,
      subtitle: `${stem.yin ? 'Yin' : 'Yang'} ${ELEMENT_INFO[element].en} · ${stem.ko}${stem.hanja} day master`,
    },

    sections: [
      {
        id: 'self',
        title: 'Who the chart says you are',
        body: dayMaster.essence,
        strengths: dayMaster.strengths,
        shadow: dayMaster.shadow,
        atBest: dayMaster.atBest,
        atWorst: dayMaster.atWorst,
      },
      {
        id: 'season',
        title: 'The season you arrived in',
        body:
          `You were ${SEASON_NOTES[seasonElement]} — the ${chart.pillars.month.branch.ko}` +
          `${chart.pillars.month.branch.hanja} month, opening at ${chart.solarTerm.opening.en} ` +
          `(${chart.solarTerm.opening.ko}). ` +
          seasonVerdict(strength),
      },
      {
        id: 'strength',
        title: STRENGTH_READINGS[strength.label].label,
        body: STRENGTH_READINGS[strength.label].summary,
        detail: STRENGTH_READINGS[strength.label].meaning,
        advice: STRENGTH_READINGS[strength.label].advice,
        ratio: strength.ratio,
      },
      {
        id: 'elements',
        title: ELEMENT_DOMINANT[balance.dominant].headline,
        body: ELEMENT_DOMINANT[balance.dominant].text,
        missing: balance.missing.map((e) => ({
          element: e,
          info: ELEMENT_INFO[e],
          text: ELEMENT_MISSING[e],
        })),
      },
      {
        id: 'gods',
        title: TEN_GOD_READINGS[analysis.dominantGod].headline,
        body: TEN_GOD_READINGS[analysis.dominantGod].text,
      },
      {
        id: 'useful',
        title: `What this chart is reaching for: ${ELEMENT_INFO[strength.useful].en}`,
        body: USEFUL_ELEMENT[strength.useful].text,
        element: strength.useful,
        elementInfo: ELEMENT_INFO[strength.useful],
        directions: USEFUL_ELEMENT[strength.useful].directions,
        season: USEFUL_ELEMENT[strength.useful].season,
        colours: USEFUL_ELEMENT[strength.useful].colours,
      },
    ],

    /** The forward-looking part -- the actual "fortune". */
    forecast: {
      year: forYear,
      pillar: pillarLabel(annualStem, annualBranch),
      animal: BRANCHES[annualBranch].animal,
      god: annualGod,
      body: ANNUAL_READINGS[annualGod.key],
      favourable: USEFUL_ELEMENT[strength.useful],
      usefulElement: strength.useful,
    },

    /** Honest caveats, shown rather than hidden. */
    notes: buildNotes(chart),
  };
}

/**
 * What being born in (or out of) your own season actually did for you.
 *
 * 득령 (holding the season) and overall strength usually agree, but not always
 * — a chart can hold the month and still be outnumbered by everything else.
 * That tension is a real pattern, so the text names it instead of contradicting
 * itself two paragraphs later.
 */
function seasonVerdict(strength) {
  if (strength.hasSeason && strength.strong) {
    return 'That season feeds your day master directly — 득령, holding the season. It is the single ' +
      'largest source of strength in any chart, and the rest of your chart agrees with it. You arrive with backing.';
  }
  if (strength.hasSeason && !strength.strong) {
    return 'That season feeds your day master directly — 득령, holding the season. But the rest of the ' +
      'chart does not follow through: you were born with the season on your side and everything after it ' +
      'asking for something. It makes for a particular kind of person, one who knows they should be ' +
      'stronger than they feel.';
  }
  if (!strength.hasSeason && strength.strong) {
    return 'That season does not feed your day master — 실령, out of season. Yet the chart is strong ' +
      'anyway, which means your support came from elsewhere: company, resources, timing. You built it ' +
      'rather than inherited it, and that tends to show.';
  }
  return 'That season does not feed your day master — 실령, out of season. Your strength has to come ' +
    'from the room you are in rather than from anything you were handed. You arrive having to build it.';
}

/** The 사주 year we are currently in (turns at 입춘, not 1 January). */
export function currentSajuYear(now = new Date()) {
  const year = now.getUTCFullYear();
  // 입춘 is always 3-5 February. Anything before February 4 belongs to the
  // previous 사주 year; computeChart does this exactly, this is the cheap version.
  const beforeSpring =
    now.getUTCMonth() === 0 || (now.getUTCMonth() === 1 && now.getUTCDate() < 4);
  return beforeSpring ? year - 1 : year;
}

function buildNotes(chart) {
  const notes = [];

  if (chart.timing.timeUnknown) {
    notes.push(
      'No birth time was given, so the 시주 (hour pillar) is missing. That is a quarter of the ' +
      'chart — the part traditionally read for later life and for children. Everything else still stands.',
    );
  }

  if (Math.abs(chart.timing.correctionMinutes) >= 1) {
    const mins = Math.round(chart.timing.correctionMinutes);
    const dir = mins < 0 ? 'behind' : 'ahead of';
    notes.push(
      `Your birth time was adjusted by ${Math.abs(mins)} minutes to true solar time — the sun at ` +
      `your birthplace runs ${Math.abs(mins)} minutes ${dir} the clock on the wall. ` +
      `Clock ${pad(chart.timing.clockTime.hour)}:${pad(chart.timing.clockTime.minute)} ` +
      `→ solar ${pad(chart.timing.solarTime.hour)}:${pad(chart.timing.solarTime.minute)}.`,
    );
  }

  if (chart.solarTerm.nearBoundary) {
    const mins = Math.round(
      Math.min(chart.solarTerm.minutesSinceOpening, chart.solarTerm.minutesUntilNext),
    );
    notes.push(
      `You were born within ${mins} minutes of a 절기 boundary, where the 월주 (month pillar) ` +
      'changes. If your recorded birth time is off by even an hour, this chart could belong to the ' +
      'neighbouring month instead.',
    );
  }

  return notes;
}

const pad = (n) => String(n).padStart(2, '0');
