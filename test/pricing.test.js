/**
 * Tests for the order price breakdown.
 *
 * The order the steps run in is the thing worth protecting. Discount before tax,
 * delivery fee inside the taxable base, tip on the pre-tax goods. Each of those is
 * a decision that changes the total, so each gets a test that would fail if someone
 * reordered them.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DELIVERY_FEE_CENTS,
  FREE_DELIVERY_THRESHOLD_CENTS,
  calculateOrderTotals,
  deliveryFeeCents,
  discountCents,
  subtotalCents,
} from '../src/js/domain/pricing.js';

const twoItems = [
  { priceCents: 1495, quantity: 1 },
  { priceCents: 495, quantity: 2 },
];

test('adds up line quantities, not just prices', () => {
  assert.equal(subtotalCents(twoItems), 1495 + 990);
});

test('an empty cart costs nothing', () => {
  const totals = calculateOrderTotals([]);
  assert.equal(totals.subtotal, 0);
  assert.equal(totals.total, 0);
});

test('takes the discount off before working out tax', () => {
  const promo = { kind: 'percent', basisPoints: 1000, minimumSpendCents: 0 };
  const totals = calculateOrderTotals(twoItems, { promo });

  assert.equal(totals.discount, 249);
  assert.equal(totals.goods, 2236);
  // The point of the test: tax is 8.25% of 2236, not of 2485.
  assert.equal(totals.tax, 184);
});

test('caps a percentage promo at its maximum', () => {
  const promo = {
    kind: 'percent',
    basisPoints: 5000,
    minimumSpendCents: 0,
    maximumDiscountCents: 500,
  };
  assert.equal(discountCents(2485, promo), 500);
});

test('ignores a promo when the order is below its minimum', () => {
  const promo = { kind: 'amount', amountCents: 500, minimumSpendCents: 3000 };
  assert.equal(discountCents(2485, promo), 0);
});

test('never discounts more than the order is worth', () => {
  const promo = { kind: 'amount', amountCents: 1000, minimumSpendCents: 0 };
  assert.equal(discountCents(150, promo), 150);
});

test('charges delivery only on delivery orders', () => {
  assert.equal(deliveryFeeCents('pickup', 1000), 0);
  assert.equal(deliveryFeeCents('dine-in', 1000), 0);
  assert.equal(deliveryFeeCents('delivery', 1000), DELIVERY_FEE_CENTS);
});

test('waives the delivery fee at the threshold, not above it', () => {
  assert.equal(deliveryFeeCents('delivery', FREE_DELIVERY_THRESHOLD_CENTS), 0);
  assert.equal(deliveryFeeCents('delivery', FREE_DELIVERY_THRESHOLD_CENTS - 1), DELIVERY_FEE_CENTS);
});

test('taxes the delivery fee along with the goods', () => {
  const totals = calculateOrderTotals(twoItems, { orderTypeId: 'delivery' });
  assert.equal(totals.taxableBase, totals.goods + totals.deliveryFee);
  assert.equal(totals.tax, 246);
});

test('works the tip out on pre-tax goods, the way a paper check does', () => {
  const totals = calculateOrderTotals(twoItems, { tipBasisPoints: 1800 });
  assert.equal(totals.tip, 447);
});

test('a typed tip beats the percentage buttons', () => {
  const totals = calculateOrderTotals(twoItems, { tipBasisPoints: 1800, tipCents: 500 });
  assert.equal(totals.tip, 500);
});

test('a negative typed tip is treated as none', () => {
  const totals = calculateOrderTotals(twoItems, { tipCents: -500 });
  assert.equal(totals.tip, 0);
});

test('the total is the sum of its stated parts', () => {
  const totals = calculateOrderTotals(twoItems, { orderTypeId: 'delivery', tipBasisPoints: 1500 });
  assert.equal(totals.total, totals.goods + totals.deliveryFee + totals.tax + totals.tip);
});
