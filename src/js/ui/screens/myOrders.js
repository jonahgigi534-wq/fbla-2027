/**
 * Every order placed on this device, newest first.
 *
 * The topic asks the program to let customers review order information, and this is
 * the list that does it. Each row links to the full receipt.
 */

import { el, emptyState, render } from '../dom.js';
import { getState } from '../../app/store.js';
import { navigate } from '../../app/router.js';
import { findLocation } from '../../data/locations.js';
import { CANCELLED } from '../../domain/orders.js';
import { formatUSD } from '../../domain/money.js';

/** Badge colour for each status. */
const STATUS_TONE = {
  Received: 'info',
  Baking: 'warning',
  Ready: 'success',
  Complete: '',
  [CANCELLED]: 'danger',
};

/**
 * Builds one row in the order list.
 *
 * @param {object} order An order.
 * @returns {HTMLElement} The row.
 */
function orderRow(order) {
  const location = findLocation(order.locationId);
  const tone = STATUS_TONE[order.status] ?? '';
  return el(
    'button',
    {
      class: 'card card--interactive order-row',
      type: 'button',
      onClick: () => navigate(`/order/${order.orderNumber}`),
    },
    [
      el('div', { class: 'card__body order-row__body' }, [
        el('div', {}, [
          el('p', { class: 'order-row__number', text: `Order ${order.orderNumber}` }),
          el('p', { class: 'muted', text: `${location.name}, ${order.slotLabel}` }),
          el('p', {
            class: 'muted',
            text: order.lines.map((line) => `${line.quantity} x ${line.name}`).join(', '),
          }),
        ]),
        el('div', { class: 'order-row__right' }, [
          el('span', { class: `badge ${tone ? `badge--${tone}` : ''}`, text: order.status }),
          el('p', { class: 'price', text: formatUSD(order.totals.total) }),
        ]),
      ]),
    ]
  );
}

/**
 * Renders the order list.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderMyOrders(container) {
  const { orders } = getState();

  if (orders.length === 0) {
    render(
      container,
      emptyState({
        icon: '\u{1F4CB}',
        title: 'No orders yet',
        body: 'Once you place an order it will appear here with its receipt and live status.',
        action: { label: 'Browse the menu', onClick: () => navigate('/menu') },
      })
    );
    return;
  }

  render(container, [
    el('div', { class: 'page-head' }, [
      el('h1', { text: 'Your orders' }),
      el('p', {
        class: 'page-head__lede',
        text: `${orders.length} order${orders.length === 1 ? '' : 's'} placed on this device.`,
      }),
    ]),
    el('div', { class: 'stack' }, orders.map(orderRow)),
  ]);
}
