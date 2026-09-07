/**
 * Tests for CSV escaping.
 *
 * Getting this wrong shifts every later column in a row, and the menu supplies real
 * cases: item names contain apostrophes and commas, and a customer can type anything
 * into a special instructions box.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeCell, toCsv } from '../src/js/domain/csv.js';

test('leaves an ordinary value alone', () => {
  assert.equal(escapeCell('Apple Pie'), 'Apple Pie');
  assert.equal(escapeCell(17.95), '17.95');
});

test('quotes a value containing a comma', () => {
  assert.equal(escapeCell('Mac N Cheese, Large'), '"Mac N Cheese, Large"');
});

test('doubles an embedded quote and wraps the value', () => {
  assert.equal(escapeCell('Say "hi"'), '"Say ""hi"""');
});

test('quotes a value containing a line break', () => {
  assert.equal(escapeCell('two\nlines'), '"two\nlines"');
});

test('leaves an apostrophe unquoted, since CSV does not care about it', () => {
  assert.equal(escapeCell("Chef's Salad"), "Chef's Salad");
});

test('turns null and undefined into an empty cell', () => {
  assert.equal(escapeCell(null), '');
  assert.equal(escapeCell(undefined), '');
});

test('joins rows with carriage return and newline', () => {
  const csv = toCsv(
    ['a', 'b'],
    [
      [1, 2],
      [3, 4],
    ]
  );
  assert.equal(csv, 'a,b\r\n1,2\r\n3,4');
});

test('a headers only document is still valid', () => {
  assert.equal(toCsv(['a', 'b'], []), 'a,b');
});
