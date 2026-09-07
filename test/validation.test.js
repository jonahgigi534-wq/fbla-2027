/**
 * Tests for syntactic field validation.
 *
 * These check shape only. Whether a value is right for a given order is tested in
 * orderRules.test.js, and keeping the two apart here mirrors the split in the source.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  passesLuhn,
  validateCardNumber,
  validateEmail,
  validateExpiryFormat,
  validateName,
  validatePhone,
  validateQuantity,
  validateSecurityCode,
  validateStreet,
  validateZip,
} from '../src/js/domain/validation.js';

test('accepts a name with an apostrophe or a hyphen', () => {
  assert.equal(validateName("O'Brien").valid, true);
  assert.equal(validateName('Anne-Marie').valid, true);
});

test('rejects an empty, too short, or numeric name', () => {
  assert.equal(validateName('').valid, false);
  assert.equal(validateName('J').valid, false);
  assert.equal(validateName('123').valid, false);
});

test('accepts a phone number however it is punctuated', () => {
  assert.equal(validatePhone('(713) 528-3816').valid, true);
  assert.equal(validatePhone('7135283816').valid, true);
  assert.equal(validatePhone('713.528.3816').valid, true);
});

test('rejects a phone number of the wrong length', () => {
  assert.equal(validatePhone('713528381').valid, false);
  assert.equal(validatePhone('71352838166').valid, false);
});

test('rejects an area code starting 0 or 1, because none do', () => {
  assert.equal(validatePhone('0135283816').valid, false);
  assert.equal(validatePhone('1135283816').valid, false);
});

test('accepts an ordinary email and rejects an obviously broken one', () => {
  assert.equal(validateEmail('orders@example.com').valid, true);
  assert.equal(validateEmail('jonah@').valid, false);
  assert.equal(validateEmail('no-at-sign.com').valid, false);
  assert.equal(validateEmail('').valid, false);
});

test('a ZIP is exactly five digits', () => {
  assert.equal(validateZip('77098').valid, true);
  assert.equal(validateZip('7709').valid, false);
  assert.equal(validateZip('770988').valid, false);
  assert.equal(validateZip('abcde').valid, false);
});

test('a delivery address needs a number on it', () => {
  assert.equal(validateStreet('3112 Kirby Drive').valid, true);
  assert.equal(validateStreet('Kirby Drive').valid, false);
  assert.equal(validateStreet('').valid, false);
});

test('the Luhn checksum accepts valid numbers and rejects a single digit typo', () => {
  assert.equal(passesLuhn('4111111111111111'), true);
  assert.equal(passesLuhn('4111111111111112'), false);
});

test('a card number may be typed with spaces or dashes', () => {
  assert.equal(validateCardNumber('4111 1111 1111 1111').valid, true);
  assert.equal(validateCardNumber('4111-1111-1111-1111').valid, true);
});

test('a card number of the wrong length or with letters is refused', () => {
  assert.equal(validateCardNumber('4111').valid, false);
  assert.equal(validateCardNumber('41111111111111111111').valid, false);
  assert.equal(validateCardNumber('4111abcd11111111').valid, false);
});

test('a failed checksum says a digit is probably mistyped', () => {
  const result = validateCardNumber('4111 1111 1111 1112');
  assert.equal(result.valid, false);
  assert.match(result.message, /checksum/);
});

test('expiry has to be MM slash YY with a real month', () => {
  assert.equal(validateExpiryFormat('04/29').valid, true);
  assert.equal(validateExpiryFormat('13/29').valid, false);
  assert.equal(validateExpiryFormat('00/29').valid, false);
  assert.equal(validateExpiryFormat('4/29').valid, false);
  assert.equal(validateExpiryFormat('04/2029').valid, false);
});

test('a security code is three or four digits', () => {
  assert.equal(validateSecurityCode('123').valid, true);
  assert.equal(validateSecurityCode('1234').valid, true);
  assert.equal(validateSecurityCode('12').valid, false);
  assert.equal(validateSecurityCode('abc').valid, false);
});

test('a quantity is a whole number of at least one', () => {
  assert.equal(validateQuantity('3').valid, true);
  assert.equal(validateQuantity('0').valid, false);
  assert.equal(validateQuantity('-5').valid, false);
  assert.equal(validateQuantity('2.5').valid, false);
  assert.equal(validateQuantity('abc').valid, false);
});
