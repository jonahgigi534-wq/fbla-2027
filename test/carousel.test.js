/**
 * Tests for the carousel paging arithmetic.
 *
 * The case worth pinning is the last page of an uneven list. Five reviews shown three
 * at a time must not scroll two cards off the end and leave a hole, which is what a
 * plain page-times-perView shift does.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { clampPage, pageCount, slideOffset } from '../src/js/domain/carousel.js';

describe('pageCount', () => {
  it('splits an even list into whole pages', () => {
    assert.equal(pageCount(6, 3), 2);
  });

  it('gives an uneven list a final short page', () => {
    assert.equal(pageCount(5, 3), 2);
    assert.equal(pageCount(7, 3), 3);
  });

  it('reports one page when there is nothing to show', () => {
    assert.equal(pageCount(0, 3), 1);
  });

  it('reports one page rather than dividing by zero', () => {
    assert.equal(pageCount(5, 0), 1);
  });
});

describe('clampPage', () => {
  it('keeps a page that exists', () => {
    assert.equal(clampPage(1, 5, 3), 1);
  });

  it('pulls a page past the end back to the last one', () => {
    assert.equal(clampPage(9, 5, 3), 1);
  });

  it('pulls a negative page back to the first', () => {
    assert.equal(clampPage(-4, 5, 3), 0);
  });
});

describe('slideOffset', () => {
  it('does not move for the first page', () => {
    assert.equal(slideOffset(6, 3, 0), 0);
  });

  it('shifts a whole screenful for the second page of an even list', () => {
    assert.equal(slideOffset(6, 3, 1), 3);
  });

  it('backfills the last page instead of leaving a gap', () => {
    // Five cards three at a time: page 1 shows cards 3, 4 and 5, not 4, 5 and a hole.
    assert.equal(slideOffset(5, 3, 1), 2);
  });

  it('does not move when everything already fits', () => {
    assert.equal(slideOffset(2, 3, 1), 0);
  });

  it('stops at the last page when asked for one past the end', () => {
    assert.equal(slideOffset(5, 3, 8), 2);
  });
});
