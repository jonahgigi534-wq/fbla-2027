/**
 * Tests for the pie wheel's turning arithmetic.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FULL_TURN,
  pickSlice,
  rotationToShow,
  sliceAngle,
  sliceAtTop,
} from '../src/js/domain/pieWheel.js';

test('eight slices are 45 degrees each', () => {
  assert.equal(sliceAngle(8), 45);
});

test('the slice the wheel turns to is the one under the pointer', () => {
  for (let index = 0; index < 8; index += 1) {
    for (const current of [0, 30, 725, -90]) {
      const rotation = rotationToShow(index, 8, current);
      assert.equal(sliceAtTop(rotation, 8), index, `slice ${index} from ${current}`);
    }
  }
});

test('the wheel only ever turns forward, by less than one turn', () => {
  for (let index = 0; index < 8; index += 1) {
    const rotation = rotationToShow(index, 8, 100);
    assert.ok(rotation >= 100);
    assert.ok(rotation < 100 + FULL_TURN);
  }
});

test('extra turns add whole turns and still land on the same slice', () => {
  const plain = rotationToShow(3, 8, 0);
  const spun = rotationToShow(3, 8, 0, 4);
  assert.equal(spun - plain, 4 * FULL_TURN);
  assert.equal(sliceAtTop(spun, 8), 3);
});

test('a rotation of zero shows the first slice', () => {
  assert.equal(sliceAtTop(0, 8), 0);
});

test('a random pick never lands on the slice already showing', () => {
  for (let current = 0; current < 8; current += 1) {
    for (const roll of [0, 0.2, 0.5, 0.99]) {
      const pick = pickSlice(8, current, () => roll);
      assert.notEqual(pick, current);
      assert.ok(pick >= 0 && pick < 8);
    }
  }
});

test('a wheel with one slice always picks it', () => {
  assert.equal(pickSlice(1, 0, () => 0.7), 0);
});
