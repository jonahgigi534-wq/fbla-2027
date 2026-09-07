/**
 * Tests for semantic order rules.
 *
 * Every one of these takes the moment to test as an argument, which is what makes
 * "is that card expired on this date" a test rather than something that only fails
 * once the calendar catches up.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isBudgetCapUsable,
  isCardStillValid,
  isDateRangeUsable,
  isSlotUsable,
  isZipInDeliveryArea,
  meetsDeliveryMinimum,
} from '../src/js/domain/orderRules.js';

const kirby = {
  id: 'kirby',
  name: 'Kirby',
  hoursLabel: 'Monday to Sunday, 7:00 AM to midnight',
  deliveryZips: ['77005', '77098'],
  hours: Array.from({ length: 7 }, () => ({ openMinute: 420, closeMinute: 1440 })),
};

const tuesdayEvening = new Date(2026, 8, 8, 18, 0);

test('accepts a ZIP the restaurant delivers to', () => {
  assert.equal(isZipInDeliveryArea('77098', kirby).valid, true);
});

test('refuses a ZIP outside the area and offers pickup instead', () => {
  const result = isZipInDeliveryArea('90210', kirby);
  assert.equal(result.valid, false);
  assert.match(result.message, /does not deliver to 90210/);
  assert.match(result.message, /pickup/);
});

test('the delivery minimum applies only to delivery', () => {
  assert.equal(meetsDeliveryMinimum(500, 'pickup').valid, true);
  assert.equal(meetsDeliveryMinimum(500, 'dine-in').valid, true);
  assert.equal(meetsDeliveryMinimum(500, 'delivery').valid, false);
});

test('says how much more is needed to reach the delivery minimum', () => {
  const result = meetsDeliveryMinimum(900, 'delivery');
  assert.match(result.message, /Add \$6\.00 more/);
});

test('a card is good through the end of its stated month', () => {
  const endOfApril = new Date(2029, 3, 30);
  assert.equal(isCardStillValid('04/29', endOfApril).valid, true);
});

test('a card expired last month is refused', () => {
  assert.equal(isCardStillValid('01/25', tuesdayEvening).valid, false);
  assert.equal(isCardStillValid('08/26', new Date(2026, 8, 1)).valid, false);
});

test('a future card passes', () => {
  assert.equal(isCardStillValid('04/29', tuesdayEvening).valid, true);
});

test('a missing collection time is refused before anything else', () => {
  assert.equal(isSlotUsable({ slot: null, location: kirby, now: tuesdayEvening }).valid, false);
});

test('a collection time in the past is refused', () => {
  const slot = { minute: 600, dayOffset: 0, key: 'k' };
  const result = isSlotUsable({ slot, location: kirby, now: tuesdayEvening });
  assert.equal(result.valid, false);
  assert.match(result.message, /already passed/);
});

test('a collection time inside the prep window explains why', () => {
  const slot = { minute: 18 * 60 + 10, dayOffset: 0, key: 'k' };
  const result = isSlotUsable({ slot, location: kirby, now: tuesdayEvening });
  assert.equal(result.valid, false);
  assert.match(result.message, /kitchen needs time/);
});

test('a catering order cannot be collected before its notice period', () => {
  const slot = { minute: 20 * 60, dayOffset: 0, key: 'k' };
  const result = isSlotUsable({ slot, location: kirby, now: tuesdayEvening, leadTimeHours: 48 });
  assert.equal(result.valid, false);
  assert.match(result.message, /48 hours notice/);
});

test('a time outside opening hours names the hours', () => {
  const slot = { minute: 5 * 60, dayOffset: 1, key: 'k' };
  const result = isSlotUsable({ slot, location: kirby, now: tuesdayEvening });
  assert.equal(result.valid, false);
  assert.match(result.message, /closed at that time/);
});

test('a full slot is refused even though it is otherwise fine', () => {
  const slot = { minute: 20 * 60, dayOffset: 0, key: 'full-slot' };
  const orders = Array.from({ length: 4 }, () => ({
    locationId: 'kirby',
    slotKey: 'full-slot',
    status: 'Received',
  }));
  const result = isSlotUsable({ slot, location: kirby, now: tuesdayEvening, orders });
  assert.equal(result.valid, false);
  assert.match(result.message, /just filled up/);
});

test('a canceled order does not hold its slot', () => {
  const slot = { minute: 20 * 60, dayOffset: 0, key: 'slot' };
  const orders = Array.from({ length: 4 }, () => ({
    locationId: 'kirby',
    slotKey: 'slot',
    status: 'Canceled',
  }));
  assert.equal(isSlotUsable({ slot, location: kirby, now: tuesdayEvening, orders }).valid, true);
});

test('clearing a budget cap is always allowed', () => {
  assert.equal(isBudgetCapUsable(null, 5000).valid, true);
});

test('a cap below the current cart is refused rather than instantly broken', () => {
  const result = isBudgetCapUsable(1000, 2685);
  assert.equal(result.valid, false);
  assert.match(result.message, /\$26\.85/);
});

test('a cap of zero or less is refused', () => {
  assert.equal(isBudgetCapUsable(0, 100).valid, false);
  assert.equal(isBudgetCapUsable(-500, 100).valid, false);
});

test('a backwards date range says to swap them', () => {
  const result = isDateRangeUsable('2026-06-30', '2026-06-01');
  assert.equal(result.valid, false);
  assert.match(result.message, /Swap them/);
});

test('a range of a single day is fine', () => {
  assert.equal(isDateRangeUsable('2026-06-01', '2026-06-01').valid, true);
});

test('a missing date is refused', () => {
  assert.equal(isDateRangeUsable('', '2026-06-01').valid, false);
});
