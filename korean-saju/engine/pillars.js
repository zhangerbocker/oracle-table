/**
 * 사주 (Four Pillars) computation.
 *
 * Takes a birth moment and a place, and returns the eight characters:
 * year / month / day / hour, each a 천간 + 지지 pair.
 */

import {
  STEMS, BRANCHES, FIRST_MONTH_STEM, FIRST_HOUR_STEM,
  mod, pillarLabel, sexagenaryIndex,
} from './constants.js';
import {
  julianDay, fromJulianDay, monthTermsForYear, sunApparentLongitude,
} from './solarterms.js';

// ---------------------------------------------------------------------------
// Korean clock history
// ---------------------------------------------------------------------------

/**
 * Korea has not always been UTC+9. Births during the +8:30 eras or the summer
 * time experiments are recorded in a clock that was running differently, and a
 * proper 만세력 accounts for it.
 */
const KOREA_STANDARD_ERAS = [
  { from: '1908-04-01', to: '1911-12-31', offset: 8.5 },
  { from: '1912-01-01', to: '1954-03-20', offset: 9 },
  { from: '1954-03-21', to: '1961-08-09', offset: 8.5 },
  { from: '1961-08-10', to: '9999-12-31', offset: 9 },
];

/** Korean summer time periods (clocks moved forward one hour). */
const KOREA_DST = [
  ['1948-06-01', '1948-09-12'], ['1949-04-03', '1949-09-10'],
  ['1950-04-01', '1950-09-09'], ['1951-05-06', '1951-09-08'],
  ['1955-05-05', '1955-09-08'], ['1956-05-20', '1956-09-29'],
  ['1957-05-05', '1957-09-21'], ['1958-05-04', '1958-09-20'],
  ['1959-05-03', '1959-09-19'], ['1960-05-01', '1960-09-17'],
  ['1987-05-10', '1987-10-10'], ['1988-05-08', '1988-10-08'],
];

