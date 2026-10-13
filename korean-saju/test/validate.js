/**
 * Engine checks. Run with: npm test
 *
 * These are not unit tests for their own sake -- a 사주 chart is either right or
 * it is astrology-flavoured noise, and the only way to know which is to pin the
 * output against dates whose pillars are independently known.
 */

import { computeChart, koreanClockOffset } from '../engine/pillars.js';
import { analyseChart } from '../engine/analysis.js';
import { buildBirth, PLACES, detectPlace } from '../engine/places.js';
import { monthTermsForYear, solarTermJD, fromJulianDay } from '../engine/solarterms.js';

let passed = 0;
let failed = 0;

function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}\n         expected: ${expected}\n         actual:   ${actual}`);
  }
}

const SEOUL = { utcOffset: 9, longitude: 126.978 };

function chartFor(y, m, d, hour = 12, minute = 0, place = SEOUL) {
  return computeChart({ year: y, month: m, day: d, hour, minute, ...place });
}

const hanja = (p) => (p ? p.label.hanja : '--');

// ---------------------------------------------------------------------------
console.log('\n1. Solar terms land on the right calendar dates');
// ---------------------------------------------------------------------------
{
  // 입춘 is always 3-5 February; 하지/동지 anchor the solstices.
  const ipchun2024 = fromJulianDay(solarTermJD(2024, 315) + 9 / 24);
  check('입춘 2024 month', ipchun2024.month, 2);
  check('입춘 2024 day', ipchun2024.day, 4);

  const ipchun2000 = fromJulianDay(solarTermJD(2000, 315) + 9 / 24);
  check('입춘 2000 month', ipchun2000.month, 2);
  check('입춘 2000 day', ipchun2000.day, 4);

  // 동지 (winter solstice, 270 deg) is 21-22 December.
  const dongji2023 = fromJulianDay(solarTermJD(2023, 270) + 9 / 24);
  check('동지 2023 month', dongji2023.month, 12);
  check('동지 2023 day in [21,22]', dongji2023.day >= 21 && dongji2023.day <= 22, true);

  const terms = monthTermsForYear(2024);
  check('13 term boundaries per 사주 year', terms.length, 13);
  check('window opens at 입춘', terms[0].ko, '입춘');
  check('window closes at 입춘', terms[12].ko, '입춘');
  check('terms strictly ascending',
    terms.every((t, i) => i === 0 || t.jd > terms[i - 1].jd), true);
}

// ---------------------------------------------------------------------------
console.log('\n2. Year pillar turns at 입춘, not 1 January');
// ---------------------------------------------------------------------------
{
  check('1984-06-01 year pillar', hanja(chartFor(1984, 6, 1).pillars.year), '甲子');
  check('2024-06-01 year pillar', hanja(chartFor(2024, 6, 1).pillars.year), '甲辰');

  // 2024-02-03 is still 癸卯; 2024-02-05 is 甲辰. The boundary is 02-04.
  check('2024-02-03 still previous year', hanja(chartFor(2024, 2, 3).pillars.year), '癸卯');
  check('2024-02-05 new year', hanja(chartFor(2024, 2, 5).pillars.year), '甲辰');
  check('2024-01-15 still 癸卯', hanja(chartFor(2024, 1, 15).pillars.year), '癸卯');
}

// ---------------------------------------------------------------------------
console.log('\n3. Day pillar runs an unbroken 60-day cycle');
// ---------------------------------------------------------------------------
{
  // The absolute phase of the cycle is the one thing that cannot be derived
  // from first principles -- it has to be pinned to known dates. These two are
  // 357 years apart, which rules out an off-by-n drift.
  // Source: en.wikipedia.org/wiki/Sexagenary_cycle worked examples.
  check('1949-10-01 is 甲子', hanja(chartFor(1949, 10, 1).pillars.day), '甲子');
  check('1592-12-31 is 甲申', hanja(chartFor(1592, 12, 31).pillars.day), '甲申');

  const a = chartFor(2024, 1, 1);
  const b = chartFor(2024, 1, 2);
  check('consecutive days advance the cycle by 1',
    (b.pillars.day.cycle - a.pillars.day.cycle + 60) % 60, 1);

  const c = chartFor(2024, 3, 1); // 60 days after 2024-01-01 (leap year)
  const d = chartFor(2024, 1, 1);
  const gap = Math.round(
    (Date.UTC(2024, 2, 1) - Date.UTC(2024, 0, 1)) / 86400000,
  );
  check('60-day arithmetic holds across a leap February',
    (d.pillars.day.cycle + gap) % 60, c.pillars.day.cycle);
}

// ---------------------------------------------------------------------------
console.log('\n4. Month stem follows 오호둔 from the year stem');
// ---------------------------------------------------------------------------
{
  // 甲 year -> 寅 month is 丙寅. 2024 is 甲辰, so its first solar month is 丙寅.
  check('2024 寅月 is 丙寅', hanja(chartFor(2024, 2, 20).pillars.month), '丙寅');
  // The next month advances the stem by one: 丁卯.
  check('2024 卯月 is 丁卯', hanja(chartFor(2024, 3, 20).pillars.month), '丁卯');
  // 己 year -> also 丙寅 (갑기합). 2019 is 己亥.
  check('2019 寅月 is 丙寅', hanja(chartFor(2019, 2, 20).pillars.month), '丙寅');
  // 乙/庚 year -> 戊寅. 2025 is 乙巳.
  check('2025 寅月 is 戊寅', hanja(chartFor(2025, 2, 20).pillars.month), '戊寅');
}

// ---------------------------------------------------------------------------
console.log('\n5. Hour pillar follows 오서둔 from the day stem');
// ---------------------------------------------------------------------------
{
  // Whatever the date, a 甲 or 己 day must start with 甲子 at the 子 hour.
  const expectedZiStem = { 0: '甲', 5: '甲', 1: '丙', 6: '丙', 2: '戊', 7: '戊', 3: '庚', 8: '庚', 4: '壬', 9: '壬' };
  let allOk = true;
  for (let d = 1; d <= 28; d++) {
    const chart = chartFor(2024, 6, d, 0, 30); // 00:30 is the 子 hour
    const want = expectedZiStem[chart.pillars.day.stemIndex];
    if (chart.pillars.hour.stem.hanja !== want || chart.pillars.hour.branch.hanja !== '子') {
      allOk = false;
      console.log(`         2024-06-${d} gave ${hanja(chart.pillars.hour)} for day stem ${chart.pillars.day.stem.hanja}`);
    }
  }
  check('子 hour stem matches 오서둔 for 28 consecutive days', allOk, true);

  // In *solar* time the 子 hour opens at 23:00. Seoul clocks run ~32 min ahead
  // of Seoul's sun, so it takes a 23:40 clock reading to get there.
  const late = computeChart(
    { year: 2024, month: 6, day: 10, hour: 23, minute: 30, ...SEOUL },
    { applyLongitudeCorrection: false },
  );
  check('23:30 solar time is the 子 hour', late.pillars.hour.branch.hanja, '子');
  check('23:30 Seoul clock is still 亥', chartFor(2024, 6, 10, 23, 30).pillars.hour.branch.hanja, '亥');
  check('23:40 Seoul clock reaches 子', chartFor(2024, 6, 10, 23, 40).pillars.hour.branch.hanja, '子');

  const noon = chartFor(2024, 6, 10, 12, 0);
  check('12:00 is the 午 hour', noon.pillars.hour.branch.hanja, '午');
}

// ---------------------------------------------------------------------------
console.log('\n6. Korean clock history');
// ---------------------------------------------------------------------------
{
  check('1985 Seoul is UTC+9', koreanClockOffset(1985, 6, 1).offset, 9);
  check('1988-07-01 was summer time', koreanClockOffset(1988, 7, 1).offset, 10);
  check('1988-07-01 flagged as DST', koreanClockOffset(1988, 7, 1).dst, true);
  check('1959-06-01 was UTC+8:30 plus DST', koreanClockOffset(1959, 6, 1).offset, 9.5);
  check('1958-01-01 was UTC+8:30', koreanClockOffset(1958, 1, 1).offset, 8.5);
  check('1930 was UTC+9', koreanClockOffset(1930, 1, 1).offset, 9);
}

// ---------------------------------------------------------------------------
console.log('\n7. Longitude correction actually moves the hour pillar');
// ---------------------------------------------------------------------------
{
  // Seoul clocks run ~32 min ahead of Seoul's sun. A birth at 13:10 clock time
  // is 12:38 solar time -- still 午. At 13:25 clock it is 12:53, still 午.
  // But 01:10 clock is 00:38 solar, which drops it from 丑 back into 子.
  const corrected = chartFor(2024, 6, 10, 1, 10);
  check('01:10 Seoul falls back into the 子 hour', corrected.pillars.hour.branch.hanja, '子');

  const raw = computeChart(
    { year: 2024, month: 6, day: 10, hour: 1, minute: 10, ...SEOUL },
    { applyLongitudeCorrection: false },
  );
  check('without correction it reads as 丑', raw.pillars.hour.branch.hanja, '丑');

  const minutes = Math.round(corrected.timing.correctionMinutes);
  check('Seoul correction is about -32 minutes', minutes, -32);
}

// ---------------------------------------------------------------------------
console.log('\n8. Chart shape');
// ---------------------------------------------------------------------------
{
  const chart = chartFor(1995, 8, 17, 14, 30);
  check('has a day master', typeof chart.dayMaster.element, 'string');
  check('hour pillar present when time known', chart.pillars.hour !== null, true);

  const noTime = computeChart({
    year: 1995, month: 8, day: 17, timeUnknown: true, ...SEOUL,
  });
  check('hour pillar omitted when time unknown', noTime.pillars.hour, null);
}

// ---------------------------------------------------------------------------
console.log('\n9. Full chart against a published 만세력');
// ---------------------------------------------------------------------------
{
  // Reference: a Korean 만세력 app, birth 1991-05-06 08:30 Seoul.
  // Chosen because 입하 fell at 09:18 that same morning -- the birth sits 81
  // minutes before the month pillar would have changed, so every boundary rule
  // in the engine has to be right for this chart to come out correct.
  const chart = chartFor(1991, 5, 6, 8, 30);
  const a = analyseChart(chart);

  check('년주 辛未', hanja(chart.pillars.year), '辛未');
  check('월주 壬辰', hanja(chart.pillars.month), '壬辰');
  check('일주 丙子', hanja(chart.pillars.day), '丙子');
  check('시주 壬辰', hanja(chart.pillars.hour), '壬辰');

  // 12운성 against the day master: 관대 / 태 / 관대 / 쇠
  check('12운성 년 = 쇠', a.stages.year.forDayMaster.ko, '쇠');
  check('12운성 월 = 관대', a.stages.month.forDayMaster.ko, '관대');
  check('12운성 일 = 태', a.stages.day.forDayMaster.ko, '태');
  check('12운성 시 = 관대', a.stages.hour.forDayMaster.ko, '관대');
  // And against each pillar's own stem: 묘 / 태 / 묘 / 쇠
  check('자좌 12운성 시 = 묘', a.stages.hour.forOwnStem.ko, '묘');
  check('자좌 12운성 년 = 쇠', a.stages.year.forOwnStem.ko, '쇠');

  // 오행 headcount: 木0 火1 土3 金1 水3
  check('오행 木 0', a.balance.simple.wood, 0);
  check('오행 火 1', a.balance.simple.fire, 1);
  check('오행 土 3', a.balance.simple.earth, 3);
  check('오행 金 1', a.balance.simple.metal, 1);
  check('오행 水 3', a.balance.simple.water, 3);
  check('오행 headcount totals 8',
    Object.values(a.balance.simple).reduce((x, y) => x + y, 0), 8);

  // 空亡 [年]戌亥 [日]申酉
  check('공망 from day = 申酉', a.voids.fromDay.map((b) => b.hanja).join(''), '申酉');
  check('공망 from year = 戌亥', a.voids.fromYear.map((b) => b.hanja).join(''), '戌亥');

  // 월령:戊
  check('월령 = 戊', a.commander.stem.hanja, '戊');
}

// ---------------------------------------------------------------------------
console.log('\n10. Birthplaces');
// ---------------------------------------------------------------------------
{
  check('every place id is unique',
    new Set(PLACES.map((p) => p.id)).size, PLACES.length);
  check('every place has a longitude in range',
    PLACES.every((p) => p.lon >= -180 && p.lon <= 180), true);
  check('every timezone resolves',
    PLACES.every((p) => {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: p.tz }).format(new Date());
        return true;
      } catch { return false; }
    }), true);
  check('detectPlace returns a known id',
    PLACES.some((p) => p.id === detectPlace('seoul')), true);

  // 입하 1991 was 00:18 UTC on 6 May. A Boston morning is already past it;
  // a Seoul morning is not. Same birthday, different month pillar.
  const seoul = computeChart(buildBirth({ date: '1991-05-06', time: '08:30', placeId: 'seoul' }).birth);
  const boston = computeChart(buildBirth({ date: '1991-05-06', time: '08:30', placeId: 'boston' }).birth);
  check('Seoul birth is 辰月', seoul.pillars.month.branch.hanja, '辰');
  check('Boston birth is 巳月', boston.pillars.month.branch.hanja, '巳');

  // Historical DST must come from tz data, not a fixed offset.
  check('Boston January 1991 is UTC-5',
    buildBirth({ date: '1991-01-15', time: '08:30', placeId: 'boston' }).utcOffset, -5);
  check('Boston July 1991 is UTC-4',
    buildBirth({ date: '1991-07-15', time: '08:30', placeId: 'boston' }).utcOffset, -4);
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exitCode = 1;
