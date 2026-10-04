/**
 * Money arithmetic, in whole cents.
 *
 * Every amount is whole cents, never a decimal, so a promo, tax, and tip in a row
 * cannot produce totals like 24.310000000000002.
 */

/** Cents in one dollar. */
const CENTS_PER_DOLLAR = 100;

/** Basis points in 100 percent, used to keep percentage rates as integers. */
export const BASIS_POINTS_PER_WHOLE = 10000;

/**
 * Rounds to the nearest whole cent, with exact halves going up.
 *
 * Rounds halves up, as US receipts do. Math.round would send negative halves, such as
 * refunds, the wrong way.
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
 * Rates are basis points, so 8.25 percent tax is exactly 825.
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
 * So a discount bigger than the subtotal never becomes money owed to the customer.
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
