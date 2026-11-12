/**
 * One order: its receipt, where it has got to, and what can still be done to it.
 *
 * The same screen is the confirmation and the receipt from order history, so the two
 * can never disagree.
 */

import { el, banner, emptyState, render } from '../dom.js';
import { showResult } from '../components/toast.js';
import { getState } from '../../app/store.js';
import { cancelOrder, changeOrderLine, reorder } from '../../app/orderActions.js';
import { navigate } from '../../app/router.js';
import { findLocation } from '../../data/locations.js';
import {
  ORDER_STATUSES,
  CANCELED,
  canCancel,
  canModify,
  describeStatus,
} from '../../domain/orders.js';
import { formatUSD } from '../../domain/money.js';

/**
 * Builds the progress tracker along the top of an order.
 *
 * @param {object} order The order.
 * @returns {HTMLElement} The tracker.
 */
function statusTracker(order) {
  if (order.status === CANCELED) {
    return banner('danger', 'Canceled', describeStatus(order));
  }

  const reachedIndex = ORDER_STATUSES.indexOf(order.status);
  return el(
    'ol',
    { class: 'tracker', 'aria-label': 'Order progress' },
    ORDER_STATUSES.map((stage, index) => {
      const isDone = index < reachedIndex;
      const isCurrent = index === reachedIndex;
      return el(
        'li',
        {
          class: `tracker__step${isDone ? ' tracker__step--done' : ''}${isCurrent ? ' tracker__step--current' : ''}`,
          'aria-current': isCurrent ? 'step' : null,
        },
        [
          el('span', {
            class: 'tracker__dot',
            'aria-hidden': 'true',
            text: isDone ? '✓' : String(index + 1),
          }),
          el('span', { class: 'tracker__label', text: stage }),
        ]
      );
    })
  );
}

/**
 * Builds one row of the printed receipt.
 *
 * @param {string} label What the amount is for.
 * @param {number} cents The amount.
 * @param {boolean} [isTotal] True for the grand total.
 * @returns {HTMLElement} The row.
 */
function receiptRow(label, cents, isTotal = false) {
  return el('div', { class: `total-row${isTotal ? ' total-row--grand' : ''}` }, [
    el('span', { text: label }),
    el('span', { class: 'price', text: formatUSD(cents) }),
  ]);
}

/**
 * Builds one labeled detail on the receipt, such as the name or the card used.
 *
 * @param {string} label What the detail is.
 * @param {string} value The detail itself.
 * @returns {HTMLElement} The detail.
 */
function receiptDetail(label, value) {
  return el('div', {}, [el('strong', { text: label }), el('div', { text: value })]);
}

/**
 * Builds the restaurant's name and address at the top of the receipt.
 *
 * @param {object} location The restaurant the order was placed with.
 * @returns {HTMLElement} The heading block.
 */
function receiptHead(location) {
  return el('div', { class: 'receipt__head' }, [
    el('h2', { text: 'House of Pies' }),
    el('p', {
      class: 'muted',
      text: `${location.name}, ${location.street}, ${location.cityStateZip}`,
    }),
    el('p', { class: 'muted', text: location.phone }),
  ]);
}

/**
 * Builds the details under the heading: when, who, where, and how it was paid.
 *
 * @param {object} order The order being shown.
 * @param {Date} placed When it was placed.
 * @param {boolean} isPickup Whether it is being collected rather than delivered.
 * @returns {HTMLElement} The details block.
 */
function receiptMeta(order, placed, isPickup) {
  const { customer } = order;
  return el('div', { class: 'receipt__meta' }, [
    receiptDetail('Placed', placed.toLocaleString()),
    receiptDetail(isPickup ? 'Collection' : 'Delivery', order.slotLabel),
    receiptDetail('Name', customer.name),
    // The sample history has no phone numbers, and a label over nothing looks broken.
    customer.phone ? receiptDetail('Phone', customer.phone) : null,
    customer.street ? receiptDetail('Address', `${customer.street}, ${customer.zip}`) : null,
    receiptDetail('Paid with', `Card ending ${order.cardLastFour}`),
  ]);
}

/**
 * Builds one of the minus and plus buttons beside a receipt line.
 *
 * @param {object} order The order being shown.
 * @param {object} line The line the button changes.
 * @param {number} step 1 for one more, -1 for one fewer.
 * @returns {HTMLElement} The button.
 */
function stepperButton(order, line, step) {
  const isMore = step > 0;
  return el(
    'button',
    {
      class: 'stepper__button',
      type: 'button',
      'aria-label': `${isMore ? 'One more' : 'One fewer'} ${line.name}`,
      onClick: () =>
        showResult(changeOrderLine(order.orderNumber, line.lineId, line.quantity + step)),
    },
    isMore ? '+' : '−'
  );
}

/**
 * Builds one item line on the receipt.
 *
 * @param {object} order The order being shown.
 * @param {object} line The line to show.
 * @returns {HTMLElement} The line.
 */
