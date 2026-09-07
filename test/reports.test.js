/**
 * Tests for the reporting engine.
 *
 * Two things matter most. Cancelled orders must never count, because they were never
 * revenue. And the comparison period has to be the same length as the chosen one, so
 * a 30 day window is never measured against a 31 day month.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReport,
  compareWithPreviousPeriod,
  filterOrders,
  percentChange,
  previousPeriod,
  sortRows,
} from '../src/js/domain/reports.js';

/**
 * Builds a minimal order for testing.
 *
 * @param {object} options Which fields to set.
 * @returns {object} An order shaped like a real one.
 */
function order({
  number,
  date,
  locationId = 'kirby',
  orderTypeId = 'pickup',
  status = 'Complete',
  lines,
  total,
}) {
  return {
    orderNumber: number,
    placedAt: `${date}T12:00:00.000Z`,
    locationId,
    orderTypeId,
    status,
    lines,
    totals: { total },
  };
}

const pieLine = { itemId: 'pie', categoryId: 'pies', priceCents: 500, quantity: 2 };
const burgerLine = { itemId: 'burger', categoryId: 'burgers', priceCents: 1000, quantity: 1 };
const coffeeLine = { itemId: 'coffee', categoryId: 'drinks', priceCents: 300, quantity: 1 };

const orders = [
  order({ number: 1, date: '2026-06-10', lines: [pieLine], total: 1082 }),
  order({ number: 2, date: '2026-06-11', lines: [pieLine, burgerLine], total: 2164 }),
  order({ number: 3, date: '2026-06-12', locationId: 'katy', lines: [coffeeLine], total: 1082 }),
  order({ number: 4, date: '2026-06-12', status: 'Cancelled', lines: [burgerLine], total: 9999 }),
  order({ number: 5, date: '2026-05-20', lines: [pieLine], total: 1082 }),
];

test('a cancelled order never counts as revenue', () => {
  const kept = filterOrders(orders, { startDate: '2026-06-01', endDate: '2026-06-30' });
  assert.equal(kept.length, 3);
  assert.ok(!kept.some((entry) => entry.orderNumber === 4));
});

test('the date range includes both ends', () => {
  const kept = filterOrders(orders, { startDate: '2026-06-10', endDate: '2026-06-10' });
  assert.equal(kept.length, 1);
});

test('filters narrow to one restaurant or one order type', () => {
  assert.equal(
    filterOrders(orders, { startDate: '2026-01-01', endDate: '2026-12-31', locationId: 'katy' })
      .length,
    1
  );
  assert.equal(
    filterOrders(orders, {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      orderTypeId: 'delivery',
    }).length,
    0
  );
});

test('grouping by day totals the order value', () => {
  const report = buildReport(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'day',
  });
  const eleventh = report.rows.find((row) => row.key === '2026-06-11');
  assert.equal(eleventh.revenue, 2164);
  assert.equal(eleventh.units, 3);
});

test('grouping by item uses line value, not the order total', () => {
  const report = buildReport(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'item',
  });
  const pie = report.rows.find((row) => row.key === 'pie');
  // Two orders, two pies each at five dollars. Tax belongs to the order, not the pie.
  assert.equal(pie.revenue, 2000);
  assert.equal(pie.units, 4);
  assert.equal(pie.orders, 2);
});

test('an order is counted once per bucket even with several matching lines', () => {
  const report = buildReport(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'category',
  });
  const pies = report.rows.find((row) => row.key === 'pies');
  assert.equal(pies.orders, 2);
});

test('average order value divides revenue by orders, not lines', () => {
  const report = buildReport(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'day',
  });
  assert.equal(report.totals.orders, 3);
  assert.equal(report.totals.averageOrder, Math.round(report.totals.revenue / 3));
});

test('an empty range reports zero rather than dividing by zero', () => {
  const report = buildReport(orders, {
    startDate: '2020-01-01',
    endDate: '2020-01-02',
    groupBy: 'day',
  });
  assert.deepEqual(report.rows, []);
  assert.equal(report.totals.averageOrder, 0);
});

test('the previous period is the same length, immediately before', () => {
  assert.deepEqual(previousPeriod('2026-06-01', '2026-06-30'), {
    startDate: '2026-05-02',
    endDate: '2026-05-31',
  });
});

test('a single day compares against the day before', () => {
  assert.deepEqual(previousPeriod('2026-06-10', '2026-06-10'), {
    startDate: '2026-06-09',
    endDate: '2026-06-09',
  });
});

test('percentage change reports null rather than infinity from a zero baseline', () => {
  assert.equal(percentChange(100, 0), null);
  assert.equal(percentChange(150, 100), 50);
  assert.equal(percentChange(50, 100), -50);
});

test('comparing carries the previous figure onto every row', () => {
  const comparison = compareWithPreviousPeriod(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'location',
    metric: 'revenue',
  });
  const kirby = comparison.rows.find((row) => row.key === 'kirby');
  assert.equal(kirby.previousValue, 1082);
  assert.equal(kirby.changePercent, 200);
});

test('sorting orders by a measure and can be flipped', () => {
  const report = buildReport(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'item',
  });
  assert.equal(sortRows(report.rows, 'revenue')[0].key, 'pie');
  assert.equal(sortRows(report.rows, 'revenue', 'asc')[0].key, 'coffee');
});

test('rows tied on a measure fall back to alphabetical order', () => {
  const tied = [
    { key: 'pie', revenue: 2000 },
    { key: 'burger', revenue: 2000 },
  ];
  assert.deepEqual(
    sortRows(tied, 'revenue').map((row) => row.key),
    ['burger', 'pie']
  );
});

test('sorting returns a new array rather than reordering the caller’s', () => {
  const report = buildReport(orders, {
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    groupBy: 'item',
  });
  const before = report.rows.map((row) => row.key);
  sortRows(report.rows, 'revenue', 'asc');
  assert.deepEqual(
    report.rows.map((row) => row.key),
    before
  );
});
