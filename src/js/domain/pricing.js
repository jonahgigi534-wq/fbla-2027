/**
 * Works out what an order costs.
 *
 * One function, calculateOrderTotals, produces every number a customer sees on the
 * cart screen and the receipt. It is written as a sequence of named steps because
 * the order those steps run in changes the answer, and a reader should be able to
 * see that order rather than infer it:
 *
 *   1. Add up the line items.
 *   2. Take the promo discount off that subtotal.
 *   3. Add the delivery fee, if this is a delivery and it has not been earned free.
 *   4. Charge tax on the discounted goods plus the delivery fee. Texas treats a
 *      delivery charge on taxable goods as taxable itself, so it belongs in the base.
 *   5. Add the tip, calculated before tax the way a paper check works.
 *
 * Applying the discount before tax rather than after matters: a customer taxed on
 * the full price and then given the discount pays more, which is both wrong and the
 * kind of thing nobody notices until a receipt is compared against a till.
 *
 * Every amount is a whole number of cents. See domain/money.js for why.
 */

import { clampToZero, percentOfCents, roundCents, sumCents } from './money.js';

/** Houston combined state and local sales tax, 8.25 percent, in basis points. */
export const SALES_TAX_BASIS_POINTS = 825;

/** Flat delivery charge before any threshold is applied. */
export const DELIVERY_FEE_CENTS = 499;

/** Spend this much on goods and the delivery fee is waived. */
export const FREE_DELIVERY_THRESHOLD_CENTS = 3500;

/** A delivery order below this is not worth a driver, so checkout refuses it. */
export const DELIVERY_MINIMUM_CENTS = 1500;

/** Tip percentages offered as buttons, in basis points. Zero is always allowed. */
export const TIP_PRESETS_BASIS_POINTS = [0, 1000, 1500, 1800, 2000];

/**
 * Adds up one cart line.
 *
 * @param {{priceCents: number, quantity: number}} line A cart line.
 * @returns {number} What that line costs in cents.
 */
export function lineTotalCents(line) {
  return line.priceCents * line.quantity;
}

/**
 * Adds up every line in the cart.
 *
 * @param {object[]} lines Cart lines.
 * @returns {number} The subtotal in cents, before any discount or tax.
 */
export function subtotalCents(lines) {
  return sumCents(lines.map(lineTotalCents));
}

/**
 * Works out what a promo code takes off a subtotal.
 *
 * A percentage promo can have a cap so a large order does not give away more than
 * the restaurant intended, and either kind can require a minimum spend. A discount
 * is never allowed to exceed the subtotal, because money owed back to the customer
 * is not a thing this program can do.
 *
 * @param {number} subtotal The subtotal in cents.
 * @param {object|null} promo A promo from data/promos.js, or null for none.
 * @returns {number} The discount in cents, which is 0 when no promo applies.
 */
export function discountCents(subtotal, promo) {
  if (!promo || subtotal < promo.minimumSpendCents) {
    return 0;
  }
  const raw =
    promo.kind === 'percent' ? percentOfCents(subtotal, promo.basisPoints) : promo.amountCents;
  const capped = promo.maximumDiscountCents ? Math.min(raw, promo.maximumDiscountCents) : raw;
  return Math.min(capped, subtotal);
}

/**
 * Works out the delivery fee for an order.
 *
 * @param {string} orderTypeId 'pickup', 'delivery', or 'dine-in'.
 * @param {number} goodsCents The subtotal after any discount.
 * @returns {number} The fee in cents, which is 0 for pickup, dine in, or a large
 *   enough delivery order.
 */
export function deliveryFeeCents(orderTypeId, goodsCents) {
  if (orderTypeId !== 'delivery' || goodsCents >= FREE_DELIVERY_THRESHOLD_CENTS) {
    return 0;
  }
  return DELIVERY_FEE_CENTS;
}

/**
 * Produces the full price breakdown for an order.
 *
 * Returns every intermediate figure, not just the total, because the cart screen and
 * the printed receipt both have to show the customer how the number was reached. A
 * function that returned only the total would force each of them to redo the middle
 * steps, and the two would drift apart the first time a rule changed.
 *
 * @param {object[]} lines Cart lines, each with priceCents and quantity.
 * @param {object} [options] How this particular order is being placed.
 * @param {string} [options.orderTypeId] 'pickup', 'delivery', or 'dine-in'.
 * @param {object|null} [options.promo] An applied promo from data/promos.js.
 * @param {number} [options.tipBasisPoints] Tip rate, where 10000 is 100 percent.
 * @param {number|null} [options.tipCents] A typed tip amount, which wins over the rate.
 * @returns {object} subtotal, discount, goods, deliveryFee, taxableBase, tax, tip,
 *   and total, all in whole cents.
 */
export function calculateOrderTotals(lines, options = {}) {
  const orderTypeId = options.orderTypeId ?? 'pickup';
  const tipBasisPoints = options.tipBasisPoints ?? 0;

  const subtotal = subtotalCents(lines);
  const discount = discountCents(subtotal, options.promo ?? null);
  const goods = clampToZero(subtotal - discount);
  const deliveryFee = deliveryFeeCents(orderTypeId, goods);
  const taxableBase = goods + deliveryFee;
  const tax = percentOfCents(taxableBase, SALES_TAX_BASIS_POINTS);

  // A typed amount beats the percentage buttons, so a customer who wants to leave
  // exactly five dollars is not talked out of it by rounding.
  const tip =
    options.tipCents !== null && options.tipCents !== undefined
      ? clampToZero(roundCents(options.tipCents))
      : percentOfCents(goods, tipBasisPoints);

  return {
    subtotal,
    discount,
    goods,
    deliveryFee,
    taxableBase,
    tax,
    tip,
    total: goods + deliveryFee + tax + tip,
  };
}
