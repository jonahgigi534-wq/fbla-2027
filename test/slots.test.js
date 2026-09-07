/**
 * Tests for collection slots and their capacity.
 *
 * The two cases worth pinning are the midnight roll, where ordering at 11:50pm has
 * to offer tomorrow morning rather than a time the restaurant is shut, and the
 * capacity cap that stops everyone choosing 6:30pm.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SLOT_CAPACITY,
  bookingsInSlot,
  buildSlots,
  firstAvailableSlot,
  formatSlot,
  roundUpToSlot,
} from '../src/js/domain/slots.js';
import { findLocation } from '../src/js/data/locations.js';

const kirby = findLocation('kirby');
const fuqua = findLocation('fuqua');

test('rounds up to the next quarter hour', () => {
  assert.equal(roundUpToSlot(1087), 1095);
  assert.equal(roundUpToSlot(1095), 1095);
});

test('formats a slot minute as a clock time', () => {
  assert.equal(formatSlot(1095), '6:15 PM');
  assert.equal(formatSlot(1440), '12:00 AM');
});

test('the earliest slot clears the prep time', () => {
  const slots = buildSlots({ location: kirby, now: new Date(2026, 8, 8, 18, 7), orders: [] });
  assert.equal(slots[0].label, '6:30 PM');
});

test('a catering order pushes the earliest slot two days out', () => {
  const slots = buildSlots({
    location: kirby,
    now: new Date(2026, 8, 8, 18, 7),
    leadTimeHours: 48,
    orders: [],
  });
  assert.match(slots[0].label, /\+2d/);
});

test('ordering just before closing rolls to the next morning', () => {
  const slots = buildSlots({ location: kirby, now: new Date(2026, 8, 8, 23, 50), orders: [] });
  assert.match(slots[0].label, /7:00 AM/);
  assert.match(slots[0].label, /\+1d/);
});

test('a restaurant that never closes offers the very next slot', () => {
  const slots = buildSlots({ location: fuqua, now: new Date(2026, 8, 8, 23, 50), orders: [] });
  assert.equal(slots[0].label, '12:15 AM (+1d)');
});

test('counts only live orders against a slot', () => {
  const orders = [
    { locationId: 'kirby', slotKey: 'k', status: 'Received' },
    { locationId: 'kirby', slotKey: 'k', status: 'Canceled' },
    { locationId: 'katy', slotKey: 'k', status: 'Received' },
  ];
  assert.equal(bookingsInSlot(orders, 'kirby', 'k'), 1);
});

test('a slot holding its capacity is marked full', () => {
  const now = new Date(2026, 8, 8, 18, 7);
  const first = buildSlots({ location: kirby, now, orders: [] })[0];
  const orders = Array.from({ length: SLOT_CAPACITY }, () => ({
    locationId: 'kirby',
    slotKey: first.key,
    status: 'Received',
  }));
  const slots = buildSlots({ location: kirby, now, orders });

  assert.equal(slots[0].isFull, true);
  assert.equal(slots[0].remaining, 0);
  assert.equal(slots[1].isFull, false);
});

test('the next available slot skips the full one', () => {
  const now = new Date(2026, 8, 8, 18, 7);
  const first = buildSlots({ location: kirby, now, orders: [] })[0];
  const orders = Array.from({ length: SLOT_CAPACITY }, () => ({
    locationId: 'kirby',
    slotKey: first.key,
    status: 'Received',
  }));
  const slots = buildSlots({ location: kirby, now, orders });
  assert.equal(firstAvailableSlot(slots).label, '6:45 PM');
});

test('every offered slot falls inside opening hours', () => {
  const slots = buildSlots({ location: kirby, now: new Date(2026, 8, 8, 18, 7), orders: [] });
  for (const slot of slots) {
    assert.ok(slot.minute >= 420 && slot.minute < 1440, `${slot.label} is outside opening hours`);
  }
});
