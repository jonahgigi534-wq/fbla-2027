/**
 * The things a customer can do, expressed once.
 *
 * Screens call these rather than reaching into the store themselves. Adding an item
 * to the cart has to check stock first, and if each screen did that check on its own
 * they would drift, and one of them would eventually forget. Here it happens in one
 * place and every caller gets the same answer.
 *
 * Each function returns a result the screen can show, rather than throwing or
 * silently doing nothing, because every one of these can legitimately be refused.
 */

import { getState, update } from './store.js';
import { addToCart, removeLine, setLineQuantity } from '../domain/cart.js';
import { checkAvailability } from '../domain/inventory.js';
import { findPromo } from '../data/promos.js';
import { isBudgetCapUsable } from '../domain/orderRules.js';
import { parseDollarsToCents } from '../domain/money.js';

/**
 * Adds an item to the cart, refusing when the restaurant does not have enough.
 *
 * @param {object} item A finished catalog item.
 * @param {number} quantity How many to add.
 * @param {string} [note] Special instructions for the kitchen.
 * @returns {{ok: boolean, message: string|null}} Whether it went in, and why not.
 */
export function addItemToCart(item, quantity, note = '') {
  const state = getState();
  const availability = checkAvailability(item, quantity, state.cart, state.stockOverrides);

  if (!availability.allowed) {
    return { ok: false, message: availability.message };
  }
  update((current) => ({ cart: addToCart(current.cart, item, quantity, note) }));
  return { ok: true, message: `${quantity} x ${item.name} added to your order.` };
}

/**
 * Changes the quantity on a cart line, capped at what the restaurant has left.
 *
 * The cap is applied rather than the change refused, so pressing plus once too often
 * leaves the line at the maximum instead of doing nothing and looking broken.
 *
 * @param {string} lineId The line to change.
 * @param {number} quantity The requested new quantity.
 * @param {object|undefined} item The catalog item, for its stock. Undefined skips the cap.
 * @returns {{ok: boolean, message: string|null}} Whether the full change was applied.
 */
export function changeLineQuantity(lineId, quantity, item) {
  const state = getState();

  if (item && quantity > 0) {
    const otherLines = state.cart.filter((line) => line.lineId !== lineId);
    const availability = checkAvailability(item, quantity, otherLines, state.stockOverrides);
    if (!availability.allowed) {
      const capped = availability.remaining;
      update((current) => ({ cart: setLineQuantity(current.cart, lineId, capped) }));
      return { ok: false, message: availability.message };
    }
  }

  update((current) => ({ cart: setLineQuantity(current.cart, lineId, quantity) }));
  return { ok: true, message: null };
}

/**
 * Removes a line from the cart.
 *
 * @param {string} lineId The line to remove.
 * @returns {{ok: boolean, message: string|null}} Always succeeds.
 */
export function removeCartLine(lineId) {
  update((current) => ({ cart: removeLine(current.cart, lineId) }));
  return { ok: true, message: 'Removed from your order.' };
}

/**
 * Applies a promo code.
 *
 * The code is stored rather than the discount, so if the cart changes afterwards the
 * discount is recalculated against the new subtotal. Storing the amount would let a
 * customer earn a large order's discount and then empty the cart.
 *
 * @param {string} code Raw text from the promo field.
 * @returns {{ok: boolean, message: string}} Whether the code was accepted.
 */
export function applyPromoCode(code) {
  const promo = findPromo(code);
  if (!promo) {
    return { ok: false, message: `${code.trim().toUpperCase()} is not a code we recognise.` };
  }
  update(() => ({ promoCode: promo.code }));
  return { ok: true, message: `${promo.code} applied: ${promo.description}.` };
}

/**
 * Removes any applied promo code.
 *
 * @returns {{ok: boolean, message: string}} Always succeeds.
 */
export function clearPromoCode() {
  update(() => ({ promoCode: null }));
  return { ok: true, message: 'Promo code removed.' };
}

/**
 * Sets or clears the customer's spending cap.
 *
 * @param {string} text Raw text from the field, or an empty string to clear it.
 * @param {number} currentTotalCents What the order comes to right now.
 * @returns {{ok: boolean, message: string}} Whether the cap was accepted.
 */
export function setBudgetCap(text, currentTotalCents) {
  if (String(text).trim() === '') {
    update(() => ({ budgetCapCents: null }));
    return { ok: true, message: 'Spending limit removed.' };
  }

  const capCents = parseDollarsToCents(text);
  if (capCents === null) {
    return { ok: false, message: 'Enter an amount like 40 or 40.00.' };
  }

  const verdict = isBudgetCapUsable(capCents, currentTotalCents);
  if (!verdict.valid) {
    return { ok: false, message: verdict.message };
  }

  update(() => ({ budgetCapCents: capCents }));
  return { ok: true, message: 'Spending limit set. We will warn you as you approach it.' };
}

/**
 * Switches between pickup, delivery, and dine in.
 *
 * @param {string} orderTypeId 'pickup', 'delivery', or 'dine-in'.
 * @returns {void}
 */
export function setOrderType(orderTypeId) {
  update(() => ({ orderTypeId }));
}

/**
 * Switches which restaurant the order is going to.
 *
 * @param {string} locationId A location id from data/locations.js.
 * @returns {void}
 */
export function setLocation(locationId) {
  update(() => ({ locationId }));
}
