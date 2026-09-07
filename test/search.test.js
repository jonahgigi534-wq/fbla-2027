/**
 * Tests for menu search, filtering, and sorting.
 *
 * The substring case is the one that was actually wrong once: matching descriptions
 * on substrings let the query "key" score every turkey sandwich on the menu.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterItems,
  normalize,
  queryMenu,
  scoreItem,
  sortItems,
} from '../src/js/domain/search.js';
import { ALL_ITEMS } from '../src/js/data/menu.js';

const keyLime = {
  id: 'a',
  name: 'Key Lime Pie Slice',
  description: 'Graham cracker crust and lime juice',
  isPopular: false,
};
const turkey = {
  id: 'b',
  name: 'Turkey Sandwich',
  description: 'Deli turkey breast on a bun',
  isPopular: false,
};

test('normalising strips punctuation and casing', () => {
  assert.equal(normalize('Key-Lime PIE!'), 'key lime pie');
});

test('a name match beats a description match', () => {
  assert.ok(scoreItem(keyLime, 'key lime') > scoreItem(turkey, 'key lime'));
});

test('the query "key" does not score a turkey sandwich', () => {
  assert.equal(scoreItem(turkey, 'key'), 0);
});

test('a name starting with the query beats one merely containing it', () => {
  const starts = { id: 'c', name: 'Pecan Pie', description: '', isPopular: false };
  const contains = { id: 'd', name: 'Texas Pecan Fudge Pie', description: '', isPopular: false };
  assert.ok(scoreItem(starts, 'pecan') > scoreItem(contains, 'pecan'));
});

test('filters combine with and, not or', () => {
  const filtered = filterItems(ALL_ITEMS, { dietaryTags: ['vegan'], maxPriceCents: 500 });
  for (const item of filtered) {
    assert.ok(item.dietaryTags.includes('vegan'), `${item.name} is not vegan`);
    assert.ok(item.priceCents <= 500, `${item.name} costs too much`);
  }
});

test('the in stock filter drops sold out items', () => {
  const filtered = filterItems(ALL_ITEMS, { inStockOnly: true });
  assert.ok(filtered.every((item) => item.stock > 0));
  assert.ok(filtered.length < ALL_ITEMS.length);
});

test('no filters keeps everything', () => {
  assert.equal(filterItems(ALL_ITEMS, {}).length, ALL_ITEMS.length);
});

test('sorting returns a new array rather than reordering the catalog', () => {
  const before = ALL_ITEMS.map((item) => item.id);
  sortItems(ALL_ITEMS, 'price-low');
  assert.deepEqual(
    ALL_ITEMS.map((item) => item.id),
    before
  );
});

test('sorts by price in both directions', () => {
  const low = sortItems(ALL_ITEMS, 'price-low');
  const high = sortItems(ALL_ITEMS, 'price-high');
  assert.ok(low[0].priceCents <= low[low.length - 1].priceCents);
  assert.ok(high[0].priceCents >= high[high.length - 1].priceCents);
});

test('an empty query returns everything in name order', () => {
  const results = queryMenu(ALL_ITEMS, { query: '' });
  assert.equal(results.length, ALL_ITEMS.length);
  assert.ok(results[0].name.localeCompare(results[1].name) <= 0);
});

test('a real search puts the obvious answers first', () => {
  const results = queryMenu(ALL_ITEMS, { query: 'key lime' });
  assert.ok(results.length > 0);
  assert.ok(results.slice(0, 4).every((item) => item.name.toLowerCase().includes('key lime')));
});

test('a search matching nothing returns nothing rather than everything', () => {
  assert.deepEqual(queryMenu(ALL_ITEMS, { query: 'zzqqxx' }), []);
});

test('searching within a section stays in that section', () => {
  const results = queryMenu(ALL_ITEMS, { query: 'pie', filters: { sectionId: 'bakery' } });
  assert.ok(results.length > 0);
  assert.ok(results.every((item) => item.sectionId === 'bakery'));
});
