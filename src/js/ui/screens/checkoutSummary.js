/**
 * The order summary that sits beside the checkout form.
 *
 * Every line in the cart, then the totals in the order they are worked out, then the
 * two buttons. It is kept apart from the form because it is the one part of checkout
 * that asks the customer for nothing, it only shows them what they are about to agree
 * to, and mixing that in with the validation made the screen hard to follow.
 *
 * The totals are read, never recalculated. domain/pricing.js works them out once and
 * this displays what it was handed, so the number on screen and the number saved to
 * the order can never drift apart.
 *
 * Used by ui/screens/checkout.js.
 */

import { el } from '../dom.js';
import { formatUSD } from '../../domain/money.js';

/**
 * Builds one labelled money row.
 *
 * @param {string} label What the row is.
 * @param {number} cents The amount, in whole cents.
 * @param {boolean} [isGrand] Whether this is the final total.
 * @returns {HTMLElement} The row.
 */
function totalRow(label, cents, isGrand = false) {
  return el('div', { class: `total-row${isGrand ? ' total-row--grand' : ''}` }, [
    el('span', { text: label }),
    el('span', { class: 'price', text: formatUSD(cents) }),
  ]);
}

/**
 * Builds the summary panel.
 *
 * @param {object} options What to show and what the buttons do.
 * @param {object[]} options.cart The cart lines.
 * @param {object} options.totals Totals from domain/pricing.js.
 * @param {Function} options.onPlace Called when Place order is pressed.
 * @param {Function} options.onBack Called when the customer wants the cart again.
 * @returns {HTMLElement} The summary aside.
 */
export function checkoutSummary({ cart, totals, onPlace, onBack }) {
  return el('aside', { class: 'checkout-summary' }, [
    el('section', { class: 'card' }, [
      el('div', { class: 'card__body stack' }, [
        el('h2', { text: 'Order summary' }),
        el(
          'div',
          { class: 'checkout-summary__lines' },
          cart.map((line) =>
            el('div', { class: 'checkout-summary__line' }, [
              el('span', { text: `${line.quantity} x ${line.name}` }),
              el('span', { class: 'price', text: formatUSD(line.priceCents * line.quantity) }),
            ])
          )
        ),
        el('div', { class: 'totals' }, [
          totalRow('Subtotal', totals.subtotal),
          totals.discount > 0 ? totalRow('Discount', -totals.discount) : null,
          totals.deliveryFee > 0 ? totalRow('Delivery', totals.deliveryFee) : null,
          totalRow('Sales tax, 8.25%', totals.tax),
          totalRow('Total', totals.total, true),
        ]),
        el(
          'button',
          { class: 'button button--block', type: 'button', onClick: onPlace },
          'Place order'
        ),
        el(
          'button',
          { class: 'button button--secondary button--block', type: 'button', onClick: onBack },
          'Back to your order'
        ),
      ]),
    ]),
  ]);
}
