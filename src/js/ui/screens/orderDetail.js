/**
 * One order: its receipt, where it has got to, and what can still be done to it.
 *
 * This is both the confirmation shown straight after checkout and the screen reached
 * later from order history, because they need to say the same things. Splitting them
 * would mean two receipts that could disagree.
 *
 * The receipt is the part that has to print. src/css/print.css strips the navigation
 * and buttons so a browser print preview shows the document a customer would keep.
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
 * Builds the printed receipt for one order.
 *
 * This is the half of the screen that goes on paper. print.css strips the navigation
 * and the buttons away and leaves this section standing on its own, which is why every
 * fact someone would need to query the order later sits inside it rather than in the
 * page heading above it.
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
      el('div', { class: 'receipt__head' }, [
        el('h2', { text: 'House of Pies' }),
        el('p', {
          class: 'muted',
          text: `${location.name}, ${location.street}, ${location.cityStateZip}`,
        }),
        el('p', { class: 'muted', text: location.phone }),
      ]),

      el('div', { class: 'receipt__meta' }, [
        el('div', {}, [
          el('strong', { text: 'Placed' }),
          el('div', { text: placed.toLocaleString() }),
        ]),
        el('div', {}, [
          el('strong', { text: isPickup ? 'Collection' : 'Delivery' }),
          el('div', { text: order.slotLabel }),
        ]),
        el('div', {}, [el('strong', { text: 'Name' }), el('div', { text: order.customer.name })]),
        el('div', {}, [el('strong', { text: 'Phone' }), el('div', { text: order.customer.phone })]),
        order.customer.street
          ? el('div', {}, [
              el('strong', { text: 'Address' }),
              el('div', { text: `${order.customer.street}, ${order.customer.zip}` }),
            ])
          : null,
        el('div', {}, [
          el('strong', { text: 'Paid with' }),
          el('div', { text: `Card ending ${order.cardLastFour} (demo, not charged)` }),
        ]),
      ]),

      el(
        'div',
        { class: 'receipt__lines' },
        order.lines.map((line) =>
          el('div', { class: 'receipt__line' }, [
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
                    [
                      el(
                        'button',
                        {
                          class: 'stepper__button',
                          type: 'button',
                          'aria-label': `One fewer ${line.name}`,
                          onClick: () =>
                            showResult(
                              changeOrderLine(order.orderNumber, line.lineId, line.quantity - 1)
                            ),
                        },
                        '−'
                      ),
                      el(
                        'button',
                        {
                          class: 'stepper__button',
                          type: 'button',
                          'aria-label': `One more ${line.name}`,
                          onClick: () =>
                            showResult(
                              changeOrderLine(order.orderNumber, line.lineId, line.quantity + 1)
                            ),
                        },
                        '+'
                      ),
                    ]
                  )
                : null,
            ]),
          ])
        )
      ),

      el('div', { class: 'totals' }, [
        receiptRow('Subtotal', order.totals.subtotal),
        order.totals.discount > 0
          ? receiptRow(`Discount (${order.promoCode})`, -order.totals.discount)
          : null,
        order.totals.deliveryFee > 0 ? receiptRow('Delivery', order.totals.deliveryFee) : null,
        receiptRow('Sales tax, 8.25%', order.totals.tax),
        receiptRow('Total', order.totals.total, true),
      ]),
    ]),
  ]);
}

/**
 * Builds the panel of things that can still be done to an order.
 *
 * What is offered depends on how far the order has got. Canceling and editing show
 * only while the ticket is still in the queue, because once the kitchen starts the
 * food exists. Reordering and printing are always available.
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
