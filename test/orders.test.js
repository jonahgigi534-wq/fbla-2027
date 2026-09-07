/**
 * Tests for the order status machine.
 *
 * The window in which an order can still be changed is the rule these protect.
 * Canceling is fine while the ticket is in the queue and not fine once the kitchen
 * has started, because by then the ingredients are gone whatever anyone decides.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANCELED,
  ORDER_STATUSES,
  canCancel,
  canModify,
  describeStatus,
  nextStatus,
} from '../src/js/domain/orders.js';

test('statuses run in a fixed sequence', () => {
  assert.deepEqual(ORDER_STATUSES, ['Received', 'Baking', 'Ready', 'Complete']);
});

test('each stage knows the one after it', () => {
  assert.equal(nextStatus('Received'), 'Baking');
  assert.equal(nextStatus('Baking'), 'Ready');
  assert.equal(nextStatus('Ready'), 'Complete');
});

test('the last stage has nowhere further to go', () => {
  assert.equal(nextStatus('Complete'), null);
});

test('a canceled order has no next stage', () => {
  assert.equal(nextStatus(CANCELED), null);
});

test('an order can be canceled and changed only while it is Received', () => {
  assert.equal(canCancel({ status: 'Received' }), true);
  assert.equal(canModify({ status: 'Received' }), true);
  for (const status of ['Baking', 'Ready', 'Complete', CANCELED]) {
    assert.equal(canCancel({ status }), false, `${status} should not be cancellable`);
    assert.equal(canModify({ status }), false, `${status} should not be editable`);
  }
});

test('every status has a sentence a customer can read', () => {
  for (const status of [...ORDER_STATUSES, CANCELED]) {
    const text = describeStatus({ status });
    assert.ok(text.length > 0);
    assert.notEqual(text, 'Status unknown.');
  }
});

test('an unrecognised status does not crash the screen', () => {
  assert.equal(describeStatus({ status: 'Teleported' }), 'Status unknown.');
});
