/**
 * Syntactic validation: is this value even the right shape?
 *
 * These functions ask one question only, whether the characters a customer typed
 * form a well formed phone number, email address, ZIP code, or card number. They
 * know nothing about this restaurant, this order, or the time of day.
 *
 * The questions that need that context, such as whether a ZIP is one this location
 * delivers to or whether a pickup time is inside opening hours, are semantic and
 * live in domain/orderRules.js. Keeping the two apart is deliberate: a field can be
 * perfectly well formed and still be wrong for the order, and a customer is owed a
 * different message in each case.
 *
 * Every function returns the same shape, { valid, message }, so a form can loop over
 * its fields and treat them all alike.
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
 * Apostrophes and hyphens are allowed because plenty of real names contain them.
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
 * Formatting characters are stripped first, so (713) 528-3816 and 7135283816 are
 * both accepted. Refusing a number because of the brackets around the area code
 * would be the program being fussy about something it can fix itself.
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
 * The pattern is deliberately loose. The only way to know an address works is to
 * send to it, and a strict pattern rejects valid addresses more often than it
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
 * Whether we deliver to it is a separate, semantic question, answered by
 * isZipInDeliveryArea in domain/orderRules.js.
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
 * Luhn catches single digit typos and most transposed pairs, which is the whole
 * point here. This program never contacts a payment processor and never stores a
 * card number, so the checksum is the only check that can be made, and it is worth
 * making because it catches the mistake a customer actually makes.
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
 * Whether the date is still in the future is semantic, and lives in
 * domain/orderRules.js so it can be tested against a fixed clock.
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

/**
 * Checks a quantity.
 *
 * Whether the restaurant has that many is semantic, and lives in
 * domain/inventory.js.
 *
 * @param {string|number} value Raw value from a quantity field.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function validateQuantity(value) {
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) {
    return fail('Quantity has to be a whole number.');
  }
  const quantity = Number(text);
  if (quantity < 1) {
    return fail('Quantity has to be at least 1.');
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
 * Only the shape. Whether OpenRouter accepts the key is the semantic half, and only
 * OpenRouter can answer it: the first question asked finds out, and a rejected key
 * says so in the conversation. What this catches is the pasting mistakes, a stray
 * space, half a key, or a key from a different service altogether.
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
