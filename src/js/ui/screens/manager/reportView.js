/**
 * What the reports screen is currently set to, and the small helpers every part of
 * it needs to read that.
 *
 * The settings live at module level rather than in app/store.js because they
 * describe how one screen is being looked at, not anything about the restaurant.
 * They survive leaving the screen and coming back, which is the behavior a manager
 * checking two ranges in a row expects.
 *
 * Shared by reports.js, reportControls.js, and reportTable.js.
 */

import { ORDER_TYPES } from '../../../app/store.js';
import { findCategory, findItem } from '../../../data/menu.js';
import { findLocation } from '../../../data/locations.js';
import { METRIC_OPTIONS } from '../../../domain/reports.js';
import { formatUSD } from '../../../domain/money.js';

/** Ready made ranges, because typing two dates to see last week is tedious. */
export const RANGE_PRESETS = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
];

/**
 * Returns an ISO date a number of days before today.
 *
 * @param {number} daysAgo How far back.
 * @returns {string} An ISO date such as '2026-08-07'.
 */
export function isoDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

/** What the manager has the controls set to. Kept across visits to the screen. */
export const view = {
  startDate: isoDaysAgo(29),
  endDate: isoDaysAgo(0),
  locationId: '',
  orderTypeId: '',
  groupBy: 'category',
  metric: 'revenue',
  sortDirection: 'desc',
};

/**
 * Turns a row key into something readable.
 *
 * Keys are ids for items, categories, and restaurants, and already readable for the
 * date and hour groupings.
 *
 * @param {string} key The row key.
 * @returns {string} A name a person would recognize.
 */
export function labelForKey(key) {
  if (view.groupBy === 'item') {
    return findItem(key)?.name ?? key;
  }
  if (view.groupBy === 'category') {
    return findCategory(key)?.name ?? key;
  }
  if (view.groupBy === 'location') {
    return findLocation(key)?.name ?? key;
  }
  if (view.groupBy === 'orderType') {
    return ORDER_TYPES.find((type) => type.id === key)?.label ?? key;
  }
  return key;
}

/**
 * Formats a measure for display.
 *
 * @param {number} value The figure.
 * @param {string} metric Which measure it is.
 * @returns {string} Money or a plain count.
 */
export function formatMetric(value, metric) {
  const option = METRIC_OPTIONS.find((candidate) => candidate.id === metric);
  return option && option.isMoney ? formatUSD(value) : String(value);
}
