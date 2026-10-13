/**
 * Reading a chart: 오행 balance, 십신 relationships, and 신강/신약.
 *
 * The pillars are just eight characters. Everything that makes a 사주 *mean*
 * something comes from how those characters relate to the 일간 (day stem) --
 * which the tradition treats as "you".
 */

import {
  ELEMENTS, STEMS, BRANCHES, HIDDEN_STEMS, PRINCIPAL_STEM,
  GENERATES, CONTROLS, GENERATED_BY, CONTROLLED_BY, TEN_GODS,
  lifeStage, voidBranches,
} from './constants.js';

// ---------------------------------------------------------------------------
// 십신 (Ten Gods)
// ---------------------------------------------------------------------------

/**
 * The relationship a stem has to the day master.
 * @param {number} dayStemIndex  The 일간
 * @param {number} otherIndex    Any other stem (visible or hidden)
 * @returns {{key: string} & typeof TEN_GODS[string]}
 */
export function tenGod(dayStemIndex, otherIndex) {
  const me = STEMS[dayStemIndex];
  const other = STEMS[otherIndex];
  const samePolarity = me.yin === other.yin;

  let key;
  if (other.element === me.element) {
    key = samePolarity ? 'bigyeon' : 'geopjae';
  } else if (other.element === GENERATES[me.element]) {
    key = samePolarity ? 'siksin' : 'sanggwan';
  } else if (other.element === CONTROLS[me.element]) {
    key = samePolarity ? 'pyeonjae' : 'jeongjae';
  } else if (other.element === CONTROLLED_BY[me.element]) {
    key = samePolarity ? 'pyeongwan' : 'jeonggwan';
  } else {
    key = samePolarity ? 'pyeonin' : 'jeongin';
  }
  return { key, ...TEN_GODS[key] };
}

/** The 십신 a *branch* carries, taken from its 본기 (principal hidden stem). */
export function branchTenGod(dayStemIndex, branchIndex) {
  return tenGod(dayStemIndex, PRINCIPAL_STEM[branchIndex]);
}

// ---------------------------------------------------------------------------
// 오행 distribution
// ---------------------------------------------------------------------------

/**
 * How much of each element the chart actually holds.
 *
 * Visible stems count for their face value. Branches are counted through their
 * 지장간 (hidden stems), weighted by how many days of the month each governs --
 * so 寅 reads mostly as Wood but carries a little Fire and Earth too.
 *
 * The 월지 (month branch) gets extra weight: it is the 월령, the season you were
 * born into, and it dominates how strong every other element feels.
 */
