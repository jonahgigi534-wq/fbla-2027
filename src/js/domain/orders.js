/**
 * The life of an order after it is placed.
 *
 * Kept in one place so the customer view, the staff queue, and the reports agree on
 * what state an order is in.
 */

/** The stages an order passes through, in order. */
export const ORDER_STATUSES = ['Received', 'Baking', 'Ready', 'Complete'];

/** An order the customer or the restaurant called off. */
export const CANCELED = 'Canceled';

/**
 * Finds the next stage after the current one.
 *
 * @param {string} status The current status.
 * @returns {string|null} The next status, or null when there is nowhere further to go.
 */
export function nextStatus(status) {
  const index = ORDER_STATUSES.indexOf(status);
  if (index === -1 || index === ORDER_STATUSES.length - 1) {
    return null;
  }
  return ORDER_STATUSES[index + 1];
}

/**
 * Reports whether an order can still be canceled.
 *
 * Only while it is Received. Once the kitchen starts, the food exists.
 *
 * @param {object} order An order.
 * @returns {boolean} True when canceling is still allowed.
 */
export function canCancel(order) {
  return order.status === ORDER_STATUSES[0];
}

/**
 * Reports whether an order can still be changed.
 *
 * @param {object} order An order.
 * @returns {boolean} True when the lines can still be edited.
 */
export function canModify(order) {
  return order.status === ORDER_STATUSES[0];
}

/**
 * Describes what is happening to an order, for the tracker on the order screen.
 *
 * @param {object} order An order.
 * @returns {string} A sentence a customer can read.
 */
export function describeStatus(order) {
  const messages = {
    Received: 'We have your order and the kitchen is about to start.',
    Baking: 'Your order is being made right now.',
    Ready: 'Ready and waiting at the counter.',
    Complete: 'Collected. Thanks for ordering.',
    [CANCELED]: 'This order was canceled and nothing was charged.',
  };
  return messages[order.status] ?? 'Status unknown.';
}
