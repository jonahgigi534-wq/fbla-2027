/**
 * Tests for deriving allergens and dietary tags from ingredient text.
 *
 * Whole word matching is the point. A substring search for "ham" flags every item
 * mentioning graham cracker, which would put a meat warning on most of the pies.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDietaryTags,
  containsMeat,
  detectAllergens,
  toWords,
} from '../src/js/domain/dietary.js';
import {
  ALLERGEN_KEYWORDS,
  MEAT_KEYWORDS,
  MEAT_WORDS_WITH_MEATLESS_USES,
} from '../src/js/data/dietaryRules.js';
import { findItem } from '../src/js/data/menu.js';

test('splits text into lowercase words without punctuation', () => {
  assert.deepEqual(toWords("O'Brien Potatoes, Fried"), ['o', 'brien', 'potatoes', 'fried']);
});

test('finds the allergens an ingredient list implies', () => {
  const words = toWords('Pie Crust, Pecan Pieces, Vanilla Custard, Whipped Cream');
  const found = detectAllergens(words, ALLERGEN_KEYWORDS);
  assert.ok(found.includes('tree-nut'));
  assert.ok(found.includes('dairy'));
  assert.ok(found.includes('wheat'));
});

test('returns allergens sorted so two items agree on order', () => {
  const words = toWords('Egg, Cheese, Pecan');
  assert.deepEqual(detectAllergens(words, ALLERGEN_KEYWORDS), ['dairy', 'egg', 'tree-nut']);
});

test('finds nothing in a plain ingredient list', () => {
  assert.deepEqual(detectAllergens(toWords('Sliced Tomatoes'), ALLERGEN_KEYWORDS), []);
});

test('graham cracker is not treated as ham', () => {
  assert.equal(containsMeat(toWords('Graham Cracker Crust'), MEAT_KEYWORDS), false);
});

test('an actual meat word is caught', () => {
  assert.equal(containsMeat(toWords('4 Bacon Strips'), MEAT_KEYWORDS), true);
  assert.equal(containsMeat(toWords('Deli Turkey Breast'), MEAT_KEYWORDS), true);
});

test('a meat word overrides a vegetarian tag set by hand', () => {
  const words = toWords('Salad with Grilled Chicken');
  assert.deepEqual(buildDietaryTags(words, ['vegetarian'], MEAT_KEYWORDS), []);
});

test('anything vegan is also vegetarian', () => {
  const words = toWords('Sliced Tomatoes');
  assert.deepEqual(buildDietaryTags(words, ['vegan'], MEAT_KEYWORDS), ['vegan', 'vegetarian']);
});

test('tags come back sorted and free of duplicates', () => {
  const words = toWords('Apple Filling');
  assert.deepEqual(
    buildDietaryTags(words, ['vegetarian', 'vegetarian', 'sugar-free'], MEAT_KEYWORDS),
    ['sugar-free', 'vegetarian']
  );
});

test('a hand set vegetarian tag survives a word that also names a meatless dish', () => {
  const words = toWords('Battered Cauliflower Wings, Fried');
  assert.deepEqual(
    buildDietaryTags(words, ['vegetarian'], MEAT_KEYWORDS, MEAT_WORDS_WITH_MEATLESS_USES),
    ['vegetarian']
  );
});

test('a clear meat word still beats a hand set tag when meatless uses are given', () => {
  const words = toWords('Buffalo Chicken Wings');
  assert.deepEqual(
    buildDietaryTags(words, ['vegetarian'], MEAT_KEYWORDS, MEAT_WORDS_WITH_MEATLESS_USES),
    []
  );
});

test('cauliflower wings and hash browns show as vegetarian on the menu', () => {
  for (const id of ['cauliflower-wings', 'side-hash-brown', 'tray-hash-browns-large']) {
    assert.ok(findItem(id).dietaryTags.includes('vegetarian'), `${id} lost its tag`);
  }
});
