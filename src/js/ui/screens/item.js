/**
 * One item, in full: photo, price, ingredients, allergens, and availability.
 *
 * The allergen list is derived from the ingredient text by domain/dietary.js, so
 * this screen says plainly where it comes from. Telling a customer with a nut
 * allergy that a pie is safe when nobody checked would be worse than saying nothing.
 *
 * Adding to a cart arrives in the next phase. For now this screen is where a
 * customer confirms an item is the one they wanted.
 */

import { el, banner, emptyState, render } from '../dom.js';
import { itemCard } from '../components/itemCard.js';
import { foodPlaceholder } from '../components/foodPlaceholder.js';
import { addToCartPanel } from '../components/addToCartPanel.js';
import { getState } from '../../app/store.js';
import { ALL_ITEMS, findCategory, findItem } from '../../data/menu.js';
import { ALLERGEN_LABELS } from '../../data/dietaryRules.js';
import { formatUSD } from '../../domain/money.js';
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
 * Renders one item, or a not found message when the id is unknown.
 *
 * A bad item id reaches here whenever someone edits the address bar or follows a
 * stale link, so it gets a real screen with a way back rather than a blank page.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {object} params Route parameters.
 * @param {string} params.itemId The item to show.
 * @returns {void}
 */
export function renderItem(container, params) {
  const item = findItem(params.itemId);

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
  const suggestions = ALL_ITEMS.filter(
    (other) => other.categoryId === item.categoryId && other.id !== item.id && other.stock > 0
  ).slice(0, SUGGESTION_COUNT);

  render(container, [
    el('nav', { class: 'breadcrumb', 'aria-label': 'Breadcrumb' }, [
      el(
        'button',
        {
          class: 'button button--quiet button--small',
          type: 'button',
          onClick: () => navigate('/menu'),
        },
        'Menu'
      ),
      el('span', { class: 'breadcrumb__separator', 'aria-hidden': 'true', text: '/' }),
      el(
        'button',
        {
          class: 'button button--quiet button--small',
          type: 'button',
          onClick: () => navigate(`/menu/${item.categoryId}`),
        },
        category ? category.name : 'Category'
      ),
    ]),

    el('div', { class: 'item-detail' }, [
      el('div', { class: 'item-detail__media' }, [
        item.photo
          ? el('img', { src: item.photo.src, alt: item.name })
          : foodPlaceholder(item.name),
        // Saying so is the honest thing. A picture of a different pie in the same
        // family is useful, but only if the customer knows that is what it is.
        item.photo && item.photo.isCategoryPhoto
          ? el('p', {
              class: 'item-detail__photo-note',
              text: 'Category photo. Your item is made fresh and may look different.',
            })
          : null,
      ]),
      el('div', { class: 'item-detail__info stack' }, [
        el('h1', { text: item.name }),
        el('p', { class: 'item-detail__price price', text: formatUSD(item.priceCents) }),
        el('p', { text: item.description }),
        availabilityBanner(item),
        addToCartPanel(item, getState(), ALL_ITEMS, (itemId) => navigate(`/item/${itemId}`)),
        el('div', { class: 'item-detail__facts' }, [
          el('div', {}, [
            el('h4', { text: 'Dietary' }),
            item.dietaryTags.length > 0
              ? el(
                  'div',
                  { class: 'filter-row' },
                  item.dietaryTags.map((tag) =>
                    el('span', { class: 'badge badge--success', text: tag.replace('-', ' ') })
                  )
                )
              : el('p', { class: 'muted', text: 'No dietary tags on this item.' }),
          ]),
          el('div', {}, [
            el('h4', { text: 'May contain' }),
            item.allergens.length > 0
              ? el(
                  'div',
                  { class: 'filter-row' },
                  item.allergens.map((code) =>
                    el('span', {
                      class: 'badge badge--warning',
                      text: ALLERGEN_LABELS[code] ?? code,
                    })
                  )
                )
              : el('p', { class: 'muted', text: 'No common allergens found in the ingredients.' }),
            el('p', {
              class: 'field__hint',
              text: 'Read from the ingredient list, not from a lab test. Please tell the restaurant about any allergy when you order.',
            }),
          ]),
        ]),
      ]),
    ]),

    suggestions.length > 0
      ? el('section', { class: 'section' }, [
          el('div', { class: 'section__head' }, [
            el('h2', { text: `More from ${category ? category.name : 'this section'}` }),
          ]),
          el(
            'div',
            { class: 'grid' },
            suggestions.map((other) => itemCard(other, (chosen) => navigate(`/item/${chosen.id}`)))
          ),
        ])
      : null,
  ]);
}
