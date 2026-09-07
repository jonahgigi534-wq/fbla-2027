/**
 * Tests for cart operations.
 *
 * The rule these protect is that nothing is edited in place. The store swaps state
 * wholesale, so a function that mutated the array it was handed would change what
 * other screens are still holding and produce a bug a long way from its cause.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addToCart,
  countItems,
  createLine,
  longestLeadTimeHours,
  removeLine,
  setLineQuantity,
} from '../src/js/domain/cart.js';

const pie = {
  id: 'apple-pie-slice',
  name: 'Apple Pie Slice',
  priceCents: 495,
  categoryId: 'fruit-pies-slice',
  leadTimeHours: 0,
};
const tray = {
  id: 'tray-bacon',
  name: 'Tray Bacon',
  priceCents: 4000,
  categoryId: 'catering-breakfast',
  leadTimeHours: 48,
};

test('adding to an empty cart makes one line', () => {
  const cart = addToCart([], pie, 2);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);
});

test('does not modify the array it was given', () => {
  const original = [];
  addToCart(original, pie, 1);
  assert.equal(original.length, 0);
});

test('merges an identical line instead of repeating it', () => {
  const cart = addToCart(addToCart([], pie, 1), pie, 2);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 3);
});

test('keeps lines separate when the instructions differ', () => {
  const cart = addToCart(addToCart([], pie, 1, 'warm it'), pie, 1, 'cold');
  assert.equal(cart.length, 2);
});

test('treats spacing around an instruction as the same instruction', () => {
  const cart = addToCart(addToCart([], pie, 1, 'warm it'), pie, 1, '  warm it  ');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);
});

test('copies the price onto the line so a later price change cannot rewrite history', () => {
  const line = createLine(pie, 1);
  assert.equal(line.priceCents, 495);
  assert.equal(line.name, 'Apple Pie Slice');
});

test('setting a quantity to zero removes the line', () => {
  const cart = addToCart([], pie, 3);
  assert.equal(setLineQuantity(cart, cart[0].lineId, 0).length, 0);
});

test('a negative quantity removes the line rather than going negative', () => {
  const cart = addToCart([], pie, 1);
  assert.equal(setLineQuantity(cart, cart[0].lineId, -4).length, 0);
});

test('changing an unknown line leaves the cart alone', () => {
  const cart = addToCart([], pie, 1);
  assert.equal(setLineQuantity(cart, 'does-not-exist', 9)[0].quantity, 1);
  assert.equal(removeLine(cart, 'does-not-exist').length, 1);
});

test('counts items rather than lines', () => {
  const cart = addToCart(addToCart([], pie, 3), tray, 2);
  assert.equal(cart.length, 2);
  assert.equal(countItems(cart), 5);
});

test('a cart with one catering tray takes the tray lead time', () => {
  const cart = addToCart(addToCart([], pie, 1), tray, 1);
  assert.equal(longestLeadTimeHours(cart), 48);
});

test('an everyday cart needs no notice', () => {
  assert.equal(longestLeadTimeHours(addToCart([], pie, 1)), 0);
  assert.equal(longestLeadTimeHours([]), 0);
});
