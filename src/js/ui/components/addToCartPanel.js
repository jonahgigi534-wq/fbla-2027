/**
 * The quantity stepper, instructions box, and Add button on the item screen.
 *
 * The stepper will not step past what the restaurant has left, and the button says
 * so rather than going dead: a disabled control with no explanation is the most
 * common way an ordering screen loses someone.
 *
 * For a sold out item the panel is replaced entirely by substitutes, because the one
 * thing a customer needs there is somewhere else to go.
 */

import { el } from '../dom.js';
import { showResult } from './toast.js';
import { addItemToCart } from '../../app/actions.js';
import { remainingFor, findSubstitutes } from '../../domain/inventory.js';
import { formatUSD } from '../../domain/money.js';

/** Longest special instruction the kitchen ticket can carry. */
const NOTE_MAX_LENGTH = 140;

/**
 * Builds the panel.
 *
 * @param {object} item The catalog item being viewed.
 * @param {object} state Current application state.
 * @param {object[]} catalog Every catalog item, for finding substitutes.
 * @param {Function} onNavigate Called with an item id to open another item.
 * @returns {HTMLElement} The panel.
 */
export function addToCartPanel(item, state, catalog, onNavigate) {
  const remaining = remainingFor(item, state.cart, state.stockOverrides);

  if (remaining === 0) {
    const substitutes = findSubstitutes(item, catalog, state.stockOverrides);
    return el('div', { class: 'add-panel add-panel--unavailable' }, [
      el('p', { class: 'add-panel__unavailable-title', text: 'Not available right now' }),
      substitutes.length > 0
        ? el('div', {}, [
            el('p', { class: 'muted', text: 'Customers often pick one of these instead:' }),
            el(
              'div',
              { class: 'add-panel__substitutes' },
              substitutes.map((other) =>
                el(
                  'button',
                  {
                    class: 'button button--secondary button--small',
                    type: 'button',
                    onClick: () => onNavigate(other.id),
                  },
                  `${other.name}, ${formatUSD(other.priceCents)}`
                )
              )
            ),
          ])
        : el('p', {
            class: 'muted',
            text: 'Everything in this part of the menu is sold out today.',
          }),
    ]);
  }

  let quantity = 1;
  const quantityLabel = el('output', { class: 'stepper__value', 'aria-live': 'polite', text: '1' });
  const noteField = el('input', {
    class: 'field__control',
    id: 'item-note',
    type: 'text',
    maxlength: String(NOTE_MAX_LENGTH),
    placeholder: 'No onions, extra crispy, happy birthday',
  });

  /**
   * Moves the quantity by one step, staying between 1 and what is left.
   *
   * @param {number} step Either 1 or -1.
   * @returns {void}
   */
  function step(step_) {
    quantity = Math.min(Math.max(quantity + step_, 1), remaining);
    quantityLabel.textContent = String(quantity);
  }

  return el('div', { class: 'add-panel' }, [
    el('div', { class: 'field' }, [
      el('label', {
        class: 'field__label',
        for: 'item-note',
        text: 'Special instructions, optional',
      }),
      noteField,
    ]),
    el('div', { class: 'add-panel__row' }, [
      el('div', { class: 'stepper', role: 'group', 'aria-label': 'Quantity' }, [
        el(
          'button',
          {
            class: 'stepper__button',
            type: 'button',
            'aria-label': 'One fewer',
            onClick: () => step(-1),
          },
          '−'
        ),
        quantityLabel,
        el(
          'button',
          {
            class: 'stepper__button',
            type: 'button',
            'aria-label': 'One more',
            onClick: () => step(1),
          },
          '+'
        ),
      ]),
      el(
        'button',
        {
          class: 'button add-panel__submit',
          type: 'button',
          onClick: () => showResult(addItemToCart(item, quantity, noteField.value)),
        },
        'Add to order'
      ),
    ]),
    remaining <= 5
      ? el('p', { class: 'field__hint', text: `Only ${remaining} left today.` })
      : null,
  ]);
}
