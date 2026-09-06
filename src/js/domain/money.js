/**
 * Money arithmetic, in whole cents.
 *
 * Every price, subtotal, tax figure, and total in this program is an integer number
 * of cents. Nothing is stored as a decimal. An order that applies a promo code, then
 * 8.25 percent tax, then a tip percentage does three multiplications in a row, and
 * on floating point that reliably produces totals like 24.310000000000002. Working
 * in cents means the arithmetic is exact and the rounding happens once, on purpose,
 * where this module says it does.
 *
 * Pure functions with no imports, so test/money.test.js can exercise the rounding
 * edges directly.
 */

/** Cents in one dollar. */
const CENTS_PER_DOLLAR = 100;

/** Basis points in 100 percent, used to keep percentage rates as integers. */
export const BASIS_POINTS_PER_WHOLE = 10000;

/**
 * Rounds to the nearest whole cent, with exact halves going up.
 *
 * Half up is the rule US retail receipts use, and it is the reason this is not
 * Math.round: Math.round sends negative halves the wrong way, and refunds are
 * negative.
 *
 * @param {number} value A possibly fractional number of cents.
 * @returns {number} A whole number of cents.
 */
export function roundCents(value) {
  return Math.sign(value) * Math.round(Math.abs(value));
}

/**
 * Applies a percentage expressed in basis points and rounds to whole cents.
 *
 * Rates are basis points rather than decimals so the rate itself is exact. Houston's
 * 8.25 percent sales tax is 825 basis points, which no float can misrepresent.
 *
 * @param {number} cents The amount to take a percentage of.
 * @param {number} basisPoints The rate, where 10000 is 100 percent.
 * @returns {number} The percentage of `cents`, rounded to a whole cent.
 */
export function percentOfCents(cents, basisPoints) {
  return roundCents((cents * basisPoints) / BASIS_POINTS_PER_WHOLE);
}

/**
 * Adds a list of cent amounts.
 *
 * @param {number[]} amounts Whole cent amounts.
 * @returns {number} Their sum, or 0 for an empty list.
 */
export function sumCents(amounts) {
  let total = 0;
  for (const amount of amounts) {
    total += amount;
  }
  return total;
}

/**
 * Clamps an amount so it never falls below zero.
 *
 * A discount larger than the subtotal must not turn into money owed to the customer,
 * which is what a bare subtraction would do.
 *
 * @param {number} cents Any whole cent amount.
 * @returns {number} The amount, or 0 when it was negative.
 */
export function clampToZero(cents) {
  return cents < 0 ? 0 : cents;
}

/**
 * Formats cents as US dollars for display.
 *
 * This is the only place a cent amount becomes a string, which is what keeps the
 * arithmetic above from ever seeing a decimal.
 *
 * @param {number} cents A whole number of cents.
 * @returns {string} A string such as '$14.95' or '-$2.00'.
 */
export function formatUSD(cents) {
  const isNegative = cents < 0;
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / CENTS_PER_DOLLAR);
  const remainder = String(absolute % CENTS_PER_DOLLAR).padStart(2, '0');
  const withSeparators = dollars.toLocaleString('en-US');
  return `${isNegative ? '-' : ''}$${withSeparators}.${remainder}`;
}

/**
 * Parses a dollar amount a customer typed into whole cents.
 *
 * Accepts '20', '20.5', '$20.50', and ' 20.50 '. Returns null for anything else,
 * which lets the caller show a validation message instead of guessing.
 *
 * @param {string} text Raw text from an input field.
 * @returns {number|null} Whole cents, or null when the text is not a dollar amount.
 */
export function parseDollarsToCents(text) {
  const cleaned = String(text).trim().replace(/^\$/, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  return roundCents(Number(cleaned) * CENTS_PER_DOLLAR);
}
