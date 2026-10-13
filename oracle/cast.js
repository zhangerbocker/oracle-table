// Three-coin casting logic. Pure functions, shared by the browser and the API.
import { HEXAGRAMS, TRIGRAMS } from "./hexagrams.js";

// Line values: 6 old yin (changing), 7 young yang, 8 young yin, 9 old yang (changing).
export const LINE_INFO = {
  6: { yang: false, changing: true, label: "old yin" },
  7: { yang: true, changing: false, label: "young yang" },
  8: { yang: false, changing: false, label: "young yin" },
  9: { yang: true, changing: true, label: "old yang" },
};

function randomBit() {
  const buf = new Uint8Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] & 1;
}

// Heads = 3, tails = 2. Returns the three coins and their sum (the line value).
export function tossCoins() {
  const coins = [randomBit(), randomBit(), randomBit()].map((b) => (b ? "heads" : "tails"));
  const value = coins.reduce((sum, c) => sum + (c === "heads" ? 3 : 2), 0);
  return { coins, value };
}

export function isValidCast(lines) {
  return Array.isArray(lines) && lines.length === 6 && lines.every((v) => v in LINE_INFO);
}

// bits: array of 6 booleans (true = yang), bottom line first.
function trigramKey(bits) {
  return bits.map((b) => (b ? "1" : "0")).join("");
}

export function hexagramFromBits(bits) {
  const lower = TRIGRAMS[trigramKey(bits.slice(0, 3))];
  const upper = TRIGRAMS[trigramKey(bits.slice(3, 6))];
  const number = KING_WEN[upper.index][lower.index];
  return { ...HEXAGRAMS[number - 1], lower, upper };
}

// lines: six values in 6..9, bottom line first.
export function readCast(lines) {
  if (!isValidCast(lines)) throw new Error("A cast is six line values between 6 and 9.");
  const bits = lines.map((v) => LINE_INFO[v].yang);
  const changingLines = lines.flatMap((v, i) => (LINE_INFO[v].changing ? [i + 1] : []));
  const primary = hexagramFromBits(bits);
  const relating = changingLines.length
    ? hexagramFromBits(bits.map((b, i) => (LINE_INFO[lines[i]].changing ? !b : b)))
    : null;
  return { lines, primary, relating, changingLines };
}

// King Wen number lookup: KING_WEN[upper][lower], trigram order
// Qian, Zhen, Kan, Gen, Kun, Xun, Li, Dui (matches TRIGRAMS[*].index).
const KING_WEN = [
  [1, 25, 6, 33, 12, 44, 13, 10],
  [34, 51, 40, 62, 16, 32, 55, 54],
  [5, 3, 29, 39, 8, 48, 63, 60],
  [26, 27, 4, 52, 23, 18, 22, 41],
  [11, 24, 7, 15, 2, 46, 36, 19],
  [9, 42, 59, 53, 20, 57, 37, 61],
  [14, 21, 64, 56, 35, 50, 30, 38],
  [43, 17, 47, 31, 45, 28, 49, 58],
];
