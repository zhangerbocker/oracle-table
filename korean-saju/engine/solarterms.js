/**
 * 절기 (solar terms) by actual astronomy.
 *
 * A 사주 month does not start on the 1st of anything. It starts the moment the
 * sun's apparent ecliptic longitude crosses a multiple of 15 degrees. To get the
 * month pillar right we have to compute where the sun actually was.
 *
 * Method: Meeus, "Astronomical Algorithms" ch. 25 (low-precision solar
 * position), then Newton iteration to find the longitude crossing. Accurate to
 * a few minutes over roughly 1800-2200, which is far finer than anyone's
 * recollection of their own birth time.
 */

import { MONTH_TERMS, mod } from './constants.js';

const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------
// Julian day conversions
// ---------------------------------------------------------------------------

/**
 * Julian Day Number for a Gregorian calendar date at 00:00 UTC.
 * Returns a whole number for midnight (JD .0 is noon, so this ends in .5).
 */
export function julianDay(year, month, day, hour = 0, minute = 0, second = 0) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFraction = (hour + minute / 60 + second / 3600) / 24;
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day + dayFraction + b - 1524.5
  );
}

/** Inverse of {@link julianDay}: Julian Day -> calendar date in UTC. */
export function fromJulianDay(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayWithFraction = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayWithFraction);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  let hours = (dayWithFraction - day) * 24;
  const hour = Math.floor(hours);
  hours = (hours - hour) * 60;
  const minute = Math.floor(hours);
  const second = Math.round((hours - minute) * 60);

  return { year, month, day, hour, minute, second };
}

/**
 * ΔT, the gap between Terrestrial Time (which the orbit equations use) and
 * Universal Time (which clocks use). Espenak & Meeus polynomial fits.
 * Returns seconds.
 */
function deltaT(year, month) {
  const y = year + (month - 0.5) / 12;

  if (y >= 2005 && y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  if (y >= 1986 && y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t +
      0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y >= 1961 && y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718;
  }
  if (y >= 1941 && y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547;
  }
  if (y >= 1920 && y < 1941) {
    const t = y - 1920;
    return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t;
  }
  if (y >= 1900 && y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t -
      0.000197 * t ** 4;
  }
  if (y >= 1800 && y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t * t * t -
      0.0004473624 * t ** 4 + (t ** 5) / 233174;
  }
  if (y >= 2050 && y < 2150) {
    return -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
  }
  // Far outside the supported range: the generic parabola.
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

// ---------------------------------------------------------------------------
// Solar position
// ---------------------------------------------------------------------------

/**
 * Apparent ecliptic longitude of the sun, in degrees [0, 360).
 * @param {number} jde Julian Ephemeris Day (i.e. JD already shifted by ΔT).
 */
export function sunApparentLongitude(jde) {
  const t = (jde - 2451545.0) / 36525;

  // Geometric mean longitude and mean anomaly.
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const mRad = m * DEG;

  // Equation of the centre.
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mRad) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * mRad) +
    0.000289 * Math.sin(3 * mRad);

  const trueLongitude = l0 + c;

  // Nutation in longitude plus aberration, giving the *apparent* position.
  const omega = (125.04 - 1934.136 * t) * DEG;
  const apparent = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega);

  return mod(apparent, 360);
}

// ---------------------------------------------------------------------------
// Finding a solar term
// ---------------------------------------------------------------------------

/**
 * The instant the sun reaches `targetLongitude`, searching near `year`.
 * Returns a Julian Day in UT (so it lines up with ordinary clock time).
 */
export function solarTermJD(year, targetLongitude) {
  // The sun advances ~0.9856 deg/day from 280 deg at the start of January.
  // Seed the search from that, then let Newton clean it up.
  const daysFromJan1 = mod(targetLongitude - 280, 360) / 0.98565;
  let jde = julianDay(year, 1, 1, 0, 0, 0) + daysFromJan1;

  for (let i = 0; i < 12; i++) {
    const current = sunApparentLongitude(jde);
    // Signed shortest angular distance to the target, in [-180, 180).
    let diff = mod(targetLongitude - current + 180, 360) - 180;
    if (Math.abs(diff) < 1e-8) break;
    jde += diff / 0.98565; // degrees -> days
  }

  // Convert Terrestrial Time back to Universal Time.
  const approx = fromJulianDay(jde);
  return jde - deltaT(approx.year, approx.month) / 86400;
}

/**
 * All twelve month-opening solar terms that bracket a given 사주 year.
 *
 * Returns 13 entries in strictly ascending time order: 입춘 of `year` through
 * 입춘 of `year + 1`, so any instant in the year falls inside exactly one gap.
 * Each entry carries the branch its month takes.
 */
export function monthTermsForYear(year) {
  // Each calendar year contains all twelve terms, but not in 사주 order: 소한
  // (285 deg) lands in early January, *before* that year's 입춘. So gather two
  // calendar years, sort by time, and slice out the 입춘-to-입춘 window.
  const all = [];
  for (const y of [year, year + 1]) {
    for (const term of MONTH_TERMS) {
      all.push({ ...term, jd: solarTermJD(y, term.longitude), calendarYear: y });
    }
  }
  all.sort((a, b) => a.jd - b.jd);

  const start = all.findIndex((t) => t.longitude === 315 && t.calendarYear === year);
  const end = all.findIndex((t) => t.longitude === 315 && t.calendarYear === year + 1);
  return all.slice(start, end + 1); // 13 entries: 12 months plus the closing bound
}

/** Human-readable date for a solar term, in the given UTC offset (hours). */
export function termLocalDate(jd, utcOffsetHours) {
  return fromJulianDay(jd + utcOffsetHours / 24);
}
