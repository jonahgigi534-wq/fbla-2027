/**
 * One item, in full: photo, price, ingredients, allergens, and availability.
 *
 * Allergens are read from the ingredients, and the screen says so.
 */

import { el, banner, emptyState, render } from '../dom.js';
import { itemCard } from '../components/itemCard.js';
import { foodPlaceholder } from '../components/foodPlaceholder.js';
import { addToCartPanel } from '../components/addToCartPanel.js';
import { getState } from '../../app/store.js';
import { ALL_ITEMS, findCategory } from '../../data/menu.js';
import { ALLERGEN_LABELS } from '../../data/dietaryRules.js';
import { formatUSD } from '../../domain/money.js';
import { withLiveStock } from '../../domain/inventory.js';
import { navigate } from '../../app/router.js';

/** How many other items from the same category to suggest underneath. */
const SUGGESTION_COUNT = 4;

/**
 * Builds the availability banner for an item.
 *
 * @param {object} item A finished catalog item.
 * @returns {HTMLElement|null} A banner, or null when nothing needs saying.
 */
function availabilityBanner(item) {
  if (item.stock === 0) {
    return banner(
      'danger',
      'Sold out right now',
      'The kitchen is out of this one. The suggestions below are from the same part of the menu.'
    );
  }
  if (item.leadTimeHours > 0) {
    return banner(
      'info',
      `Needs ${item.leadTimeHours} hours notice`,
      'This is made to order, so pick a collection time at least two days out.'
    );
  }
  return null;
}

/**
 * Builds one link in the trail above the item.
 *
 * @param {string} label What the link says.
 * @param {string} path Where it goes.
 * @returns {HTMLElement} The link, as a button.
 */
function crumb(label, path) {
  return el(
    'button',
    { class: 'button button--quiet button--small', type: 'button', onClick: () => navigate(path) },
    label
  );
}

/**
 * Builds the Menu / Category trail above the item.
 *
 * @param {object} item The item being shown.
 * @param {object|undefined} category The category it belongs to.
 * @returns {HTMLElement} The breadcrumb.
 */
function breadcrumb(item, category) {
  return el('nav', { class: 'breadcrumb', 'aria-label': 'Breadcrumb' }, [
    crumb('Menu', '/menu'),
    el('span', { class: 'breadcrumb__separator', 'aria-hidden': 'true', text: '/' }),
    crumb(category ? category.name : 'Category', `/menu/${item.categoryId}`),
  ]);
}

/**
 * Builds the photo, or the drawn tile when the item has none.
 *
 * @param {object} item The item being shown.
 * @returns {HTMLElement} The media block.
 */
function itemMedia(item) {
  return el('div', { class: 'item-detail__media' }, [
    item.photo ? el('img', { src: item.photo.src, alt: item.name }) : foodPlaceholder(item.name),
    // Saying so is the honest thing. A picture of a different pie in the same
    // family is useful, but only if the customer knows that is what it is.
    item.photo && item.photo.isCategoryPhoto
      ? el('p', {
          class: 'item-detail__photo-note',
          text: 'Category photo. Your item is made fresh and may look different.',
        })
      : null,
  ]);
}

/**
 * Builds a row of badges, or a line saying there are none.
 *
 * @param {string[]} labels What each badge says.
 * @param {string} tone The badge color, such as 'success' or 'warning'.
 * @param {string} emptyText What to say when there are no badges.
 * @returns {HTMLElement} The badges or the line.
 */
function badgeRow(labels, tone, emptyText) {
  if (labels.length === 0) {
    return el('p', { class: 'muted', text: emptyText });
  }
  return el(
    'div',
    { class: 'filter-row' },
    labels.map((label) => el('span', { class: `badge badge--${tone}`, text: label }))
  );
}

/**
 * Builds the dietary tags and allergens under the add button.
 *
 * @param {object} item The item being shown.
 * @returns {HTMLElement} The facts block.
 */
function itemFacts(item) {
  return el('div', { class: 'item-detail__facts' }, [
    el('div', {}, [
      el('h4', { text: 'Dietary' }),
      badgeRow(
        item.dietaryTags.map((tag) => tag.replace('-', ' ')),
        'success',
        'No dietary tags on this item.'
      ),
    ]),
    el('div', {}, [
      el('h4', { text: 'May contain' }),
      badgeRow(
        item.allergens.map((code) => ALLERGEN_LABELS[code] ?? code),
        'warning',
        'No common allergens found in the ingredients.'
      ),
      el('p', {
        class: 'field__hint',
        text: 'Read from the ingredient list, not from a lab test. Please tell the restaurant about any allergy when you order.',
      }),
    ]),
  ]);
}

/**
 * Builds the name, price, description, add button, and facts beside the photo.
 *
 * @param {object} item The item being shown.
 * @returns {HTMLElement} The info column.
 */
function itemInfo(item) {
  return el('div', { class: 'item-detail__info stack' }, [
    el('h1', { text: item.name }),
    el('p', { class: 'item-detail__price price', text: formatUSD(item.priceCents) }),
    el('p', { text: item.description }),
    availabilityBanner(item),
    addToCartPanel(item, getState(), ALL_ITEMS, (itemId) => navigate(`/item/${itemId}`)),
    itemFacts(item),
  ]);
}

/**
 * Builds the row of other items from the same category.
 *
 * @param {object[]} suggestions Items to suggest.
 * @param {object|undefined} category The category they come from.
 * @returns {HTMLElement|null} The section, or null when there is nothing to suggest.
 */
function suggestionSection(suggestions, category) {
  if (suggestions.length === 0) {
    return null;
  }
  return el('section', { class: 'section' }, [
    el('div', { class: 'section__head' }, [
      el('h2', { text: `More from ${category ? category.name : 'this section'}` }),
    ]),
    el(
      'div',
      { class: 'grid' },
      suggestions.map((other) => itemCard(other, (chosen) => navigate(`/item/${chosen.id}`)))
    ),
  ]);
}

/**
 * Renders one item, or a not found message when the id is unknown.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {object} params Route parameters.
 * @param {string} params.itemId The item to show.
 * @returns {void}
 */
export function renderItem(container, params) {
  const catalog = withLiveStock(ALL_ITEMS, getState().stockOverrides);
  const item = catalog.find((candidate) => candidate.id === params.itemId);

  if (!item) {
    render(
      container,
      emptyState({
        icon: '\u{1F50E}',
        title: 'We could not find that item',
        body: 'It may have been renamed or taken off the menu. The full menu is one tap away.',
        action: { label: 'Back to the menu', onClick: () => navigate('/menu') },
      })
    );
    return;
  }

  const category = findCategory(item.categoryId);
  const suggestions = catalog
    .filter(
      (other) => other.categoryId === item.categoryId && other.id !== item.id && other.stock > 0
    )
    .slice(0, SUGGESTION_COUNT);

  render(container, [
    breadcrumb(item, category),
    el('div', { class: 'item-detail' }, [itemMedia(item), itemInfo(item)]),
    suggestionSection(suggestions, category),
  ]);
}
