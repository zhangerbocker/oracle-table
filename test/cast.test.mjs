// The casting logic the page and the API share. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tossCoins, readCast, isValidCast } from '../oracle/cast.js';

test('a toss is three coins adding up to 6, 7, 8 or 9', () => {
  for (let i = 0; i < 200; i++) {
    const { coins, value } = tossCoins();
    assert.equal(coins.length, 3);
    assert.equal(value, coins.reduce((sum, c) => sum + (c === 'heads' ? 3 : 2), 0));
    assert.ok([6, 7, 8, 9].includes(value));
  }
});

test('six young yang lines are hexagram 1, with nothing changing', () => {
  const cast = readCast([7, 7, 7, 7, 7, 7]);
  assert.equal(cast.primary.number, 1);
  assert.equal(cast.relating, null);
  assert.deepEqual(cast.changingLines, []);
});

test('six old yang lines turn hexagram 1 into hexagram 2', () => {
  const cast = readCast([9, 9, 9, 9, 9, 9]);
  assert.equal(cast.primary.number, 1);
  assert.equal(cast.relating.number, 2);
  assert.deepEqual(cast.changingLines, [1, 2, 3, 4, 5, 6]);
});

test('only six values from 6 to 9 make a cast', () => {
  assert.ok(isValidCast([6, 7, 8, 9, 7, 8]));
  assert.ok(!isValidCast([7, 7, 7]));
  assert.ok(!isValidCast([5, 7, 7, 7, 7, 7]));
  assert.throws(() => readCast([1, 2, 3]));
});
