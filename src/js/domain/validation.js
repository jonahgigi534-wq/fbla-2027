/**
 * Syntactic validation: is this value even the right shape?
 *
 * Whether a ZIP is one this restaurant delivers to is a different question, answered in
 * orderRules.js, and each gets its own message.
 */

/** A result meaning the value is fine. */
const OK = { valid: true, message: null };

/**
 * Builds a failure result.
 *
 * @param {string} message What is wrong, written for the customer.
 * @returns {{valid: boolean, message: string}} A failure.
 */
function fail(message) {
  return { valid: false, message };
}

/**
 * Checks a person's name.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateName(value) {
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return fail('Please enter the name for the order.');
  }
  if (trimmed.length < 2) {
    return fail('That name looks too short. Please enter at least two characters.');
  }
  if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(trimmed)) {
    return fail('Names can use letters, spaces, apostrophes, and hyphens only.');
  }
  return OK;
}

/**
 * Checks a US phone number.
 *
 * Formatting is stripped first, so (713) 528-3816 and 7135283816 both pass.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validatePhone(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits === '') {
    return fail('Please enter a phone number so we can reach you about the order.');
  }
  if (digits.length !== 10) {
    return fail('A US phone number needs 10 digits, for example (713) 528-3816.');
  }
  if (digits.startsWith('0') || digits.startsWith('1')) {
    return fail('Area codes do not start with 0 or 1. Please check the number.');
  }
  return OK;
}

/**
 * Checks an email address.
 *
 * Deliberately loose, since a strict pattern rejects real addresses more often than it
 * catches typos.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateEmail(value) {
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return fail('Please enter an email address for your receipt.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return fail('That does not look like an email address. Check for a missing @ or dot.');
  }
  return OK;
}

/**
 * Checks a five digit ZIP code.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateZip(value) {
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return fail('Please enter your ZIP code.');
  }
  if (!/^\d{5}$/.test(trimmed)) {
    return fail('A ZIP code is five digits, for example 77098.');
  }
  return OK;
}

/**
 * Checks a street address.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateStreet(value) {
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return fail('Please enter the street address for the delivery.');
  }
  if (!/\d/.test(trimmed)) {
    return fail('A delivery address needs a house or building number.');
  }
  return OK;
}

/**
 * Runs the Luhn checksum over a card number.
 *
 * Catches single digit typos and most swapped pairs, the only card check possible
 * without a payment processor.
 *
 * @param {string} digits The card number with all formatting removed.
 * @returns {boolean} True when the checksum passes.
 */
export function passesLuhn(digits) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Checks a card number's shape and checksum.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateCardNumber(value) {
  const digits = String(value).replace(/[\s-]/g, '');
  if (digits === '') {
    return fail('Please enter a card number.');
  }
  if (!/^\d+$/.test(digits)) {
    return fail('A card number is digits only, with spaces or dashes if you like.');
  }
  if (digits.length < 13 || digits.length > 19) {
    return fail('Card numbers are between 13 and 19 digits long.');
  }
  if (!passesLuhn(digits)) {
    return fail('That card number fails its checksum, so a digit is probably mistyped.');
  }
  return OK;
}

/**
 * Checks a card expiry in MM/YY form.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateExpiryFormat(value) {
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return fail('Please enter the expiry date.');
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmed)) {
    return fail('Enter the expiry as MM/YY, for example 04/29.');
  }
  return OK;
}

/**
 * Checks a security code.
 *
 * @param {string} value Raw text from the field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateSecurityCode(value) {
  const trimmed = String(value).trim();
  if (!/^\d{3,4}$/.test(trimmed)) {
    return fail('The security code is the 3 or 4 digits on your card.');
  }
  return OK;
}

/** Every OpenRouter key starts with this. */
const OPENROUTER_KEY_PREFIX = 'sk-or-';

/** Shorter than this and part of the key was left behind when it was copied. */
const MIN_KEY_LENGTH = 20;

/**
 * Checks the shape of an OpenRouter key before it is saved.
 *
 * Only the shape. Whether OpenRouter accepts the key is found out by the first
 * question.
 *
 * @param {string} value Raw text from the key field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateApiKey(value) {
  const trimmed = value.trim();
  if (trimmed === '') {
    return fail('Paste the key from your OpenRouter account.');
  }
  if (/\s/.test(trimmed)) {
    return fail('A key has no spaces in it. Copy it again.');
  }
  if (!trimmed.startsWith(OPENROUTER_KEY_PREFIX)) {
    return fail(
      `OpenRouter keys start with ${OPENROUTER_KEY_PREFIX}. Check this one came from OpenRouter.`
    );
  }
  if (trimmed.length < MIN_KEY_LENGTH) {
    return fail('That key looks too short. Copy the whole thing.');
  }
  return OK;
}
