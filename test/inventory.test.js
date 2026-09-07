/**
 * Tests for stock checks and substitutions.
 *
 * The case worth protecting is that stock is measured against what is already in
 * the cart, not just against the catalog. Checking the catalog alone would let a
 * customer holding the last four slices add a fifth.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkAvailability,
  findSubstitutes,
  isLowStock,
  quantityInCart,
  remainingFor,
  stockFor,
} from '../src/js/domain/inventory.js';

const pie = {
  id: 'key-lime',
  name: 'Key Lime Pie Slice',
  priceCents: 495,
  categoryId: 'pies',
  stock: 10,
};
const other = {
  id: 'lemon',
  name: 'Lemon Icebox Pie Slice',
  priceCents: 495,
  categoryId: 'pies',
  stock: 4,
};
const pricey = {
  id: 'whole',
  name: 'Key Lime Pie Whole',
  priceCents: 1795,
  categoryId: 'pies',
  stock: 2,
};
const elsewhere = {
  id: 'burger',
  name: 'Hamburger',
  priceCents: 1295,
  categoryId: 'burgers',
  stock: 9,
};

test('a manager edit beats the catalog number', () => {
  assert.equal(stockFor(pie, {}), 10);
  assert.equal(stockFor(pie, { 'key-lime': 3 }), 3);
});

test('an override of zero is respected rather than treated as missing', () => {
  assert.equal(stockFor(pie, { 'key-lime': 0 }), 0);
});

test('counts the same item across separate cart lines', () => {
  const cart = [
    { itemId: 'key-lime', quantity: 2 },
    { itemId: 'key-lime', quantity: 3 },
    { itemId: 'burger', quantity: 1 },
  ];
  assert.equal(quantityInCart(cart, 'key-lime'), 5);
});

test('what is left accounts for the cart, not just the shelf', () => {
  assert.equal(remainingFor(pie, [{ itemId: 'key-lime', quantity: 4 }], {}), 6);
});

test('never reports a negative remainder', () => {
  assert.equal(remainingFor(pie, [{ itemId: 'key-lime', quantity: 99 }], {}), 0);
});

test('refuses a sold out item and says so by name', () => {
  const verdict = checkAvailability(pie, 1, [], { 'key-lime': 0 });
  assert.equal(verdict.allowed, false);
  assert.match(verdict.message, /sold out/);
});

test('refuses when the cart already holds the last one', () => {
  const verdict = checkAvailability(pie, 1, [{ itemId: 'key-lime', quantity: 10 }], {});
  assert.equal(verdict.allowed, false);
  assert.match(verdict.message, /last of the/);
});

test('says how many are left when the request is too big', () => {
  const verdict = checkAvailability(pie, 5, [], { 'key-lime': 2 });
  assert.equal(verdict.allowed, false);
  assert.equal(verdict.remaining, 2);
  assert.match(verdict.message, /Only 2 are left/);
});

test('uses the singular when exactly one is left', () => {
  const verdict = checkAvailability(pie, 3, [], { 'key-lime': 1 });
  assert.match(verdict.message, /Only 1 is left/);
});

test('allows a request that fits', () => {
  const verdict = checkAvailability(pie, 4, [], {});
  assert.equal(verdict.allowed, true);
  assert.equal(verdict.message, null);
});

test('low stock means running down, not gone', () => {
  assert.equal(isLowStock(pie, { 'key-lime': 3 }), true);
  assert.equal(isLowStock(pie, { 'key-lime': 0 }), false);
  assert.equal(isLowStock(pie, {}), false);
});

test('suggests from the same category, closest in price first', () => {
  const found = findSubstitutes(pie, [pie, other, pricey, elsewhere], {});
  assert.deepEqual(
    found.map((item) => item.id),
    ['lemon', 'whole']
  );
});

test('never suggests something that is also sold out', () => {
  const found = findSubstitutes(pie, [pie, other, pricey], { lemon: 0 });
  assert.deepEqual(
    found.map((item) => item.id),
    ['whole']
  );
});
