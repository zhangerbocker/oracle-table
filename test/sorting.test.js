import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBirthDate, getZodiac, sort, wandLength, fallbackReading } from "../public/sorting.js";

test("zodiac boundaries", () => {
  const cases = [
    ["01-01", "Capricorn"], ["01-19", "Capricorn"], ["01-20", "Aquarius"],
    ["02-29", "Pisces"], ["03-20", "Pisces"], ["03-21", "Aries"],
    ["07-23", "Leo"], ["10-31", "Scorpio"], ["12-21", "Sagittarius"],
    ["12-22", "Capricorn"], ["12-31", "Capricorn"],
  ];
  for (const [md, expected] of cases) {
    const [m, d] = md.split("-").map(Number);
    assert.equal(getZodiac(m, d).name, expected, md);
  }
});

test("parseBirthDate rejects impossible dates", () => {
  assert.deepEqual(parseBirthDate("2000-02-29"), { year: 2000, month: 2, day: 29 });
  assert.equal(parseBirthDate("2001-02-29"), null);
  assert.equal(parseBirthDate(""), null);
});

test("zodiac alone sorts by element", () => {
  assert.equal(sort({ month: 4, day: 1 }).house, "Gryffindor"); // Aries
  assert.equal(sort({ month: 5, day: 1 }).house, "Hufflepuff"); // Taurus
  assert.equal(sort({ month: 6, day: 1 }).house, "Ravenclaw");  // Gemini
  assert.equal(sort({ month: 11, day: 1 }).house, "Slytherin"); // Scorpio
});

test("a full quiz overrides the stars", () => {
  const result = sort({ month: 8, day: 1 }, Array(5).fill("Ravenclaw")); // Leo
  assert.equal(result.house, "Ravenclaw");
  assert.equal(result.certain, true);
  assert.equal(result.wand.flexibility, "unyielding");
});

test("ties go to the sign's favorite house", () => {
  // Leo base: Gryffindor 4, Slytherin 1. Two Slytherin answers make Slytherin 5 vs 4.
  assert.equal(sort({ month: 8, day: 1 }, ["Slytherin", "Slytherin"]).house, "Slytherin");
  // Aries base: Gryffindor 3, Slytherin 1. One Slytherin answer ties at 3: Gryffindor wins.
  assert.equal(sort({ month: 4, day: 1 }, ["Slytherin"]).house, "Gryffindor");
});

test("wand length stays in range", () => {
  assert.equal(wandLength(1), "9″");
  assert.equal(wandLength(24), "14¾″");
  assert.equal(wandLength(31), "10½″");
});

test("fallback reading fills every placeholder", () => {
  for (const month of [1, 4, 6, 11]) {
    const reading = fallbackReading(sort({ month, day: 10 }));
    for (const text of Object.values(reading)) assert.doesNotMatch(text, /[{}]/);
  }
});

test("fallback reading uses 'an' before vowel signs", () => {
  assert.match(fallbackReading(sort({ month: 4, day: 1 })).prophecy, /an Aries/);
  assert.match(fallbackReading(sort({ month: 5, day: 1 })).prophecy, /a Taurus/);
});

test("firstJsonObject ignores trailing text after the JSON", async () => {
  const { firstJsonObject } = await import("../lib/prophecy.js");
  const obj = '{"title":"A {curly} \\"quote\\"","prophecy":"x","wandLore":"y"}';
  assert.equal(firstJsonObject(`${obj}\n\n{"again":1}`), obj);
  assert.equal(firstJsonObject(obj), obj);
});
