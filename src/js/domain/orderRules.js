/**
 * Semantic validation: the value is well formed, but is it right for this order?
 *
 * domain/validation.js answers whether a customer typed a real ZIP code. This file
 * answers whether it is a ZIP the Kirby restaurant delivers to. Those are different
 * questions and they deserve different answers, which is the distinction the two
 * modules exist to keep straight.
 *
 * Every rule here needs context that a field on its own does not have: the chosen
 * restaurant, what is in the cart, what the order total came to, or what time it is.
 * The current moment always arrives as an argument rather than being read from the
 * clock, so every rule can be tested at a fixed date.
 *
 * The messages say why, not just no. "Pickup has to be at least 20 minutes out, the
 * kitchen needs time to cook" tells a customer something. "Invalid time" does not.
 */

import { MINIMUM_PREP_MINUTES, SLOT_CAPACITY, bookingsInSlot } from './slots.js';
import { DELIVERY_MINIMUM_CENTS } from './pricing.js';
import { formatUSD } from './money.js';

/** A result meaning the value works for this order. */
const OK = { valid: true, message: null };

/**
 * Builds a failure result.
 *
 * @param {string} message Why this value does not work, written for the customer.
 * @returns {{valid: boolean, message: string}} A failure.
 */
function fail(message) {
  return { valid: false, message };
}

/**
 * Checks that a ZIP code is one the chosen restaurant delivers to.
 *
 * Delivery areas are a fixed list per restaurant rather than a distance calculation.
 * Real areas are drawn around road access, not drawn with a compass, and a list
 * needs no network lookup, which matters for a program that has to run offline.
 *
 * @param {string} zip A five digit ZIP that has already passed validateZip.
 * @param {object} location The chosen restaurant.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function isZipInDeliveryArea(zip, location) {
  if (location.deliveryZips.includes(String(zip).trim())) {
    return OK;
  }
  return fail(
    `${location.name} does not deliver to ${zip}. Switch to pickup, or choose a restaurant closer to you.`
  );
}

/**
 * Checks that a delivery order is worth sending a driver out for.
 *
 * @param {number} goodsCents The subtotal after any discount.
 * @param {string} orderTypeId 'pickup', 'delivery', or 'dine-in'.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function meetsDeliveryMinimum(goodsCents, orderTypeId) {
  if (orderTypeId !== 'delivery' || goodsCents >= DELIVERY_MINIMUM_CENTS) {
    return OK;
  }
  const short = DELIVERY_MINIMUM_CENTS - goodsCents;
  return fail(
    `Delivery orders start at ${formatUSD(DELIVERY_MINIMUM_CENTS)}. Add ${formatUSD(short)} more, or switch to pickup.`
  );
}

/**
 * Checks that a card has not already expired.
 *
 * A card expires at the end of its stated month, so an 04/29 card is good through
 * the last day of April 2029. Comparing against the first of the month would reject
 * a card that is still perfectly valid.
 *
 * @param {string} expiry An MM/YY string that has already passed validateExpiryFormat.
 * @param {Date} now The current moment.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function isCardStillValid(expiry, now) {
  const [monthText, yearText] = String(expiry).trim().split('/');
  const month = Number(monthText);
  const year = 2000 + Number(yearText);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const hasExpired = year < currentYear || (year === currentYear && month < currentMonth);

  return hasExpired ? fail(`That card expired in ${expiry}. Please use a different card.`) : OK;
}

/**
 * Checks that a chosen collection time actually works.
 *
 * Four separate things can be wrong with a time that is perfectly well formed: it
 * can be in the past, too soon for the kitchen, too soon for a catering item that
 * needs days of notice, or already full. Each gets its own message.
 *
 * @param {object} options What is being checked.
 * @param {object} options.slot The chosen slot from domain/slots.js.
 * @param {object} options.location The chosen restaurant.
 * @param {Date} options.now The current moment.
 * @param {number} options.leadTimeHours Notice needed by the slowest item in the cart.
 * @param {object[]} options.orders Orders already placed, for the capacity check.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function isSlotUsable({ slot, location, now, leadTimeHours = 0, orders = [] }) {
  if (!slot) {
    return fail('Please choose a collection time.');
  }

  const minutesFromNow =
    slot.dayOffset * 1440 + slot.minute - (now.getHours() * 60 + now.getMinutes());

  if (minutesFromNow < 0) {
    return fail('That time has already passed. Please choose a later one.');
  }
  if (minutesFromNow < MINIMUM_PREP_MINUTES) {
    return fail(
      `Collection has to be at least ${MINIMUM_PREP_MINUTES} minutes out. The kitchen needs time to cook your order.`
    );
  }
  if (leadTimeHours > 0 && minutesFromNow < leadTimeHours * 60) {
    return fail(
      `Your order has an item that needs ${leadTimeHours} hours notice, so the earliest collection is ${leadTimeHours} hours from now.`
    );
  }

  const dayIndex = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + slot.dayOffset
  ).getDay();
  const hours = location.hours[dayIndex];
  if (slot.minute < hours.openMinute || slot.minute >= hours.closeMinute) {
    return fail(`${location.name} is closed at that time. ${location.hoursLabel}.`);
  }

  if (bookingsInSlot(orders, location.id, slot.key) >= SLOT_CAPACITY) {
    return fail('That time just filled up. Please pick the next available one.');
  }
  return OK;
}

/**
 * Checks a budget cap the customer typed.
 *
 * A cap below what is already in the cart is refused rather than accepted and
 * immediately breached, because a cap that is broken the moment it is set teaches
 * the customer to ignore the warning.
 *
 * @param {number|null} capCents The cap in cents, or null when clearing it.
 * @param {number} currentTotalCents What the order comes to right now.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function isBudgetCapUsable(capCents, currentTotalCents) {
  if (capCents === null) {
    return OK;
  }
  if (capCents <= 0) {
    return fail('A spending limit has to be more than zero.');
  }
  if (capCents < currentTotalCents) {
    return fail(
      `Your cart already comes to ${formatUSD(currentTotalCents)}. Set a limit above that, or remove something first.`
    );
  }
  return OK;
}

/**
 * Checks a report date range.
 *
 * The manager reports screen is where a judge is most likely to type something
 * backwards, so the range is checked rather than silently returning no rows.
 *
 * @param {string} startDate An ISO date such as '2026-06-01'.
 * @param {string} endDate An ISO date such as '2026-06-30'.
 * @returns {{valid: boolean, message: string|null}} The verdict.
 */
export function isDateRangeUsable(startDate, endDate) {
  if (!startDate || !endDate) {
    return fail('Please choose both a start date and an end date.');
  }
  if (startDate > endDate) {
    return fail('The start date is after the end date. Swap them to see results.');
  }
  return OK;
}
