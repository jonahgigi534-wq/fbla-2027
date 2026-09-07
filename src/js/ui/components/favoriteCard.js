/**
 * The large tile the home screen shows a featured dish in.
 *
 * House of Pies presents these without card chrome: a rounded photograph, the dish
 * name, a sentence about it, and an order button. That last part is why this exists
 * instead of reusing itemCard, which wraps the whole tile in a button and so has
 * nowhere legal to put a second one inside it.
 *
 * There is exactly one control per tile. The photograph is not separately clickable,
 * which keeps a keyboard user from tabbing through six tiles twice to reach the same
 * six pages.
 */

import { el } from '../dom.js';
import { formatUSD } from '../../domain/money.js';
import { foodPlaceholder } from './foodPlaceholder.js';

/**
 * Builds one featured dish tile.
 *
 * @param {object} item A finished catalog item from data/menu.js.
 * @param {Function} onOrder Called with the item when the order button is pressed.
 * @returns {HTMLElement} The tile.
 */
export function favoriteCard(item, onOrder) {
  const isSoldOut = item.stock === 0;

  return el('article', { class: 'favorite-card' }, [
    el('div', { class: 'favorite-card__media' }, [
      item.photo
        ? el('img', { src: item.photo.src, alt: '', loading: 'lazy' })
        : foodPlaceholder(item.name),
    ]),
    el('h3', { class: 'favorite-card__name', text: item.name }),
    el('p', { class: 'favorite-card__description', text: item.description }),
    el('span', { class: 'favorite-card__price', text: formatUSD(item.priceCents) }),
    el('div', { class: 'favorite-card__tags' }, [
      isSoldOut ? el('span', { class: 'badge badge--danger', text: 'Sold out' }) : null,
      item.leadTimeHours > 0
        ? el('span', { class: 'badge badge--info', text: `${item.leadTimeHours}h notice` })
        : null,
    ]),
    el(
      'button',
      {
        class: 'button',
        type: 'button',
        disabled: isSoldOut,
        // The visible label is the same on every tile, so the name goes in the
        // accessible one. Otherwise a screen reader reads six identical buttons.
        'aria-label': isSoldOut ? `${item.name}, sold out` : `Order ${item.name}`,
        onClick: () => onOrder(item),
      },
      isSoldOut ? 'Sold out' : 'Order now'
    ),
  ]);
}
