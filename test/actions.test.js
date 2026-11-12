/**
 * Tests for the customer actions that do not need a screen.
 *
 * Node has no localStorage, so the store falls back to memory, which is all these need.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPromoCode } from '../src/js/app/actions.js';

test('an empty promo box asks for a code instead of calling it unrecognized', () => {
  assert.deepEqual(applyPromoCode(''), { ok: false, message: 'Enter a promo code first.' });
  assert.deepEqual(applyPromoCode('   '), { ok: false, message: 'Enter a promo code first.' });
});

test('a code that does not exist is still named in the message', () => {
  const result = applyPromoCode('nope');
  assert.equal(result.ok, false);
  assert.match(result.message, /NOPE is not a code we recognize/);
});
