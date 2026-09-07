/**
 * Tests for the assistant's matching.
 *
 * These are the questions a judge would actually type, including the misspellings.
 * The typo cases are not decoration: a single fuzzy match has to score above the
 * confidence floor on its own, and an earlier version of this did not, so questions
 * whose only signal was a misspelled keyword fell silently to the fallback.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findAnswer, isWithinOneEdit, normalize, tokenize } from '../src/js/domain/assistant.js';
import { INTENTS } from '../src/js/data/assistantKnowledge.js';

/** Real phrasings mapped to the intent that should answer them. */
const PHRASINGS = [
  ['what is vegetarian', 'diet'],
  ['do you have vegan food', 'diet'],
  ['gluten free?', 'diet'],
  ['anything under $10', 'cheap'],
  ['whats the cheapest thing', 'cheap'],
  ['im on a budget', 'cheap'],
  ['what do you recommend', 'popular'],
  ['whats good here', 'popular'],
  ['best seller', 'popular'],
  ['what is sold out', 'soldout'],
  ['out of stock items', 'soldout'],
  ['is anything unavailable', 'soldout'],
  ['when do you close', 'hours'],
  ['are you open now', 'hours'],
  ['what time do you open', 'hours'],
  ['do you deliver', 'delivery'],
  ['is pickup available', 'delivery'],
  ['where is my order', 'order-status'],
  ['track my order', 'order-status'],
  ['whats in my cart', 'cart'],
  ['my basket', 'cart'],
  ['what has nuts', 'allergens'],
  ['im allergic to dairy', 'allergens'],
  ['do you do catering', 'catering'],
  ['i need a tray for an event', 'catering'],
  ['any discounts', 'promo'],
  ['promo code', 'promo'],
  ['how do i order', 'how-to-order'],
  ['how does this work', 'how-to-order'],
  ['where are you located', 'locations'],
  ['how many locations', 'locations'],
  ['can i set a spending limit', 'budget'],
];

/** The same questions, misspelled the way a phone keyboard produces. */
const MISSPELLINGS = [
  ['vegitarian options', 'diet'],
  ['can i get delivary', 'delivery'],
  ['opening hourz', 'hours'],
  ['deliverry', 'delivery'],
  ['cateering', 'catering'],
  ['recomend something', 'popular'],
  ['whats sold out today', 'soldout'],
  ['do you have a coupon', 'promo'],
];

test('normalises punctuation and casing away', () => {
  assert.equal(normalize("What's VEGETARIAN?!"), 'what s vegetarian');
});

test('drops words too common to tell intents apart', () => {
  assert.deepEqual(tokenize('do you have any vegan food'), ['vegan', 'food']);
});

test('treats a one letter difference as the same word', () => {
  assert.equal(isWithinOneEdit('vegetarian', 'vegitarian'), true);
  assert.equal(isWithinOneEdit('discount', 'discounts'), true);
  assert.equal(isWithinOneEdit('order', 'oder'), true);
});

test('does not treat genuinely different words as the same', () => {
  assert.equal(isWithinOneEdit('vegetarian', 'vegan'), false);
  assert.equal(isWithinOneEdit('pickup', 'delivery'), false);
});

for (const [question, expected] of PHRASINGS) {
  test(`answers "${question}" with the ${expected} intent`, () => {
    const result = findAnswer(INTENTS, question);
    assert.equal(result.matched, true, `"${question}" matched nothing`);
    assert.equal(result.intent.id, expected);
  });
}

for (const [question, expected] of MISSPELLINGS) {
  test(`recovers from the typo in "${question}"`, () => {
    const result = findAnswer(INTENTS, question);
    assert.equal(result.matched, true, `"${question}" matched nothing`);
    assert.equal(result.intent.id, expected);
  });
}

test('nonsense still gets somewhere to go next', () => {
  for (const question of ['zzqqx', 'asdfgh', '????', 'purple monkey dishwasher']) {
    const result = findAnswer(INTENTS, question);
    assert.equal(result.matched, false);
    assert.ok(result.suggestions.length > 0, `"${question}" offered nothing`);
  }
});

test('an empty question offers topics rather than throwing', () => {
  const result = findAnswer(INTENTS, '   ');
  assert.equal(result.matched, false);
  assert.ok(result.suggestions.length > 0);
});

test('every intent can be reached by its own suggested label', () => {
  for (const intent of INTENTS.filter((candidate) => candidate.isSuggested)) {
    const result = findAnswer(INTENTS, intent.label);
    assert.equal(result.matched, true, `the chip "${intent.label}" matched nothing`);
  }
});
