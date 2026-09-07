/**
 * Tests for the customer spending cap.
 *
 * The removal advice is the part worth protecting. A plain most-expensive-first rule
 * tells someone two dollars over to drop the twenty dollar steak, which is useless
 * advice, so the tests pin the cheapest-that-covers behavior.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUDGET_STATUS, evaluateBudget, suggestRemovals } from '../src/js/domain/budget.js';

const lines = [
  { name: 'Ribeye Dinner', priceCents: 2095, quantity: 1 },
  { name: 'Bayou Goo', priceCents: 495, quantity: 2 },
  { name: 'Coffee', priceCents: 295, quantity: 1 },
];

test('no cap means never over', () => {
  const verdict = evaluateBudget(9999999, null);
  assert.equal(verdict.status, BUDGET_STATUS.under);
  assert.equal(verdict.capCents, null);
});

test('comfortably inside the cap reads as under', () => {
  assert.equal(evaluateBudget(2000, 5000).status, BUDGET_STATUS.under);
});

test('past 85 percent of the cap reads as close', () => {
  assert.equal(evaluateBudget(4400, 5000).status, BUDGET_STATUS.close);
});

test('exactly on the cap is still allowed', () => {
  const verdict = evaluateBudget(5000, 5000);
  assert.notEqual(verdict.status, BUDGET_STATUS.over);
  assert.equal(verdict.remainingCents, 0);
});

test('a penny over is over', () => {
  const verdict = evaluateBudget(5001, 5000);
  assert.equal(verdict.status, BUDGET_STATUS.over);
  assert.equal(verdict.overByCents, 1);
});

test('remaining never goes negative', () => {
  assert.equal(evaluateBudget(6200, 5000).remainingCents, 0);
});

test('an order inside the cap needs no removals', () => {
  assert.deepEqual(suggestRemovals(lines, 0), []);
  assert.deepEqual(suggestRemovals(lines, -100), []);
});

test('suggests the cheapest line that closes a small gap', () => {
  assert.deepEqual(
    suggestRemovals(lines, 200).map((line) => line.name),
    ['Coffee']
  );
});

test('steps up to the next line when the cheapest is not enough', () => {
  assert.deepEqual(
    suggestRemovals(lines, 400).map((line) => line.name),
    ['Bayou Goo']
  );
});

test('picks one big line over several small ones when it fits', () => {
  assert.deepEqual(
    suggestRemovals(lines, 1200).map((line) => line.name),
    ['Ribeye Dinner']
  );
});

test('combines lines when no single one covers the gap', () => {
  const names = suggestRemovals(lines, 2500).map((line) => line.name);
  assert.deepEqual(names, ['Ribeye Dinner', 'Bayou Goo']);
});

test('counts a line by its quantity, not its unit price', () => {
  // Bayou Goo is $4.95 each but $9.90 on the line, so it covers a $6 gap.
  assert.deepEqual(
    suggestRemovals(lines, 600).map((line) => line.name),
    ['Bayou Goo']
  );
});