const asKey = (y, m, d) =>
  `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * The UTC offset Korean clocks actually showed on a given date, plus whether
 * summer time was in force. Returns `null` outside the recorded eras.
 */
export function koreanClockOffset(year, month, day) {
  const key = asKey(year, month, day);
  const era = KOREA_STANDARD_ERAS.find((e) => key >= e.from && key <= e.to);
  if (!era) return null;
  const dst = KOREA_DST.some(([from, to]) => key >= from && key <= to);
  return { offset: era.offset + (dst ? 1 : 0), dst, standardOffset: era.offset };
}

// ---------------------------------------------------------------------------
// Time corrections
// ---------------------------------------------------------------------------

/**
 * Minutes to add to clock time to reach local *true solar* time.
 *
 * Clocks run on a timezone meridian; the sun runs on your actual longitude.
 * Seoul sits at 127 deg E but keeps UTC+9 (the 135 deg E meridian), so the sun
 * there is about 32 minutes behind the clock -- enough to move a birth into the
 * previous 시주 (hour pillar).
 */
export function longitudeCorrectionMinutes(longitude, utcOffsetHours) {
  const timezoneMeridian = utcOffsetHours * 15;
  return (longitude - timezoneMeridian) * 4;
}

/**
 * The equation of time, in minutes: the wobble between mean solar time and
 * apparent solar time caused by Earth's tilt and elliptical orbit. Ranges about
 * +/-16 minutes. Most 만세력 ignore it; we expose it as an opt-in refinement.
 */
export function equationOfTimeMinutes(jd) {
  const t = (jd - 2451545.0) / 36525;
  const DEG = Math.PI / 180;

  const l0 = mod(280.46646 + 36000.76983 * t + 0.0003032 * t * t, 360);
  const m = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * DEG;
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;

  // Obliquity of the ecliptic, as y = tan^2(eps/2).
  const eps = (23.439291 - 0.0130042 * t) * DEG;
  const y = Math.tan(eps / 2) ** 2;

  const eot =
    y * Math.sin(2 * l0 * DEG) -
    2 * e * Math.sin(m) +
    4 * e * y * Math.sin(m) * Math.cos(2 * l0 * DEG) -
    0.5 * y * y * Math.sin(4 * l0 * DEG) -
    1.25 * e * e * Math.sin(2 * m);

  return (eot / DEG) * 4; // radians -> degrees -> minutes of time
}

// ---------------------------------------------------------------------------
// The four pillars
// ---------------------------------------------------------------------------

/**
 * Compute a full 사주 chart.
 *
 * @param {object} birth
 * @param {number} birth.year        Calendar year (Gregorian)
 * @param {number} birth.month       1-12
 * @param {number} birth.day         1-31
 * @param {number} [birth.hour]      0-23, local clock time
 * @param {number} [birth.minute]    0-59
 * @param {number} birth.utcOffset   Hours east of UTC the clock was showing
 * @param {number} birth.longitude   Degrees east (negative for west)
 * @param {boolean} [birth.timeUnknown] Skip the hour pillar entirely
 * @param {object} [options]
 * @param {boolean} [options.applyLongitudeCorrection=true]
 * @param {boolean} [options.applyEquationOfTime=false]
 * @param {'midnight'|'eleven'} [options.dayBoundary='midnight']
 *        Where the 일주 rolls over. Korean 만세력 mostly use 야자시 (the day
 *        changes at midnight even though the 子 hour starts at 23:00); the
 *        older 조자시 school rolls the day at 23:00.
 */
export function computeChart(birth, options = {}) {
  const {
    applyLongitudeCorrection = true,
    applyEquationOfTime = false,
    dayBoundary = 'midnight',
  } = options;

  const {
    year, month, day,
    hour = 12, minute = 0,
    utcOffset, longitude,
    timeUnknown = false,
  } = birth;

  // --- Step 1: clock time -> true solar time -------------------------------
  const clockJD = julianDay(year, month, day, hour, minute) - utcOffset / 24;

  let correctionMinutes = 0;
  if (applyLongitudeCorrection) {
    correctionMinutes += longitudeCorrectionMinutes(longitude, utcOffset);
  }
  if (applyEquationOfTime) {
    correctionMinutes += equationOfTimeMinutes(clockJD);
  }

  // Solar time as a Julian Day in UT, and the same instant expressed as a local
  // solar wall clock (what the sundial at the birthplace would have read).
  const solarJD = clockJD + correctionMinutes / (60 * 24);
  const solarLocal = fromJulianDay(solarJD + utcOffset / 24);

  // --- Step 2: 년주 (year pillar) ------------------------------------------
  // The 사주 year turns at 입춘, not at New Year and not at lunar new year.
  // A January or early-February birth still belongs to the *previous* 사주 year.
  const sajuYear = solarJD >= springOf(year) ? year : year - 1;
  const terms = monthTermsForYear(sajuYear);

  const yearStem = mod(sajuYear - 4, 10);
  const yearBranch = mod(sajuYear - 4, 12);

  // --- Step 3: 월주 (month pillar) -----------------------------------------
  // Find which solar-term window the birth falls into.
  let monthIndex = 0;
  for (let i = 0; i < terms.length - 1; i++) {
    if (solarJD >= terms[i].jd && solarJD < terms[i + 1].jd) {
      monthIndex = i;
      break;
    }
  }
  const openingTerm = terms[monthIndex];
  const monthBranch = openingTerm.branch;
  // 오호둔: the 寅 month's stem depends on the year stem; each month after it
  // advances the stem by one.
  const monthStem = mod(FIRST_MONTH_STEM[yearStem % 5] + monthIndex, 10);

  // --- Step 4: 일주 (day pillar) -------------------------------------------
  // Anchored on the 60-day cycle running unbroken through the Julian day count.
  let dayShift = 0;
  if (dayBoundary === 'eleven' && solarLocal.hour >= 23) dayShift = 1;

  const localMidnightJDN = Math.floor(
    julianDay(solarLocal.year, solarLocal.month, solarLocal.day) + 0.5,
  ) + dayShift;
  const dayCycle = mod(localMidnightJDN + 49, 60);
  const dayStem = dayCycle % 10;
  const dayBranch = dayCycle % 12;

  // --- Step 5: 시주 (hour pillar) ------------------------------------------
  // 자시 straddles midnight: 23:00-01:00 is 子, then every two hours after.
  let hourPillar = null;
  if (!timeUnknown) {
    const hourBranch = Math.floor(mod(solarLocal.hour + 1, 24) / 2);
    // 오서둔: the 子 hour's stem depends on the day stem.
    const hourStem = mod(FIRST_HOUR_STEM[dayStem % 5] + hourBranch, 10);
    hourPillar = makePillar('hour', hourStem, hourBranch);
  }

  // --- How close to a boundary? -------------------------------------------
  const minutesIntoMonth = (solarJD - openingTerm.jd) * 24 * 60;
  const minutesToNextTerm = (terms[monthIndex + 1].jd - solarJD) * 24 * 60;

  return {
    pillars: {
      year: makePillar('year', yearStem, yearBranch),
      month: makePillar('month', monthStem, monthBranch),
      day: makePillar('day', dayStem, dayBranch),
      hour: hourPillar,
    },
    dayMaster: STEMS[dayStem],
    dayMasterIndex: dayStem,
    monthBranchIndex: monthBranch,
    sajuYear,
    solarTerm: {
      opening: openingTerm,
      next: terms[monthIndex + 1],
      minutesSinceOpening: minutesIntoMonth,
      minutesUntilNext: minutesToNextTerm,
      /** True when the birth sits close enough to a boundary to be worth a caveat. */
      nearBoundary: Math.min(minutesIntoMonth, minutesToNextTerm) < 120,
    },
    timing: {
      clockTime: { hour, minute },
      correctionMinutes,
      solarTime: { hour: solarLocal.hour, minute: solarLocal.minute },
      solarDate: solarLocal,
      timeUnknown,
    },
  };
}

/** 입춘 of a calendar year, as a Julian Day in UT. Memoised -- it is hot. */
const springCache = new Map();
function springOf(year) {
  if (!springCache.has(year)) {
    const terms = monthTermsForYear(year - 1);
    // The closing entry of the previous year's window *is* this year's 입춘.
    springCache.set(year, terms[terms.length - 1].jd);
  }
  return springCache.get(year);
}

function makePillar(kind, stemIndex, branchIndex) {
  return {
    kind,
    stemIndex,
    branchIndex,
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    label: pillarLabel(stemIndex, branchIndex),
    cycle: sexagenaryIndex(stemIndex, branchIndex),
  };
}

export { sunApparentLongitude };
