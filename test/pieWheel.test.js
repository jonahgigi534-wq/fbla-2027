/**
 * Tests for the pie wheel's turning arithmetic.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FULL_TURN,
  flickRotation,
  pickSlice,
  rotationFromMatrix,
  rotationToShow,
  sliceAngle,
  sliceAtTop,
  snapRotation,
  unwrapNear,
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

test('snapping goes to the nearest slice', () => {
  assert.equal(snapRotation(14, 12), 0);
  assert.equal(snapRotation(16, 12), 30);
  assert.equal(snapRotation(-44, 12), -30);
  assert.equal(snapRotation(-1, 12), 0);
});

test('an angle known only up to a full turn lands on the nearest lap', () => {
  assert.equal(unwrapNear(10, 725), 730);
  assert.equal(unwrapNear(-170, 170), 190);
  assert.equal(unwrapNear(170, -170), -190);
  assert.equal(unwrapNear(45, 45), 45);
});

test('a rotation matrix reads back as the angle that made it', () => {
  for (const degrees of [0, 30, 90, 135, -60, -179]) {
    const radians = (degrees * Math.PI) / 180;
    const read = rotationFromMatrix(Math.cos(radians), Math.sin(radians));
    assert.ok(Math.abs(read - degrees) < 1e-9, `${degrees} read as ${read}`);
  }
});

test('a slow release settles on the nearest slice', () => {
  assert.equal(flickRotation(40, 0, 12), 30);
});

test('a flick carries the wheel on in the direction it was moving', () => {
  const forward = flickRotation(0, 0.5, 12);
  const backward = flickRotation(0, -0.5, 12);
  assert.ok(forward > 0);
  assert.ok(backward < 0);
  assert.equal(sliceAtTop(forward, 12), sliceAtTop(snapRotation(forward, 12), 12));
});

test('even a wild flick goes no more than one turn', () => {
  assert.ok(flickRotation(0, 1000, 12) <= FULL_TURN);
  assert.ok(flickRotation(0, -1000, 12) >= -FULL_TURN);
});
