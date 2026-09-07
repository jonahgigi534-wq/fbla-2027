/**
 * What happens when someone presses Place order.
 *
 * The other half of the checkout split. checkoutFields.js decides whether each answer
 * looks right on its own; this decides whether the order as a whole is one the
 * restaurant can actually take, using domain/orderRules.js.
 *
 * The sequence matters more than any single rule in it. Field shapes are checked
 * first, then the rules that need the whole order, because a customer should never be
 * told their ZIP is outside the delivery area when the real problem is that they typed
 * four digits. Each failure stops the run and says where its message belongs: beside a
 * field, under the time picker, or in a toast when it belongs to no single control.
 *
 * Used by ui/screens/checkout.js.
 */

import { showToast } from '../components/toast.js';
import { placeOrder } from '../../app/orderActions.js';
import { navigate } from '../../app/router.js';
import {
  isCardStillValid,
  isSlotUsable,
  isZipInDeliveryArea,
  meetsDeliveryMinimum,
} from '../../domain/orderRules.js';

/** Everything but the last four digits of a card is thrown away before saving. */
const LAST_FOUR = -4;

/**
 * Checks every field shape and reports whether they all passed.
 *
 * @param {object} fields The fields from buildCheckoutFields.
 * @returns {boolean} True when every field is happy with what it holds.
 */
function everyShapeIsValid(fields) {
  // Mapped before it is reduced rather than short circuited, so every field that is
  // wrong shows its own message instead of only the first one.
  return Object.values(fields)
    .map((field) => field.check())
    .every(Boolean);
}

/**
 * Runs the rules that need the whole order rather than one field.
 *
 * @param {object} options Everything the rules read.
 * @param {object} options.fields The fields from buildCheckoutFields.
 * @param {boolean} options.isDelivery Whether this order is being delivered.
 * @param {object} options.location The restaurant being ordered from.
 * @param {object} options.totals Totals from domain/pricing.js.
 * @param {string} options.orderTypeId Which kind of order this is.
 * @param {object} options.slot The chosen pickup slot, or undefined.
 * @param {Date} options.now The moment the order is being placed.
 * @param {number} options.leadTimeHours Notice the slowest item in the cart needs.
 * @param {object[]} options.orders Orders already placed, for slot capacity.
 * @returns {{valid: boolean, message: string, field: object|null, isSlot: boolean}} The
 *   first failure and where its message belongs, or a passing verdict.
 */
function checkOrderRules({
  fields,
  isDelivery,
  location,
  totals,
  orderTypeId,
  slot,
  now,
  leadTimeHours,
  orders,
}) {
  if (isDelivery) {
    const inArea = isZipInDeliveryArea(fields.zip.value(), location);
    if (!inArea.valid) {
      return { ...inArea, field: fields.zip, isSlot: false };
    }
    // A cart under the delivery minimum is not any one field's fault, so this one
    // only reaches the toast.
    const minimum = meetsDeliveryMinimum(totals.goods, orderTypeId);
    if (!minimum.valid) {
      return { ...minimum, field: null, isSlot: false };
    }
  }

  const cardDate = isCardStillValid(fields.expiry.value(), now);
  if (!cardDate.valid) {
    return { ...cardDate, field: fields.expiry, isSlot: false };
  }

  const slotVerdict = isSlotUsable({ slot, location, now, leadTimeHours, orders });
  if (!slotVerdict.valid) {
    return { ...slotVerdict, field: null, isSlot: true };
  }

  return { valid: true, message: '', field: null, isSlot: false };
}

/**
 * Validates the whole checkout and places the order when everything passes.
 *
 * @param {object} options Everything the checkout screen is holding.
 * @param {object} options.fields The fields from buildCheckoutFields.
 * @param {boolean} options.isDelivery Whether this order is being delivered.
 * @param {object} options.location The restaurant being ordered from.
 * @param {object} options.totals Totals from domain/pricing.js.
 * @param {string} options.orderTypeId Which kind of order this is.
 * @param {object} options.slot The chosen pickup slot, or undefined.
 * @param {Date} options.now The moment the order is being placed.
 * @param {number} options.leadTimeHours Notice the slowest item in the cart needs.
 * @param {object[]} options.orders Orders already placed, for slot capacity.
 * @param {HTMLElement} options.slotError Where a problem with the chosen time is written.
 * @returns {void}
 */
export function submitCheckout(options) {
  const { fields, isDelivery, slotError } = options;
  slotError.textContent = '';

  if (!everyShapeIsValid(fields)) {
    showToast('Some details need fixing. The fields in red explain what.', 'error');
    return;
  }

  const verdict = checkOrderRules(options);
  if (!verdict.valid) {
    if (verdict.field) {
      verdict.field.showError(verdict.message);
    }
    if (verdict.isSlot) {
      slotError.textContent = verdict.message;
    }
    showToast(verdict.message, 'error');
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
    cardLastFour: fields.card.value().replace(/\D/g, '').slice(LAST_FOUR),
    slot: options.slot,
    totals: options.totals,
  });
  navigate(`/order/${order.orderNumber}`);
}
