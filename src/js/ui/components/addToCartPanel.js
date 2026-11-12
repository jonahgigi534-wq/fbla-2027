/**
 * The quantity stepper, instructions box, and Add button on the item screen.
 *
 * The stepper stops at what is left and says why. A sold out item shows substitutes
 * instead.
 */

import { el } from '../dom.js';
import { showResult } from './toast.js';
import { addItemToCart } from '../../app/actions.js';
import { LOW_STOCK_THRESHOLD, remainingFor, findSubstitutes } from '../../domain/inventory.js';
import { formatUSD } from '../../domain/money.js';

/** Longest special instruction the kitchen ticket can carry. */
const NOTE_MAX_LENGTH = 140;

/**
 * Builds the panel shown in place of the Add button when none are left.
 *
 * @param {object} item The catalog item being viewed.
 * @param {object} state Current application state.
 * @param {object[]} catalog Every catalog item, for finding substitutes.
 * @param {Function} onNavigate Called with an item id to open another item.
 * @returns {HTMLElement} The panel, with up to three substitutes.
 */
function unavailablePanel(item, state, catalog, onNavigate) {
  const substitutes = findSubstitutes(item, catalog, state.stockOverrides);
  const substituteButton = (other) =>
    el(
      'button',
      {
        class: 'button button--secondary button--small',
        type: 'button',
        onClick: () => onNavigate(other.id),
      },
      `${other.name}, ${formatUSD(other.priceCents)}`
    );

  return el('div', { class: 'add-panel add-panel--unavailable' }, [
    el('p', { class: 'add-panel__unavailable-title', text: 'Not available right now' }),
    substitutes.length > 0
      ? el('div', {}, [
          el('p', { class: 'muted', text: 'Customers often pick one of these instead:' }),
          el('div', { class: 'add-panel__substitutes' }, substitutes.map(substituteButton)),
        ])
      : el('p', {
          class: 'muted',
          text: 'Everything in this part of the menu is sold out today.',
        }),
  ]);
}

/**
 * Builds the optional special instructions box.
 *
 * @param {HTMLElement} noteField The input the kitchen note is typed into.
 * @returns {HTMLElement} The labeled field.
 */
function noteBox(noteField) {
  return el('div', { class: 'field' }, [
    el('label', {
      class: 'field__label',
      for: 'item-note',
      text: 'Special instructions, optional',
    }),
    noteField,
  ]);
}

/**
 * Builds the minus, count, and plus control.
 *
 * @param {HTMLElement} quantityLabel Where the current count is shown.
 * @param {Function} onStep Called with 1 or -1.
 * @returns {HTMLElement} The stepper.
 */
function quantityStepper(quantityLabel, onStep) {
  const stepButton = (change, label, symbol) =>
    el(
      'button',
      {
        class: 'stepper__button',
        type: 'button',
        'aria-label': label,
        onClick: () => onStep(change),
      },
      symbol
    );
  return el('div', { class: 'stepper', role: 'group', 'aria-label': 'Quantity' }, [
    stepButton(-1, 'One fewer', '−'),
    quantityLabel,
    stepButton(1, 'One more', '+'),
  ]);
}

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
    return unavailablePanel(item, state, catalog, onNavigate);
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
   * @param {number} change Either 1 or -1.
   * @returns {void}
   */
  function step(change) {
    quantity = Math.min(Math.max(quantity + change, 1), remaining);
    quantityLabel.textContent = String(quantity);
  }

  return el('div', { class: 'add-panel' }, [
    noteBox(noteField),
    el('div', { class: 'add-panel__row' }, [
      quantityStepper(quantityLabel, step),
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
    remaining <= LOW_STOCK_THRESHOLD
      ? el('p', { class: 'field__hint', text: `Only ${remaining} left today.` })
      : null,
  ]);
}
