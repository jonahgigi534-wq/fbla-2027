/**
 * Tests for the assembled menu's showcase list.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FEATURED_PIES } from '../src/js/data/menu.js';

test('every featured pie is a real bakery item with a photo of its own', () => {
  assert.ok(FEATURED_PIES.length > 0);
  for (const pie of FEATURED_PIES) {
    assert.ok(pie, 'a featured id does not match any item');
    assert.equal(pie.sectionId, 'bakery', `${pie.id} is not from the bakery`);
    assert.ok(pie.photo && !pie.photo.isCategoryPhoto, `${pie.id} has no photo of its own`);
  }
});

test('the home screen shows no pie twice', () => {
  const ids = FEATURED_PIES.map((pie) => pie.id);
  assert.equal(new Set(ids).size, ids.length);
});
