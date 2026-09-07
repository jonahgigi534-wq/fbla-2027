/**
 * Checkout: the details the restaurant needs, and every rule they have to satisfy.
 *
 * This screen is where the two levels of validation meet, but it performs neither of
 * them itself. checkoutFields.js builds the fields and the shape rules on each one.
 * checkoutSubmit.js runs the rules that need the whole order. checkoutSummary.js shows
 * what is being agreed to. What is left here is the job the screen actually has:
 * gather the state, work out which pickup times exist, and lay the three out.
 *
 * Which fields appear depends on the order type. A pickup order is not asked for a
 * delivery address, because asking for something and then ignoring it is how a form
 * teaches people to distrust it.
 *
 * No real card data is kept. Only the last four digits reach the saved order, and the
 * payment section says so on screen.
 */

import { el, banner, render } from '../dom.js';
import { buildCheckoutFields } from './checkoutFields.js';
import { submitCheckout } from './checkoutSubmit.js';
import { checkoutSummary } from './checkoutSummary.js';
import { getState } from '../../app/store.js';
import { navigate } from '../../app/router.js';
import { findLocation } from '../../data/locations.js';
import { findPromo } from '../../data/promos.js';
import { calculateOrderTotals } from '../../domain/pricing.js';
import { longestLeadTimeHours } from '../../domain/cart.js';
import { buildSlots } from '../../domain/slots.js';

/** How each order type is described in the line under the heading. */
const ORDER_TYPE_LABELS = {
  delivery: 'Delivery',
  'dine-in': 'Dine in',
  pickup: 'Pickup',
};

/**
 * Builds the pickup time picker and the error line that belongs to it.
 *
 * @param {object[]} slots Slots from domain/slots.js.
 * @returns {{select: HTMLElement, error: HTMLElement}} The control and its error line.
 */
function buildSlotPicker(slots) {
  const select = el(
    'select',
    { class: 'field__control', id: 'co-slot' },
    slots.map((slot) =>
      el(
        'option',
        { value: slot.key, disabled: slot.isFull },
        slot.isFull ? `${slot.label} (full)` : `${slot.label} (${slot.remaining} left)`
      )
    )
  );
  return { select, error: el('span', { class: 'field__error', role: 'alert' }) };
}

/**
 * Builds the section that asks when the customer wants the order.
 *
 * @param {object} options What the section shows.
 * @param {object[]} options.slots Slots from domain/slots.js.
 * @param {object} options.location The restaurant being ordered from.
 * @param {number} options.leadTimeHours Notice the slowest item in the cart needs.
 * @param {boolean} options.isDelivery Whether this order is being delivered.
 * @param {object} options.picker The slot picker from buildSlotPicker.
 * @returns {HTMLElement} The section.
 */
function timingSection({ slots, location, leadTimeHours, isDelivery, picker }) {
  return el('section', { class: 'card' }, [
    el('div', { class: 'card__body' }, [
      el('h2', { text: isDelivery ? 'When you want it' : 'Collection time' }),
      leadTimeHours > 0
        ? banner(
            'info',
            `Your order needs ${leadTimeHours} hours notice`,
            'One of the catering items is made to order, so the earliest times below reflect that.'
          )
        : null,
      slots.length === 0
        ? banner(
            'warning',
            'No times available',
            `${location.name} has no open slots. ${location.hoursLabel}.`
          )
        : el('label', { class: 'field', for: 'co-slot' }, [
            el('span', { class: 'field__label', text: 'Choose a time' }),
            picker.select,
            el('span', {
              class: 'field__hint',
              text: 'Each slot holds four orders so the counter does not back up.',
            }),
            picker.error,
          ]),
    ]),
  ]);
}

/**
 * Renders the checkout screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderCheckout(container) {
  const state = getState();

  if (state.cart.length === 0) {
    navigate('/cart');
    return;
  }

  const now = new Date();
  const location = findLocation(state.locationId);
  const promo = state.promoCode ? findPromo(state.promoCode) : null;
  const totals = calculateOrderTotals(state.cart, { orderTypeId: state.orderTypeId, promo });
  const leadTimeHours = longestLeadTimeHours(state.cart);
  const slots = buildSlots({ location, now, leadTimeHours, orders: state.orders });
  const isDelivery = state.orderTypeId === 'delivery';

  const fields = buildCheckoutFields({ location, isDelivery });
  const picker = buildSlotPicker(slots);

  /**
   * Hands the whole checkout to the rules and places the order if they pass.
   *
   * @returns {void}
   */
  function place() {
    submitCheckout({
      fields,
      isDelivery,
      location,
      totals,
      orderTypeId: state.orderTypeId,
      slot: slots.find((candidate) => candidate.key === picker.select.value),
      now,
      leadTimeHours,
      orders: state.orders,
      slotError: picker.error,
    });
  }

  render(container, [
    el('div', { class: 'page-head' }, [
      el('h1', { text: 'Checkout' }),
      el('p', {
        class: 'page-head__lede',
        text: `${ORDER_TYPE_LABELS[state.orderTypeId]} from ${location.name}, ${location.street}.`,
      }),
    ]),

    el('div', { class: 'checkout-layout' }, [
      el('form', { class: 'checkout-form stack', onSubmit: (event) => event.preventDefault() }, [
        el('section', { class: 'card' }, [
          el('div', { class: 'card__body' }, [
            el('h2', { text: 'Your details' }),
            fields.name.node,
            fields.phone.node,
            fields.email.node,
          ]),
        ]),

        isDelivery
          ? el('section', { class: 'card' }, [
              el('div', { class: 'card__body' }, [
                el('h2', { text: 'Where we are delivering' }),
                fields.street.node,
                fields.zip.node,
              ]),
            ])
          : null,

        timingSection({ slots, location, leadTimeHours, isDelivery, picker }),

        el('section', { class: 'card' }, [
          el('div', { class: 'card__body' }, [
            el('h2', { text: 'Payment' }),
            banner(
              'warning',
              'Demo only',
              'This is a school project. No payment is processed, nothing is sent anywhere, and only the last four digits are saved.'
            ),
            fields.card.node,
            el('div', { class: 'checkout-form__pair' }, [fields.expiry.node, fields.security.node]),
          ]),
        ]),
      ]),

      checkoutSummary({
        cart: state.cart,
        totals,
        onPlace: place,
        onBack: () => navigate('/cart'),
      }),
    ]),
  ]);
}