export function elementBalance(chart) {
  const scores = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));
  const MONTH_BRANCH_BONUS = 1.6;

  /**
   * The plain headcount every 만세력 prints: one point per visible character,
   * eight points total, 지장간 ignored. Less analytically useful than the
   * weighted score below, but it is the number people recognise, so it is what
   * the page shows.
   */
  const simple = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));

  const visible = [];
  const hidden = [];

  for (const kind of ['year', 'month', 'day', 'hour']) {
    const pillar = chart.pillars[kind];
    if (!pillar) continue;

    simple[pillar.stem.element] += 1;
    simple[pillar.branch.element] += 1;

    // Visible stem.
    scores[pillar.stem.element] += 1;
    visible.push({ kind, position: 'stem', element: pillar.stem.element });

    // Branch, opened up into its hidden stems.
    const weight = kind === 'month' ? MONTH_BRANCH_BONUS : 1;
    const parts = HIDDEN_STEMS[pillar.branchIndex];
    const totalDays = parts.reduce((sum, p) => sum + p.days, 0);
    for (const part of parts) {
      const share = (part.days / totalDays) * weight;
      scores[STEMS[part.stem].element] += share;
      hidden.push({
        kind,
        stemIndex: part.stem,
        element: STEMS[part.stem].element,
        share,
        principal: part.stem === PRINCIPAL_STEM[pillar.branchIndex],
      });
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const percent = Object.fromEntries(
    ELEMENTS.map((e) => [e, total ? (scores[e] / total) * 100 : 0]),
  );

  const ranked = [...ELEMENTS].sort((a, b) => scores[b] - scores[a]);
  // An element under ~7% of the chart is effectively absent from it.
  const missing = ELEMENTS.filter((e) => percent[e] < 7);

  // Absent from the plain headcount is a stronger claim than merely scarce --
  // it is what a 만세력 shows as a zero, and it is what people react to.
  const absent = ELEMENTS.filter((e) => simple[e] === 0);

  return {
    scores, percent, total, visible, hidden, simple, absent,
    dominant: ranked[0],
    weakest: ranked[ranked.length - 1],
    ranked,
    missing,
  };
}

// ---------------------------------------------------------------------------
// 신강 / 신약 (day master strength)
// ---------------------------------------------------------------------------

/**
 * Is the day master well supported, or is it outnumbered?
 *
 * Supporting it: 비겁 (its own element) and 인성 (whatever feeds it).
 * Draining it: 식상 (what it feeds), 재성 (what it spends on), 관성 (what reins it in).
 *
 * The month branch counts double here -- being born in your own season is the
 * single biggest source of strength in the whole chart (득령).
 */
export function dayMasterStrength(chart, balance) {
  const me = chart.dayMaster.element;
  const supportive = new Set([me, GENERATED_BY[me]]);

  let support = 0;
  let drain = 0;
  for (const element of ELEMENTS) {
    if (supportive.has(element)) support += balance.scores[element];
    else drain += balance.scores[element];
  }
  // The day stem itself is the subject, not evidence of its own support.
  support -= 1;

  const monthBranch = chart.pillars.month.branchIndex;
  const monthElement = STEMS[PRINCIPAL_STEM[monthBranch]].element;
  const hasSeason = supportive.has(monthElement); // 득령

  const total = support + drain;
  let ratio = total > 0 ? support / total : 0.5;
  // 득령 / 실령 is worth more than raw counting suggests.
  ratio += hasSeason ? 0.08 : -0.08;
  ratio = Math.max(0, Math.min(1, ratio));

  let label;
  if (ratio >= 0.62) label = 'very-strong';
  else if (ratio >= 0.5) label = 'strong';
  else if (ratio >= 0.38) label = 'weak';
  else label = 'very-weak';

  const strong = ratio >= 0.5;

  // 용신 (the balancing element): a strong day master wants an outlet, a weak
  // one wants backup. Within the right family, pick whichever the chart has
  // least of -- that is the gap worth filling.
  const candidates = strong
    ? [GENERATES[me], CONTROLS[me], CONTROLLED_BY[me]] // 식상, 재성, 관성
    : [GENERATED_BY[me], me];                           // 인성, 비겁
  const useful = [...candidates].sort(
    (a, b) => balance.scores[a] - balance.scores[b],
  )[0];
  // 기신 (the element to go easy on) sits on the opposite side.
  const unfavourable = strong ? GENERATED_BY[me] : CONTROLS[me];

  return {
    ratio, label, strong, hasSeason,
    support, drain,
    useful,
    unfavourable,
    supportiveElements: [...supportive],
  };
}

// ---------------------------------------------------------------------------
// Full analysis
// ---------------------------------------------------------------------------

/**
 * 월령 (the month's commanding stem).
 *
 * A branch's 지장간 do not all rule at once -- they take turns across the solar
 * month. Whichever one holds the office on the day you were born is the 월령,
 * and it carries more weight than any other hidden stem in the chart.
 */
export function monthCommander(chart) {
  const parts = HIDDEN_STEMS[chart.monthBranchIndex];
  const daysIn = chart.solarTerm.minutesSinceOpening / 1440;

  let elapsed = 0;
  for (const part of parts) {
    elapsed += part.days;
    if (daysIn < elapsed) {
      return { stemIndex: part.stem, stem: STEMS[part.stem], daysIn };
    }
  }
  // Past the tabulated days (the month ran slightly long): the 본기 still rules.
  const last = parts[parts.length - 1];
  return { stemIndex: last.stem, stem: STEMS[last.stem], daysIn };
}

/**
 * 공망 -- the two branches left over from the day pillar's decade of the
 * sexagenary cycle. Anything sitting on them is held to be hollow: present on
 * paper, hard to actually get hold of.
 */
export function voidAnalysis(chart) {
  const fromDay = voidBranches(chart.pillars.day.cycle);
  const fromYear = voidBranches(chart.pillars.year.cycle);

  const affected = [];
  for (const kind of ['year', 'month', 'day', 'hour']) {
    const pillar = chart.pillars[kind];
    if (pillar && fromDay.includes(pillar.branchIndex)) {
      affected.push({ kind, branch: pillar.branch });
    }
  }

  return {
    fromDay: fromDay.map((b) => BRANCHES[b]),
    fromYear: fromYear.map((b) => BRANCHES[b]),
    affected,
  };
}

/**
 * 대운 (the ten-year luck cycles) -- the chapters a life is divided into.
 *
 * Direction follows 양남음녀 순행: a yang-year man or a yin-year woman runs
 * forward through the sexagenary cycle from the month pillar; a yin-year man or
 * a yang-year woman runs backward.
 *
 * The starting age (대운수) is the distance from birth to the 절기 boundary in
 * whichever direction you are travelling, counted at three days to the year.
 *
 * @param {object} chart
 * @param {'male'|'female'} sex  Required -- the tradition has no third branch here.
 * @param {number} [count=10]    How many ten-year chapters to return.
 */
export function majorCycles(chart, sex, count = 10) {
  const yearStemIsYin = STEMS[chart.pillars.year.stemIndex].yin;
  const forward = (sex === 'male') !== yearStemIsYin;

  // Distance to the boundary we are walking toward.
  const minutes = forward
    ? chart.solarTerm.minutesUntilNext
    : chart.solarTerm.minutesSinceOpening;
  const days = minutes / 1440;
  const startAge = Math.max(1, Math.round(days / 3));

  const monthCycle = chart.pillars.month.cycle;
  const cycles = [];
  for (let i = 1; i <= count; i++) {
    const cycleIndex = mod60(monthCycle + (forward ? i : -i));
    const stemIndex = cycleIndex % 10;
    const branchIndex = cycleIndex % 12;
    cycles.push({
      age: startAge + (i - 1) * 10,
      stemIndex,
      branchIndex,
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      label: { ko: STEMS[stemIndex].ko + BRANCHES[branchIndex].ko,
               hanja: STEMS[stemIndex].hanja + BRANCHES[branchIndex].hanja },
      god: tenGod(chart.dayMasterIndex, stemIndex),
      stage: lifeStage(chart.dayMasterIndex, branchIndex),
    });
  }

  return { forward, startAge, daysToBoundary: days, cycles };
}

const mod60 = (n) => ((n % 60) + 60) % 60;

/** Everything the reading layer needs, derived from a chart. */
export function analyseChart(chart) {
  const dayStem = chart.dayMasterIndex;
  const balance = elementBalance(chart);
  const strength = dayMasterStrength(chart, balance);

  // 십신 on every visible character except the day stem (which *is* you).
  const gods = [];
  for (const kind of ['year', 'month', 'day', 'hour']) {
    const pillar = chart.pillars[kind];
    if (!pillar) continue;
    if (kind !== 'day') {
      gods.push({ kind, position: 'stem', ...tenGod(dayStem, pillar.stemIndex) });
    }
    gods.push({ kind, position: 'branch', ...branchTenGod(dayStem, pillar.branchIndex) });
  }

  // Which family of relationships runs this chart?
  const groupTally = {};
  for (const g of gods) groupTally[g.group] = (groupTally[g.group] || 0) + 1;
  const dominantGroup = Object.entries(groupTally)
    .sort((a, b) => b[1] - a[1])[0][0];

  const godTally = {};
  for (const g of gods) godTally[g.key] = (godTally[g.key] || 0) + 1;
  const dominantGod = Object.entries(godTally).sort((a, b) => b[1] - a[1])[0][0];

  // 공망 is out of scope, but the yin/yang split is cheap and reads well.
  let yang = 0;
  let yin = 0;
  for (const kind of ['year', 'month', 'day', 'hour']) {
    const p = chart.pillars[kind];
    if (!p) continue;
    p.stem.yin ? yin++ : yang++;
    p.branch.yin ? yin++ : yang++;
  }

  // 십이운성: where each pillar sits in the day master's own life cycle.
  const stages = {};
  for (const kind of ['year', 'month', 'day', 'hour']) {
    const pillar = chart.pillars[kind];
    if (!pillar) continue;
    stages[kind] = {
      // Against the day master -- the reading-relevant one.
      forDayMaster: lifeStage(dayStem, pillar.branchIndex),
      // Against the pillar's own stem -- what a 만세력 prints in brackets.
      forOwnStem: lifeStage(pillar.stemIndex, pillar.branchIndex),
    };
  }

  return {
    balance,
    strength,
    gods,
    godTally,
    groupTally,
    dominantGod,
    dominantGroup,
    stages,
    commander: monthCommander(chart),
    voids: voidAnalysis(chart),
    polarity: { yang, yin, total: yang + yin },
  };
}
