/**
 * Checkout: the details the restaurant needs, and every rule they have to satisfy.
 *
 * This screen is where the two levels of validation meet. Each field checks its own
 * shape as the customer leaves it, using domain/validation.js. Pressing Place order
 * then runs the rules that need the whole order, from domain/orderRules.js: is that
 * ZIP one this restaurant delivers to, has that card already expired, is the chosen
 * collection time far enough out for what is in the cart, is that slot already full.
 *
 * Which fields appear depends on the order type. A pickup order is not asked for a
 * delivery address, because asking for something and then ignoring it is how a form
 * teaches people to distrust it.
 *
 * No real card data is kept. Only the last four digits reach the saved order, and
 * the payment section says so on screen.
 */

import { el, banner, render } from '../dom.js';
import { formField } from '../components/formField.js';
import { showToast } from '../components/toast.js';
import { getState } from '../../app/store.js';
import { placeOrder } from '../../app/orderActions.js';
import { navigate } from '../../app/router.js';
import { findLocation } from '../../data/locations.js';
import { findPromo } from '../../data/promos.js';
import { calculateOrderTotals } from '../../domain/pricing.js';
import { longestLeadTimeHours } from '../../domain/cart.js';
import { buildSlots } from '../../domain/slots.js';
import { formatUSD } from '../../domain/money.js';
import {
  validateCardNumber,
  validateEmail,
  validateExpiryFormat,
  validateName,
  validatePhone,
  validateSecurityCode,
  validateStreet,
  validateZip,
} from '../../domain/validation.js';
import {
  isCardStillValid,
  isSlotUsable,
  isZipInDeliveryArea,
  meetsDeliveryMinimum,
} from '../../domain/orderRules.js';

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

  const fields = {
    name: formField({
      id: 'co-name',
      label: 'Name for the order',
      validate: validateName,
      autocomplete: 'name',
    }),
    phone: formField({
      id: 'co-phone',
      label: 'Phone number',
      validate: validatePhone,
      type: 'tel',
      placeholder: '(713) 528-3816',
      hint: 'We call this number if there is a question about your order.',
      autocomplete: 'tel',
    }),
    email: formField({
      id: 'co-email',
      label: 'Email for the receipt',
      validate: validateEmail,
      type: 'email',
      autocomplete: 'email',
    }),
  };

  if (isDelivery) {
    fields.street = formField({
      id: 'co-street',
      label: 'Street address',
      validate: validateStreet,
      placeholder: '3112 Kirby Drive',
      autocomplete: 'street-address',
    });
    fields.zip = formField({
      id: 'co-zip',
      label: 'ZIP code',
      validate: validateZip,
      placeholder: '77098',
      hint: `${location.name} delivers to ${location.deliveryZips.join(', ')}.`,
      autocomplete: 'postal-code',
    });
  }

  fields.card = formField({
    id: 'co-card',
    label: 'Card number',
    validate: validateCardNumber,
    placeholder: '4111 1111 1111 1111',
    hint: 'Demo only. Nothing is charged and only the last four digits are kept.',
  });
  fields.expiry = formField({
    id: 'co-expiry',
    label: 'Expiry',
    validate: validateExpiryFormat,
    placeholder: 'MM/YY',
  });
  fields.security = formField({
    id: 'co-security',
    label: 'Security code',
    validate: validateSecurityCode,
    placeholder: '123',
  });

  const slotSelect = el(
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
  const slotError = el('span', { class: 'field__error', role: 'alert' });

  /**
   * Runs every check and places the order when they all pass.
   *
   * Field shape is checked first, then the rules that need the whole order. Doing it
   * in that order means a customer is never told their ZIP is outside the delivery
   * area when the real problem is that they typed four digits.
   *
   * @returns {void}
   */
  function submit() {
    slotError.textContent = '';

    const shapesOk = Object.values(fields)
      .map((field) => field.check())
      .every(Boolean);
    if (!shapesOk) {
      showToast('Some details need fixing. The fields in red explain what.', 'error');
      return;
    }

    if (isDelivery) {
      const inArea = isZipInDeliveryArea(fields.zip.value(), location);
      if (!inArea.valid) {
        fields.zip.showError(inArea.message);
        showToast(inArea.message, 'error');
        return;
      }
      const minimum = meetsDeliveryMinimum(totals.goods, state.orderTypeId);
      if (!minimum.valid) {
        showToast(minimum.message, 'error');
        return;
      }
    }

    const cardDate = isCardStillValid(fields.expiry.value(), now);
    if (!cardDate.valid) {
      fields.expiry.showError(cardDate.message);
      showToast(cardDate.message, 'error');
      return;
    }

    const slot = slots.find((candidate) => candidate.key === slotSelect.value);
    const slotVerdict = isSlotUsable({ slot, location, now, leadTimeHours, orders: state.orders });
    if (!slotVerdict.valid) {
      slotError.textContent = slotVerdict.message;
      showToast(slotVerdict.message, 'error');
      return;
    }

    const order = placeOrder({
      customer: {
        name: fields.name.value().trim(),
        phone: fields.phone.value().trim(),
        email: fields.email.value().trim(),
        street: isDelivery ? fields.street.value().trim() : null,
        zip: isDelivery ? fields.zip.value().trim() : null,
      },
      cardLastFour: fields.card.value().replace(/\D/g, '').slice(-4),
      slot,
      totals,
    });
    navigate(`/order/${order.orderNumber}`);
  }

  render(container, [
    el('div', { class: 'page-head' }, [
      el('h1', { text: 'Checkout' }),
      el('p', {
        class: 'page-head__lede',
        text: `${state.orderTypeId === 'delivery' ? 'Delivery' : state.orderTypeId === 'dine-in' ? 'Dine in' : 'Pickup'} from ${location.name}, ${location.street}.`,
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

        el('section', { class: 'card' }, [
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
                  slotSelect,
                  el('span', {
                    class: 'field__hint',
                    text: 'Each slot holds four orders so the counter does not back up.',
                  }),
                  slotError,
                ]),
          ]),
        ]),

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

      el('aside', { class: 'checkout-summary' }, [
        el('section', { class: 'card' }, [
          el('div', { class: 'card__body stack' }, [
            el('h2', { text: 'Order summary' }),
            el(
              'div',
              { class: 'checkout-summary__lines' },
              state.cart.map((line) =>
                el('div', { class: 'checkout-summary__line' }, [
                  el('span', { text: `${line.quantity} x ${line.name}` }),
                  el('span', { class: 'price', text: formatUSD(line.priceCents * line.quantity) }),
                ])
              )
            ),
            el('div', { class: 'totals' }, [
              el('div', { class: 'total-row' }, [
                el('span', { text: 'Subtotal' }),
                el('span', { class: 'price', text: formatUSD(totals.subtotal) }),
              ]),
              totals.discount > 0
                ? el('div', { class: 'total-row' }, [
                    el('span', { text: 'Discount' }),
                    el('span', { class: 'price', text: formatUSD(-totals.discount) }),
                  ])
                : null,
              totals.deliveryFee > 0
                ? el('div', { class: 'total-row' }, [
                    el('span', { text: 'Delivery' }),
                    el('span', { class: 'price', text: formatUSD(totals.deliveryFee) }),
                  ])
                : null,
              el('div', { class: 'total-row' }, [
                el('span', { text: 'Sales tax, 8.25%' }),
                el('span', { class: 'price', text: formatUSD(totals.tax) }),
              ]),
              el('div', { class: 'total-row total-row--grand' }, [
                el('span', { text: 'Total' }),
                el('span', { class: 'price', text: formatUSD(totals.total) }),
              ]),
            ]),
            el(
              'button',
              { class: 'button button--block', type: 'button', onClick: submit },
              'Place order'
            ),
            el(
              'button',
              {
                class: 'button button--secondary button--block',
                type: 'button',
                onClick: () => navigate('/cart'),
              },
              'Back to your order'
            ),
          ]),
        ]),
      ]),
    ]),
  ]);
}
