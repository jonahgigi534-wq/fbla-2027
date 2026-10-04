/**
 * Promo codes the restaurant is running.
 *
 * Codes match in any case, and each carries its own rules, so pricing.js applies them
 * all the same way.
 */

/** Every code, in the order the help center lists them. */
export const PROMOS = [
  {
    code: 'PIE10',
    kind: 'percent',
    basisPoints: 1000,
    minimumSpendCents: 0,
    maximumDiscountCents: null,
    description: '10% off your order',
  },
  {
    code: 'SINCE1967',
    kind: 'percent',
    basisPoints: 1500,
    minimumSpendCents: 3000,
    maximumDiscountCents: 1000,
    description: '15% off orders over $30, up to $10 off',
  },
  {
    code: 'LATENIGHT',
    kind: 'amount',
    amountCents: 500,
    minimumSpendCents: 2000,
    maximumDiscountCents: null,
    description: '$5 off orders over $20',
  },
  {
    code: 'FREEDELIVERY',
    kind: 'amount',
    amountCents: 499,
    minimumSpendCents: 2500,
    maximumDiscountCents: null,
    description: 'Delivery fee covered on orders over $25',
  },
];

/**
 * Finds a promo by the code a customer typed.
 *
 * @param {string} code Raw text from the promo field.
 * @returns {object|null} The promo, or null when the code is not one of ours.
 */
export function findPromo(code) {
  const cleaned = String(code).trim().toUpperCase();
  return PROMOS.find((promo) => promo.code === cleaned) ?? null;
}
