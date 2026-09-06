/**
 * The tile one menu item is shown as.
 *
 * Used by the home screen, the menu grid, and the assistant's suggestions, so an
 * item looks and behaves the same everywhere a customer meets it.
 *
 * A sold out item is still shown rather than hidden. Hiding it would leave a
 * customer searching for something they were told the restaurant sells; showing it
 * greyed out with a label answers the question.
 */

import { el } from '../dom.js';
import { formatUSD } from '../../domain/money.js';

/** At or below this many left, the tile warns the customer to order soon. */
const LOW_STOCK_THRESHOLD = 5;

/**
 * Builds the stock badge for an item, or nothing when stock is comfortable.
 *
 * @param {number} stock How many the restaurant has left.
 * @returns {HTMLElement|null} A badge, or null when there is plenty.
 */
function stockBadge(stock) {
  if (stock === 0) {
    return el('span', { class: 'badge badge--danger', text: 'Sold out' });
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return el('span', { class: 'badge badge--warning', text: `Only ${stock} left` });
  }
  return null;
}

/**
 * Builds one menu item tile.
 *
 * @param {object} item A finished catalog item from data/menu.js.
 * @param {Function} onOpen Called with the item when the tile is activated.
 * @returns {HTMLElement} A button element wrapping the tile.
 */
export function itemCard(item, onOpen) {
  const isSoldOut = item.stock === 0;
  const image = item.imageId
    ? el('div', { class: 'card__media' }, [
        el('img', { src: `assets/img/${item.imageId}.webp`, alt: item.name, loading: 'lazy' }),
      ])
    : null;

  return el(
    'button',
    {
      class: `card card--interactive item-card${isSoldOut ? ' item-card--sold-out' : ''}`,
      type: 'button',
      onClick: () => onOpen(item),
      'aria-label': `${item.name}, ${formatUSD(item.priceCents)}${isSoldOut ? ', sold out' : ''}`,
    },
    [
      image,
      el('div', { class: 'card__body' }, [
        el('div', { class: 'item-card__head' }, [
          el('h3', { class: 'item-card__name', text: item.name }),
          el('span', { class: 'price', text: formatUSD(item.priceCents) }),
        ]),
        el('p', { class: 'item-card__description', text: item.description }),
        el('div', { class: 'item-card__tags' }, [
          stockBadge(item.stock),
          item.leadTimeHours > 0
            ? el('span', { class: 'badge badge--info', text: `${item.leadTimeHours}h notice` })
            : null,
          ...item.dietaryTags.map((tag) =>
            el('span', { class: 'badge badge--success', text: tag.replace('-', ' ') })
          ),
        ]),
      ]),
    ]
  );
}
