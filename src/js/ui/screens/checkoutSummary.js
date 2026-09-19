/**
 * The order summary that sits beside the checkout form.
 *
 * Every line in the cart, then the totals in the order they are worked out, then the
 * two buttons. It is kept apart from the form because it is the one part of checkout
 * that asks the customer for nothing, it only shows them what they are about to agree
 * to, and mixing that in with the validation made the screen hard to follow.
 *
 * The totals are never worked out here. domain/pricing.js is asked for them and this
 * displays what it was handed, so the number on screen and the number saved to the
 * order can never drift apart. Choosing a tip asks pricing again rather than adding
 * anything to the figure already on screen.
 *
 * The tip is held in this file rather than in the store because every state update
 * redraws the whole screen, and redrawing checkout while someone is halfway through
 * typing their phone number would empty the form under them.
 *
 * Used by ui/screens/checkout.js.
 */

import { el, render } from '../dom.js';
import { formatUSD } from '../../domain/money.js';
import { TIP_PRESETS_BASIS_POINTS } from '../../domain/pricing.js';

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
 * Names one tip rate the way a customer would say it.
 *
 * @param {number} basisPoints A rate where 10000 is 100 percent.
 * @returns {string} 'No tip' or a percentage.
 */
function tipLabel(basisPoints) {
  return basisPoints === 0 ? 'No tip' : `${basisPoints / 100}%`;
}

/**
 * Builds the rows of the totals block, in the order the money moves through them.
 *
 * Discount, delivery, and tip each appear only when they are not zero. A row reading
 * 'Tip $0.00' invites the question of whether the tip failed to apply.
 *
 * @param {object} totals Totals from domain/pricing.js.
 * @returns {Array<HTMLElement|null>} The rows.
 */
function totalRows(totals) {
  return [
    totalRow('Subtotal', totals.subtotal),
    totals.discount > 0 ? totalRow('Discount', -totals.discount) : null,
    totals.deliveryFee > 0 ? totalRow('Delivery', totals.deliveryFee) : null,
    totalRow('Sales tax, 8.25%', totals.tax),
    totals.tip > 0 ? totalRow('Tip', totals.tip) : null,
    totalRow('Total', totals.total, true),
  ];
}

/**
 * Builds the row of tip buttons, marking the one in force.
 *
 * aria-pressed rather than a class, so the choice is announced to a screen reader
 * rather than only being visible.
 *
 * @param {number} selected The rate currently chosen.
 * @param {Function} onChoose Called with the rate the customer picked.
 * @returns {HTMLElement[]} The buttons.
 */
function tipChips(selected, onChoose) {
  return TIP_PRESETS_BASIS_POINTS.map((basisPoints) =>
    el(
      'button',
      {
        class: 'chip',
        type: 'button',
        'aria-pressed': basisPoints === selected ? 'true' : 'false',
        onClick: () => onChoose(basisPoints),
      },
      tipLabel(basisPoints)
    )
  );
}

/**
 * Builds the summary panel.
 *
 * @param {object} options What to show and what the buttons do.
 * @param {object[]} options.cart The cart lines.
 * @param {Function} options.totalsFor Given a tip rate, returns the totals for it.
 * @param {Function} options.onPlace Called with the chosen tip rate when Place order
 *   is pressed.
 * @param {Function} options.onBack Called when the customer wants the cart again.
 * @returns {HTMLElement} The summary aside.
 */
export function checkoutSummary({ cart, totalsFor, onPlace, onBack }) {
  let tipBasisPoints = 0;
  const totalsBox = el('div', { class: 'totals' });
  const tipBox = el('div', { class: 'tip-choices' });

  /**
   * Redraws the tip buttons and the totals under the current choice.
   *
   * @returns {void}
   */
  function draw() {
    render(totalsBox, totalRows(totalsFor(tipBasisPoints)));
    render(
      tipBox,
      tipChips(tipBasisPoints, (chosen) => {
        tipBasisPoints = chosen;
        draw();
      })
    );
  }

  draw();

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
        el('div', { class: 'tip-picker' }, [
          el('p', { class: 'tip-picker__label', text: 'Add a tip for the kitchen' }),
          tipBox,
        ]),
        totalsBox,
        el(
          'button',
          {
            class: 'button button--block',
            type: 'button',
            onClick: () => onPlace(tipBasisPoints),
          },
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
