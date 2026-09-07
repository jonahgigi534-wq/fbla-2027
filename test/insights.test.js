/**
 * Tests for the generated report sentences.
 *
 * These have to be true. A sentence that contradicts the table under it is worse
 * than no sentence at all, so the tests check the figures rather than the wording.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInsights,
  peakHourInsight,
  periodSummaryInsight,
  stockWarningInsight,
  topPerformerInsight,
} from '../src/js/domain/insights.js';

const rows = [
  { key: 'pies', revenue: 4000, units: 40, orders: 20, changePercent: 12 },
  { key: 'burgers', revenue: 1000, units: 10, orders: 8, changePercent: -5 },
];

const stockFor = (item, overrides) => overrides[item.id] ?? item.stock;
const catalog = [
  { id: 'a', name: 'Key Lime Pie Slice', stock: 40 },
  { id: 'b', name: 'Texan Omelette', stock: 40 },
  { id: 'c', name: 'Apple Pie Slice', stock: 40 },
];

test('names the biggest earner with its share and direction', () => {
  const sentence = topPerformerInsight(rows, 5000, (key) => key);
  assert.match(sentence, /pies/);
  assert.match(sentence, /80%/);
  assert.match(sentence, /up 12%/);
});

test('says plainly when there is no baseline to compare against', () => {
  const sentence = topPerformerInsight(
    [{ key: 'pies', revenue: 100, changePercent: null }],
    100,
    (key) => key
  );
  assert.match(sentence, /nothing to compare/);
});

test('says nothing at all when there are no rows', () => {
  assert.equal(
    topPerformerInsight([], 0, (key) => key),
    null
  );
});

test('names the busiest hour and its share', () => {
  const sentence = peakHourInsight([
    { key: '19:00', revenue: 700, orders: 10 },
    { key: '08:00', revenue: 300, orders: 6 },
  ]);
  assert.match(sentence, /19:00/);
  assert.match(sentence, /70%/);
});

test('summarises a period against the one before it', () => {
  const sentence = periodSummaryInsight(
    { orders: 100, revenue: 50000, averageOrder: 500 },
    { orders: 80, revenue: 40000, averageOrder: 500 }
  );
  assert.match(sentence, /100 orders/);
  assert.match(sentence, /up 25%/);
});

test('an empty range says so rather than dividing by zero', () => {
  const sentence = periodSummaryInsight({ orders: 0, revenue: 0, averageOrder: 0 }, { revenue: 0 });
  assert.match(sentence, /No orders/);
});

test('names what is running low, lowest first', () => {
  const sentence = stockWarningInsight(catalog, { a: 2, b: 6 }, stockFor);
  assert.match(sentence, /Key Lime Pie Slice \(2\)/);
  assert.match(sentence, /Texan Omelette \(6\)/);
  assert.ok(sentence.indexOf('Key Lime') < sentence.indexOf('Texan'));
});

test('counts what is already sold out separately', () => {
  const sentence = stockWarningInsight(catalog, { a: 0, b: 0 }, stockFor);
  assert.match(sentence, /2 items are sold out/);
});

test('stays quiet when nothing needs restocking', () => {
  assert.equal(stockWarningInsight(catalog, {}, stockFor), null);
});

test('collecting insights drops the ones with nothing to say', () => {
  const sentences = buildInsights({
    rows,
    current: { orders: 28, revenue: 5000, averageOrder: 178 },
    previous: { orders: 20, revenue: 4000, averageOrder: 200 },
    hourRows: [{ key: '19:00', revenue: 5000, orders: 28 }],
    labelFor: (key) => key,
    catalog,
    stockOverrides: {},
    stockFor,
  });
  assert.equal(sentences.length, 3);
  assert.ok(sentences.every((sentence) => typeof sentence === 'string'));
});
