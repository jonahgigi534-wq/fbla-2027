/**
 * Tests for whole cent money arithmetic.
 *
 * The rounding cases matter more than the obvious ones. Half up on a negative
 * number and a discount larger than the order are both things that happen and both
 * things a naive implementation gets wrong.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampToZero,
  formatUSD,
  parseDollarsToCents,
  percentOfCents,
  roundCents,
  sumCents,
} from '../src/js/domain/money.js';

test('rounds a half cent up rather than to even', () => {
  assert.equal(roundCents(10.5), 11);
  assert.equal(roundCents(11.5), 12);
});

test('rounds a negative half away from zero, so refunds match charges', () => {
  assert.equal(roundCents(-10.5), -11);
});

test('applies a percentage from basis points exactly', () => {
  // 8.25% of $18.90 is $1.55925, which rounds to $1.56.
  assert.equal(percentOfCents(1890, 825), 156);
});

test('a zero rate takes nothing off', () => {
  assert.equal(percentOfCents(1890, 0), 0);
});

test('sums an empty list to zero rather than undefined', () => {
  assert.equal(sumCents([]), 0);
});

test('never lets an amount fall below zero', () => {
  assert.equal(clampToZero(-500), 0);
  assert.equal(clampToZero(500), 500);
});

test('formats cents as dollars with a thousands separator', () => {
  assert.equal(formatUSD(1495), '$14.95');
  assert.equal(formatUSD(0), '$0.00');
  assert.equal(formatUSD(5), '$0.05');
  assert.equal(formatUSD(123456), '$1,234.56');
});

test('formats a negative amount with the sign before the dollar', () => {
  assert.equal(formatUSD(-200), '-$2.00');
});

test('parses the dollar amounts a customer actually types', () => {
  assert.equal(parseDollarsToCents('20'), 2000);
  assert.equal(parseDollarsToCents('20.5'), 2050);
  assert.equal(parseDollarsToCents('$20.50'), 2050);
  assert.equal(parseDollarsToCents('  20.50  '), 2050);
});

test('refuses anything that is not a dollar amount', () => {
  assert.equal(parseDollarsToCents('abc'), null);
  assert.equal(parseDollarsToCents('1.234'), null);
  assert.equal(parseDollarsToCents(''), null);
  assert.equal(parseDollarsToCents('-5'), null);
});
