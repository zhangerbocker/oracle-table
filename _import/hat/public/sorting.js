// Pure sorting logic: no DOM, so it can run in the browser or under `node --test`.
import {
  HOUSES,
  SIGNS,
  WAND_WOODS,
  WAND_CORES,
  FLEXIBILITY_BY_ELEMENT,
  FLEXIBILITY_BY_VARIETY,
  FALLBACK,
} from "./data.js";

const HOUSE_NAMES = Object.keys(HOUSES);
const QUIZ_POINTS = 2;

/** Parse a "YYYY-MM-DD" string from <input type="date"> without timezone surprises. */
export function parseBirthDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

/** Zodiac sign for a month (1-12) and day. */
export function getZodiac(month, day) {
  const key = month * 100 + day;
  let match = null;
  for (const sign of SIGNS) {
    const start = sign.start[0] * 100 + sign.start[1];
    if (start <= key && (!match || start > match.start)) match = { sign, start };
  }
  // Jan 1-19 falls before every start date in the year: still Capricorn.
  return match?.sign ?? SIGNS.find((s) => s.name === "Capricorn");
}

/**
 * Score each house from the sign's base weights plus quiz answers.
 * `answerHouses` is the list of house names the person picked (may be empty).
 */
export function scoreHouses(sign, answerHouses = []) {
  const scores = Object.fromEntries(HOUSE_NAMES.map((h) => [h, sign.weights[h] ?? 0]));
  for (const house of answerHouses) {
    if (house in scores) scores[house] += QUIZ_POINTS;
  }

  const best = Math.max(...Object.values(scores));
  const tied = HOUSE_NAMES.filter((h) => scores[h] === best);
  // Tie-break: the stars (base weights) decide.
  tied.sort((a, b) => (sign.weights[b] ?? 0) - (sign.weights[a] ?? 0));

  return { house: tied[0], scores, certain: answerHouses.length > 0 };
}

/** Wand length in inches from the birth day: 9 to 14.75 in quarter-inch steps. */
export function wandInches(day) {
  return 9 + ((day - 1) % 24) / 4;
}

export function wandLength(day) {
  const inches = wandInches(day);
  return `${Math.floor(inches)}${["", "¼", "½", "¾"][(inches % 1) * 4]}″`;
}

export function pickWand(sign, house, answerHouses, day) {
  const { wood, lore: woodLore } = WAND_WOODS[sign.name];

  let core;
  if (house === "Hufflepuff") core = "unicorn hair";
  else if (house === "Ravenclaw") core = "phoenix feather";
  else if (house === "Slytherin") core = "dragon heartstring";
  else core = sign.element === "Fire" ? "dragon heartstring" : "phoenix feather";

  const flexibility = answerHouses.length
    ? FLEXIBILITY_BY_VARIETY[new Set(answerHouses).size - 1]
    : FLEXIBILITY_BY_ELEMENT[sign.element];

  return {
    wood,
    woodLore,
    core,
    coreLore: WAND_CORES[core],
    length: wandLength(day),
    inches: wandInches(day),
    flexibility,
  };
}

/** Everything the result screen needs, computed from the inputs. */
export function sort(birth, answerHouses = []) {
  const sign = getZodiac(birth.month, birth.day);
  const { house, scores, certain } = scoreHouses(sign, answerHouses);
  const wand = pickWand(sign, house, answerHouses, birth.day);
  return { sign, house, scores, certain, wand };
}

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

/** Template-based reading used when Claude isn't available. */
export function fallbackReading({ sign, house, wand }) {
  const values = {
    sign: sign.name,
    aSign: `${/^[AEIOU]/.test(sign.name) ? "an" : "a"} ${sign.name}`,
    traits: sign.traits,
    element: sign.element.toLowerCase(),
    woodLower: wand.wood.toLowerCase(),
    ...wand,
  };
  return {
    title: fill(FALLBACK.titles[house], values),
    prophecy: fill(FALLBACK.prophecies[house], values),
    wandLore: fill(FALLBACK.wandLore, values),
  };
}
