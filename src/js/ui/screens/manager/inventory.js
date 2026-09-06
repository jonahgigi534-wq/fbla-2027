/**
 * Stock levels, and the screen that edits them.
 *
 * This is where the customer side gets its unavailable items from. Setting something
 * to zero here is what makes it show as sold out on the menu, refuse to go into a
 * cart, and start offering substitutes, which is the whole inventory story running
 * from one number.
 *
 * The stock field is validated. Typing a negative number or a word into it is the
 * first thing anyone tries, and the answer has to be a message rather than a broken
 * menu.
 */

import { el, render } from '../../dom.js';
import { showToast } from '../../components/toast.js';
import { managerTabs, withManagerAccess } from './shell.js';
import { getState, update } from '../../../app/store.js';
import { ALL_ITEMS } from '../../../data/menu.js';
import { LOW_STOCK_THRESHOLD, stockFor } from '../../../domain/inventory.js';
import { formatUSD } from '../../../domain/money.js';

/** How many rows to show before asking the manager to narrow the search. */
const MAX_ROWS = 40;

/** What the list is filtered to right now. */
const view = { query: '', showLowOnly: false };

/**
 * Saves a new stock level for one item.
 *
 * @param {string} itemId The item.
 * @param {string} raw Whatever was typed in the field.
 * @returns {boolean} True when the value was accepted.
 */
function saveStock(itemId, raw) {
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) {
    showToast('Stock has to be a whole number, zero or more.', 'error');
    return false;
  }
  update((current) => ({
    stockOverrides: { ...current.stockOverrides, [itemId]: Number(text) },
  }));
  return true;
}

/**
 * Builds one editable stock row.
 *
 * @param {object} item A catalog item.
 * @param {Object<string, number>} stockOverrides Live stock.
 * @param {Function} onChanged Called after a successful edit.
 * @returns {HTMLElement} The row.
 */
function stockRow(item, stockOverrides, onChanged) {
  const stock = stockFor(item, stockOverrides);
  const field = el('input', {
    class: 'field__control stock-row__field',
    type: 'text',
    inputmode: 'numeric',
    value: String(stock),
    'aria-label': `Stock for ${item.name}`,
  });

  let tone = '';
  let label = 'In stock';
  if (stock === 0) {
    tone = 'badge--danger';
    label = 'Sold out';
  } else if (stock <= LOW_STOCK_THRESHOLD) {
    tone = 'badge--warning';
    label = 'Low';
  }

  return el('div', { class: 'stock-row' }, [
    el('div', {}, [
      el('p', { class: 'stock-row__name', text: item.name }),
      el('p', { class: 'muted', text: `${item.categoryId} · ${formatUSD(item.priceCents)}` }),
    ]),
    el('span', { class: `badge ${tone}`, text: label }),
    field,
    el(
      'button',
      {
        class: 'button button--secondary button--small',
        type: 'button',
        onClick: () => {
          if (saveStock(item.id, field.value)) {
            onChanged();
          }
        },
      },
      'Save'
    ),
    el(
      'button',
      {
        class: 'button button--quiet button--small',
        type: 'button',
        onClick: () => {
          if (saveStock(item.id, '0')) {
            showToast(`${item.name} marked sold out.`);
            onChanged();
          }
        },
      },
      'Mark sold out'
    ),
  ]);
}

/**
 * Renders the inventory screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderManagerInventory(container) {
  withManagerAccess(container, '/manager/inventory', () => {
    function draw() {
      const { stockOverrides } = getState();
      const query = view.query.trim().toLowerCase();

      const matches = ALL_ITEMS.filter((item) => {
        if (query && !item.name.toLowerCase().includes(query)) {
          return false;
        }
        if (view.showLowOnly && stockFor(item, stockOverrides) > LOW_STOCK_THRESHOLD) {
          return false;
        }
        return true;
      });

      const soldOut = ALL_ITEMS.filter((item) => stockFor(item, stockOverrides) === 0).length;
      const low = ALL_ITEMS.filter((item) => {
        const stock = stockFor(item, stockOverrides);
        return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
      }).length;

      const searchField = el('input', {
        class: 'field__control',
        id: 'stock-search',
        type: 'search',
        placeholder: 'Search items',
        value: view.query,
        onInput: (event) => {
          view.query = event.target.value;
          draw();
        },
      });

      render(container, [
        el('div', { class: 'page-head' }, [
          el('h1', { text: 'Inventory' }),
          el('p', {
            class: 'page-head__lede',
            text: `${soldOut} sold out, ${low} running low, ${ALL_ITEMS.length} items on the menu.`,
          }),
        ]),
        managerTabs('/manager/inventory'),

        el('div', { class: 'menu-controls' }, [
          el('div', { class: 'menu-controls__search' }, [
            el('label', { class: 'field__label', for: 'stock-search', text: 'Find an item' }),
            searchField,
          ]),
          el('div', { class: 'filter-row' }, [
            el(
              'button',
              {
                class: 'chip',
                type: 'button',
                'aria-pressed': view.showLowOnly ? 'true' : 'false',
                onClick: () => {
                  view.showLowOnly = !view.showLowOnly;
                  draw();
                },
              },
              'Low or sold out only'
            ),
          ]),
        ]),

        el('p', {
          class: 'result-count',
          role: 'status',
          'aria-live': 'polite',
          text: `${matches.length} items match. Showing the first ${Math.min(matches.length, MAX_ROWS)}.`,
        }),
        el(
          'div',
          { class: 'stock-list' },
          matches.slice(0, MAX_ROWS).map((item) => stockRow(item, stockOverrides, draw))
        ),
      ]);

      const search = container.querySelector('#stock-search');
      if (search && view.query !== '' && document.activeElement !== search) {
        search.focus();
        search.setSelectionRange(view.query.length, view.query.length);
      }
    }

    draw();
  });
}
