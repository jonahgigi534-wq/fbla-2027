/**
 * Turning a cart into an order, and what happens to it afterwards.
 *
 * Placing an order does four things that have to happen together: it records the
 * order, it takes the stock off the shelf, it empties the cart, and it moves the
 * order number on. Doing them in one update means no screen can ever catch the
 * program half way through, holding an order that was never paid for or stock that
 * was sold twice.
 */

import { getState, update } from './store.js';
import { ORDER_STATUSES, CANCELLED, canCancel, nextStatus } from '../domain/orders.js';
import { stockFor } from '../domain/inventory.js';
import { findItem } from '../data/menu.js';

/**
 * Places the order currently in the cart.
 *
 * @param {object} details What checkout collected.
 * @param {object} details.customer Name, phone, email, and delivery address if any.
 * @param {string} details.cardLastFour The last four digits, which is all that is kept.
 * @param {object} details.slot The chosen collection slot.
 * @param {object} details.totals The price breakdown from calculateOrderTotals.
 * @returns {object} The order that was created.
 */
export function placeOrder({ customer, cardLastFour, slot, totals }) {
  const state = getState();

  const order = {
    orderNumber: state.nextOrderNumber,
    placedAt: new Date().toISOString(),
    locationId: state.locationId,
    orderTypeId: state.orderTypeId,
    status: ORDER_STATUSES[0],
    lines: state.cart.map((line) => ({ ...line })),
    customer,
    cardLastFour,
    slotKey: slot.key,
    slotLabel: slot.label,
    promoCode: state.promoCode,
    totals,
  };

  // Take the sold stock off the shelf so the next customer sees what is really left.
  const stockOverrides = { ...state.stockOverrides };
  for (const line of state.cart) {
    const item = findItem(line.itemId);
    if (item) {
      stockOverrides[line.itemId] = Math.max(stockFor(item, stockOverrides) - line.quantity, 0);
    }
  }

  update((current) => ({
    orders: [order, ...current.orders],
    stockOverrides,
    cart: [],
    promoCode: null,
    budgetCapCents: null,
    nextOrderNumber: current.nextOrderNumber + 1,
  }));

  return order;
}

/**
 * Cancels an order and puts its stock back on the shelf.
 *
 * Returning the stock matters: an order cancelled before the kitchen started is food
 * that was never made, and leaving it deducted would slowly show the restaurant as
 * sold out of things it still has.
 *
 * @param {number} orderNumber The order to cancel.
 * @returns {{ok: boolean, message: string}} Whether it was cancelled, and why not.
 */
export function cancelOrder(orderNumber) {
  const state = getState();
  const order = state.orders.find((candidate) => candidate.orderNumber === orderNumber);

  if (!order) {
    return { ok: false, message: 'We could not find that order.' };
  }
  if (!canCancel(order)) {
    return {
      ok: false,
      message: `Order ${orderNumber} is already ${order.status.toLowerCase()}, so it is too late to cancel.`,
    };
  }

  const stockOverrides = { ...state.stockOverrides };
  for (const line of order.lines) {
    const item = findItem(line.itemId);
    if (item) {
      stockOverrides[line.itemId] = stockFor(item, stockOverrides) + line.quantity;
    }
  }

  update((current) => ({
    orders: current.orders.map((candidate) =>
      candidate.orderNumber === orderNumber ? { ...candidate, status: CANCELLED } : candidate
    ),
    stockOverrides,
  }));

  return { ok: true, message: `Order ${orderNumber} cancelled. Nothing was charged.` };
}

/**
 * Moves an order to its next stage, used by the manager queue.
 *
 * @param {number} orderNumber The order to advance.
 * @returns {{ok: boolean, message: string}} Whether it moved, and why not.
 */
export function advanceOrder(orderNumber) {
  const state = getState();
  const order = state.orders.find((candidate) => candidate.orderNumber === orderNumber);

  if (!order) {
    return { ok: false, message: 'We could not find that order.' };
  }
  const next = nextStatus(order.status);
  if (next === null) {
    return { ok: false, message: `Order ${orderNumber} is already ${order.status.toLowerCase()}.` };
  }

  update((current) => ({
    orders: current.orders.map((candidate) =>
      candidate.orderNumber === orderNumber ? { ...candidate, status: next } : candidate
    ),
  }));
  return { ok: true, message: `Order ${orderNumber} is now ${next}.` };
}

/**
 * Puts a past order's items back in the cart.
 *
 * Lines the restaurant no longer sells are skipped rather than silently added at a
 * price that no longer exists, and the customer is told how many were dropped.
 *
 * @param {number} orderNumber The order to repeat.
 * @returns {{ok: boolean, message: string}} What ended up in the cart.
 */
export function reorder(orderNumber) {
  const state = getState();
  const order = state.orders.find((candidate) => candidate.orderNumber === orderNumber);

  if (!order) {
    return { ok: false, message: 'We could not find that order.' };
  }

  const available = order.lines.filter((line) => findItem(line.itemId));
  const dropped = order.lines.length - available.length;

  update(() => ({ cart: available.map((line) => ({ ...line })) }));

  return {
    ok: true,
    message:
      dropped === 0
        ? `Order ${orderNumber} is back in your cart.`
        : `Added what we still sell. ${dropped} item${dropped === 1 ? '' : 's'} from that order are no longer on the menu.`,
  };
}
