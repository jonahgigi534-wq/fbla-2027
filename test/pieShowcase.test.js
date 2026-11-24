/**
 * Tests for the pies the home screen shows off.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FEATURED_PIES, SLIDESHOW_PIES, WHEEL_PIES } from '../src/js/data/pieShowcase.js';

const LISTS = { FEATURED_PIES, SLIDESHOW_PIES, WHEEL_PIES };

for (const [name, pies] of Object.entries(LISTS)) {
  test(`every pie in ${name} is a real bakery item with a photo of its own`, () => {
    assert.ok(pies.length > 0);
    for (const pie of pies) {
      assert.ok(pie, `an id in ${name} does not match any item`);
      assert.equal(pie.sectionId, 'bakery', `${pie.id} is not from the bakery`);
      assert.ok(pie.photo && !pie.photo.isCategoryPhoto, `${pie.id} has no photo of its own`);
    }
  });

  test(`${name} shows no pie twice`, () => {
    const ids = pies.map((pie) => pie.id);
    assert.equal(new Set(ids).size, ids.length);
  });
}

test('the slideshow and the featured grid do not repeat each other', () => {
  const featured = new Set(FEATURED_PIES.map((pie) => pie.id));
  for (const pie of SLIDESHOW_PIES) {
    assert.ok(!featured.has(pie.id), `${pie.id} is in both`);
  }
});
