/**
 * The live order queue: what the kitchen is working on, newest first.
 *
 * Orders the seeded history generated are hidden here. Ninety days of completed
 * tickets are what the reports are for; a queue showing two thousand finished orders
 * would be useless to the person actually working the counter.
 */

import { el, emptyState, render } from '../../dom.js';
import { showResult } from '../../components/toast.js';
import { managerTabs, withManagerAccess } from './shell.js';
import { getState } from '../../../app/store.js';
import { advanceOrder, cancelOrder } from '../../../app/orderActions.js';
import { navigate } from '../../../app/router.js';
import { findLocation } from '../../../data/locations.js';
import { CANCELED, canCancel, nextStatus } from '../../../domain/orders.js';
import { formatUSD } from '../../../domain/money.js';

/** Badge color for each status. */
const STATUS_TONE = {
  Received: 'info',
  Baking: 'warning',
  Ready: 'success',
  Complete: '',
  [CANCELED]: 'danger',
};

/**
 * Builds one ticket in the queue.
 *
 * @param {object} order The order.
 * @returns {HTMLElement} The ticket.
 */
function ticket(order) {
  const location = findLocation(order.locationId);
  const next = nextStatus(order.status);
  const placed = new Date(order.placedAt);

  return el('article', { class: 'ticket card' }, [
    el('div', { class: 'card__body' }, [
      el('div', { class: 'ticket__head' }, [
        el('div', {}, [
          el('h3', { text: `Order ${order.orderNumber}` }),
          el('p', {
            class: 'muted',
            text: `${location.name} · ${order.orderTypeId} · ${order.slotLabel}`,
          }),
          el('p', {
            class: 'muted',
            text: `Placed ${placed.toLocaleTimeString()} for ${order.customer.name}`,
          }),
        ]),
        el('div', { class: 'ticket__right' }, [
          el('span', {
            class: `badge ${STATUS_TONE[order.status] ? `badge--${STATUS_TONE[order.status]}` : ''}`,
            text: order.status,
          }),
          el('p', { class: 'price', text: formatUSD(order.totals.total) }),
        ]),
      ]),
      el(
        'ul',
        { class: 'ticket__lines' },
        order.lines.map((line) =>
          el('li', {}, [
            el('span', { text: `${line.quantity} x ${line.name}` }),
            line.note ? el('em', { class: 'receipt__note', text: ` (${line.note})` }) : null,
          ])
        )
      ),
      el('div', { class: 'ticket__actions' }, [
        next
          ? el(
              'button',
              {
                class: 'button button--small',
                type: 'button',
                onClick: () => showResult(advanceOrder(order.orderNumber)),
              },
              `Move to ${next}`
            )
          : null,
        canCancel(order)
          ? el(
              'button',
              {
                class: 'button button--secondary button--small',
                type: 'button',
                onClick: () => showResult(cancelOrder(order.orderNumber)),
              },
              'Cancel'
            )
          : null,
        el(
          'button',
          {
            class: 'button button--quiet button--small',
            type: 'button',
            onClick: () => navigate(`/order/${order.orderNumber}`),
          },
          'View receipt'
        ),
      ]),
    ]),
  ]);
}

/**
 * Renders the order queue.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderManagerQueue(container) {
  withManagerAccess(container, '/manager/queue', () => {
    const live = getState().orders.filter((order) => !order.isSeeded);

    render(container, [
      el('div', { class: 'page-head' }, [
        el('h1', { text: 'Order queue' }),
        el('p', {
          class: 'page-head__lede',
          text: 'Orders placed in this session. Ninety days of past orders sit in Reports.',
        }),
      ]),
      managerTabs('/manager/queue'),
      live.length === 0
        ? emptyState({
            icon: '\u{1F373}',
            title: 'Nothing in the queue',
            body: 'Orders placed on the customer side show up here the moment they are submitted.',
            action: { label: 'Go and place one', onClick: () => navigate('/menu') },
          })
        : el('div', { class: 'stack' }, live.map(ticket)),
    ]);
  });
}