function receiptLine(order, line) {
  return el('div', { class: 'receipt__line' }, [
    el('span', {}, [
      el('span', { text: `${line.quantity} x ${line.name}` }),
      line.note ? el('em', { class: 'receipt__note', text: ` (${line.note})` }) : null,
    ]),
    el('span', { class: 'receipt__line-right' }, [
      el('span', { class: 'price', text: formatUSD(line.priceCents * line.quantity) }),
      // Editing is offered only while the ticket is still in the queue.
      // Once the kitchen starts, the food exists and the order is fixed.
      canModify(order)
        ? el(
            'span',
            {
              class: 'stepper stepper--small',
              role: 'group',
              'aria-label': `Change quantity of ${line.name}`,
            },
            [stepperButton(order, line, -1), stepperButton(order, line, 1)]
          )
        : null,
    ]),
  ]);
}

/**
 * Builds the money breakdown at the bottom of the receipt.
 *
 * @param {object} order The order being shown.
 * @returns {HTMLElement} The totals block.
 */
function receiptTotals(order) {
  const { totals } = order;
  return el('div', { class: 'totals' }, [
    receiptRow('Subtotal', totals.subtotal),
    totals.discount > 0 ? receiptRow(`Discount (${order.promoCode})`, -totals.discount) : null,
    totals.deliveryFee > 0 ? receiptRow('Delivery', totals.deliveryFee) : null,
    receiptRow('Sales tax, 8.25%', totals.tax),
    // Hidden when zero, but never dropped: a printed receipt whose lines do not
    // add up to the total it charges is the one thing a customer will query.
    totals.tip > 0 ? receiptRow('Tip', totals.tip) : null,
    receiptRow('Total', totals.total, true),
  ]);
}

/**
 * Builds the printed receipt for one order.
 *
 * @param {object} order The order being shown.
 * @param {object} location The restaurant it was placed with.
 * @param {Date} placed When it was placed.
 * @param {boolean} isPickup Whether it is being collected rather than delivered.
 * @returns {HTMLElement} The receipt section.
 */
function receiptCard(order, location, placed, isPickup) {
  return el('section', { class: 'card receipt' }, [
    el('div', { class: 'card__body stack' }, [
      receiptHead(location),
      receiptMeta(order, placed, isPickup),
      el(
        'div',
        { class: 'receipt__lines' },
        order.lines.map((line) => receiptLine(order, line))
      ),
      receiptTotals(order),
    ]),
  ]);
}

/**
 * Builds the panel of things that can still be done to an order.
 *
 * Cancel and edit appear only while the order is Received.
 *
 * @param {object} order The order being shown.
 * @returns {HTMLElement} The panel.
 */
function manageCard(order) {
  return el('aside', { class: 'stack' }, [
    el('section', { class: 'card' }, [
      el('div', { class: 'card__body stack' }, [
        el('h3', { text: 'Manage this order' }),
        canCancel(order)
          ? el(
              'button',
              {
                class: 'button button--secondary button--block',
                type: 'button',
                onClick: () => showResult(cancelOrder(order.orderNumber)),
              },
              'Cancel this order'
            )
          : el('p', {
              class: 'field__hint',
              text: 'The kitchen has started, so this order can no longer be canceled.',
            }),
        el(
          'button',
          {
            class: 'button button--secondary button--block',
            type: 'button',
            onClick: () => showResult(reorder(order.orderNumber)),
          },
          'Order this again'
        ),
        el(
          'button',
          {
            class: 'button button--secondary button--block',
            type: 'button',
            onClick: () => window.print(),
          },
          'Print receipt'
        ),
        el(
          'button',
          { class: 'button button--block', type: 'button', onClick: () => navigate('/menu') },
          'Back to the menu'
        ),
      ]),
    ]),
  ]);
}

/**
 * Renders one order.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {object} params Route parameters.
 * @param {string} params.orderNumber The order to show.
 * @returns {void}
 */
export function renderOrderDetail(container, params) {
  const state = getState();
  const orderNumber = Number(params.orderNumber);
  const order = state.orders.find((candidate) => candidate.orderNumber === orderNumber);

  if (!order) {
    render(
      container,
      emptyState({
        icon: '\u{1F9FE}',
        title: 'We could not find that order',
        body: 'Order numbers are kept on this device only, so an order placed elsewhere will not appear here.',
        action: { label: 'See your orders', onClick: () => navigate('/orders') },
      })
    );
    return;
  }

  const location = findLocation(order.locationId);
  const placed = new Date(order.placedAt);
  const isPickup = order.orderTypeId !== 'delivery';

  render(container, [
    el('div', { class: 'page-head' }, [
      el('h1', { text: `Order ${order.orderNumber}` }),
      el('p', { class: 'page-head__lede', text: describeStatus(order) }),
    ]),

    statusTracker(order),

    el('div', { class: 'order-layout' }, [
      receiptCard(order, location, placed, isPickup),

      manageCard(order),
    ]),
  ]);
}
