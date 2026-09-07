/**
 * Tests for opening hours across three different schedules.
 *
 * The six restaurants do not keep the same hours: Fuqua never closes, Katy runs
 * around the clock at weekends only, and the rest run 7am to midnight. Katy on a
 * Saturday is the case that a location-wide check gets wrong.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  describeStatus,
  formatMinute,
  isOpenAllDay,
  isOpenAt,
  nextOpening,
} from '../src/js/domain/hours.js';
import { DAY_NAMES, findLocation } from '../src/js/data/locations.js';

const kirby = findLocation('kirby');
const fuqua = findLocation('fuqua');
const katy = findLocation('katy');

const tuesday3am = new Date(2026, 8, 8, 3, 0);
const tuesday10am = new Date(2026, 8, 8, 10, 0);
const saturday3am = new Date(2026, 8, 12, 3, 0);

test('formats minutes past midnight as a clock time', () => {
  assert.equal(formatMinute(420), '7:00 AM');
  assert.equal(formatMinute(720), '12:00 PM');
  assert.equal(formatMinute(1425), '11:45 PM');
  assert.equal(formatMinute(0), '12:00 AM');
  assert.equal(formatMinute(1440), '12:00 AM');
});

test('a normal restaurant is shut at three in the morning', () => {
  assert.equal(isOpenAt(kirby, tuesday3am), false);
  assert.equal(isOpenAt(kirby, tuesday10am), true);
});

test('Fuqua is open at every hour of every day', () => {
  assert.equal(isOpenAt(fuqua, tuesday3am), true);
  assert.equal(isOpenAt(fuqua, saturday3am), true);
});

test('Katy is shut at 3am midweek but open at 3am on Saturday', () => {
  assert.equal(isOpenAt(katy, tuesday3am), false);
  assert.equal(isOpenAt(katy, saturday3am), true);
});

test('open all day is asked per weekday, not per restaurant', () => {
  assert.equal(isOpenAllDay(katy, 6), true);
  assert.equal(isOpenAllDay(katy, 2), false);
  assert.equal(isOpenAllDay(fuqua, 2), true);
  assert.equal(isOpenAllDay(kirby, 2), false);
});

test('a closed restaurant reports its next opening later the same day', () => {
  const opening = nextOpening(kirby, tuesday3am);
  assert.equal(opening.dayOffset, 0);
  assert.equal(opening.openMinute, 420);
});

test('a restaurant open around the clock is described as such', () => {
  assert.equal(describeStatus(fuqua, tuesday3am, DAY_NAMES).text, 'Open 24 hours');
});

test('Katy on a Saturday is not described as closing at midnight', () => {
  const status = describeStatus(katy, saturday3am, DAY_NAMES);
  assert.equal(status.isOpen, true);
  assert.equal(status.text, 'Open 24 hours today');
});

test('an ordinary open restaurant names its closing time', () => {
  const status = describeStatus(kirby, tuesday10am, DAY_NAMES);
  assert.equal(status.isOpen, true);
  assert.match(status.text, /closes at midnight/);
});

test('a closed restaurant says when it opens', () => {
  const status = describeStatus(kirby, tuesday3am, DAY_NAMES);
  assert.equal(status.isOpen, false);
  assert.match(status.text, /opens today at 7:00 AM/);
});

test('after closing, the next opening is tomorrow', () => {
  const justAfterMidnight = new Date(2026, 8, 9, 0, 30);
  const status = describeStatus(kirby, justAfterMidnight, DAY_NAMES);
  assert.equal(status.isOpen, false);
  assert.match(status.text, /opens today at 7:00 AM/);
});
