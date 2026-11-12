/**
 * Tests for the generated order history.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSeedOrders } from '../src/js/data/seedOrders.js';
import { CANCELED } from '../src/js/domain/orders.js';

const orders = generateSeedOrders(new Date('2026-11-01T12:00:00'));

test('a canceled sample order is never labeled as collected', () => {
  const canceled = orders.filter((order) => order.status === CANCELED);
  assert.ok(canceled.length > 0, 'the history should include some canceled orders');
  for (const order of canceled) {
    assert.equal(order.slotLabel, 'Not collected');
  }
});

test('a completed sample order is labeled as collected', () => {
  const complete = orders.filter((order) => order.status !== CANCELED);
  assert.ok(complete.every((order) => order.slotLabel === 'Collected'));
});
