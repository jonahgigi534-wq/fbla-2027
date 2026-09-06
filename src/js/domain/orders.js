/**
 * The life of an order after it is placed.
 *
 * An order moves through a fixed sequence, and what a customer is allowed to do
 * depends on where it has got to. Cancelling is fine while the ticket is still
 * sitting in the queue, and not fine once the kitchen has started cooking, because
 * by then the ingredients are gone whatever the customer decides.
 *
 * Keeping that rule here rather than in the screens means the customer view, the
 * manager queue, and the reports all agree about what state an order is in.
 */

/** The stages an order passes through, in order. */
export const ORDER_STATUSES = ['Received', 'Baking', 'Ready', 'Complete'];

/** An order the customer or the restaurant called off. */
export const CANCELLED = 'Cancelled';

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
 * Reports whether an order can still be cancelled.
 *
 * Only while it is Received. Once the kitchen has started, the food exists.
 *
 * @param {object} order An order.
 * @returns {boolean} True when cancelling is still allowed.
 */
export function canCancel(order) {
  return order.status === ORDER_STATUSES[0];
}

/**
 * Reports whether an order can still be changed.
 *
 * Same window as cancelling, for the same reason.
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
    [CANCELLED]: 'This order was cancelled and nothing was charged.',
  };
  return messages[order.status] ?? 'Status unknown.';
}
