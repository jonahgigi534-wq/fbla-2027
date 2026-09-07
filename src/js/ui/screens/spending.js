/**
 * The customer's own spending, summarized.
 *
 * The assigned topic asks the program to let customers review their order
 * information, and a list of receipts only half answers that. This screen answers
 * the questions a regular actually has: what have I spent here, how often do I come,
 * and what do I keep ordering.
 *
 * It runs on the same engine as the manager reports in domain/reports.js, narrowed
 * to this customer's orders. One tested aggregation serving both sides is better
 * than two that can disagree.
 */

import { el, banner, emptyState, render } from '../dom.js';
import { getState } from '../../app/store.js';
import { navigate } from '../../app/router.js';
import { findItem } from '../../data/menu.js';
import { buildReport, sortRows } from '../../domain/reports.js';
import { formatUSD } from '../../domain/money.js';

/** How many favorites to name. */
const FAVOURITES_SHOWN = 5;

/** Ranges the customer can look at. */
const RANGES = [
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: '365', label: 'Last year', days: 365 },
];

/** Which range is selected. */
const view = { rangeId: '90' };

/**
 * Returns an ISO date a number of days before today.
 *
 * @param {number} daysAgo How far back.
 * @returns {string} An ISO date.
 */
function isoDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

/**
 * Builds one headline figure.
 *
 * @param {string} label What it measures.
 * @param {string} value The figure.
 * @param {string} note A line of context underneath.
 * @returns {HTMLElement} The tile.
 */
function tile(label, value, note) {
  return el('div', { class: 'summary-tile' }, [
    el('p', { class: 'summary-tile__label', text: label }),
    el('p', { class: 'summary-tile__value', text: value }),
    el('p', { class: 'summary-tile__previous', text: note }),
  ]);
}

/**
 * Builds the favorites table.
 *
 * @param {object[]} favorites Rows from a report grouped by item.
 * @returns {HTMLElement} The table, or a note when there is nothing in range.
 */
function favouritesTable(favorites) {
  if (favorites.length === 0) {
    return el('p', { class: 'muted', text: 'No orders in this range. Try a longer one.' });
  }

  const body = favorites.map((row) => {
    const item = findItem(row.key);
    return el('tr', {}, [
      el('th', { scope: 'row', text: item ? item.name : row.key }),
      el('td', { class: 'numeric', text: String(row.units) }),
      el('td', { class: 'numeric', text: formatUSD(row.revenue) }),
      el('td', {}, [
        item
          ? el(
              'button',
              {
                class: 'button button--quiet button--small',
                type: 'button',
                onClick: () => navigate(`/item/${item.id}`),
              },
              'Order again'
            )
          : null,
      ]),
    ]);
  });

  return el('div', { class: 'table-wrap' }, [
    el('table', { class: 'table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { scope: 'col', text: 'Item' }),
          el('th', { scope: 'col', class: 'numeric', text: 'Times ordered' }),
          el('th', { scope: 'col', class: 'numeric', text: 'Spent on it' }),
          el('th', { scope: 'col' }, [el('span', { class: 'visually-hidden', text: 'Actions' })]),
        ]),
      ]),
      el('tbody', {}, body),
    ]),
  ]);
}

/**
 * Renders the spending summary.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderSpending(container) {
  /**
   * Redraws the summary for the chosen time range.
   *
   * The range buttons call this rather than the whole screen, so the button that was
   * just pressed keeps focus.
   *
   * @returns {void}
   */
  function draw() {
    const state = getState();
    // This customer's orders: the ones placed here, plus the slice of generated
    // history marked as theirs so the screen has something to summarize on a
    // fresh install. The banner below says that plainly.
    const mine = state.orders.filter((order) => !order.isSeeded || order.isDemoCustomer);

    if (mine.length === 0) {
      render(
        container,
        emptyState({
          icon: '\u{1F4CA}',
          title: 'Nothing to summarize yet',
          body: 'Once you have ordered a few times this shows what you have spent and what you keep coming back for.',
          action: { label: 'Browse the menu', onClick: () => navigate('/menu') },
        })
      );
      return;
    }

    const range = RANGES.find((candidate) => candidate.id === view.rangeId);
    const options = { startDate: isoDaysAgo(range.days - 1), endDate: isoDaysAgo(0) };
    const byItem = buildReport(mine, { ...options, groupBy: 'item' });
    const totals = buildReport(mine, { ...options, groupBy: 'day' }).totals;
    const favorites = sortRows(byItem.rows, 'units').slice(0, FAVOURITES_SHOWN);
    const seededCount = mine.filter((order) => order.isSeeded).length;

    render(container, [
      el('div', { class: 'page-head' }, [
        el('h1', { text: 'Your spending' }),
        el('p', {
          class: 'page-head__lede',
          text: 'What you have ordered, and what you keep coming back for.',
        }),
      ]),

      seededCount > 0
        ? banner(
            'info',
            'Includes demonstration history',
            `${seededCount} of these are sample orders, so this screen has something to show on a fresh install. Orders you place yourself are counted the same way.`
          )
        : null,

      el(
        'div',
        { class: 'filter-row', role: 'group', 'aria-label': 'Time range' },
        RANGES.map((candidate) =>
          el(
            'button',
            {
              class: 'chip',
              type: 'button',
              'aria-pressed': view.rangeId === candidate.id ? 'true' : 'false',
              onClick: () => {
                view.rangeId = candidate.id;
                draw();
              },
            },
            candidate.label
          )
        )
      ),

      el('div', { class: 'summary-tiles' }, [
        tile('Total spent', formatUSD(totals.revenue), range.label.toLowerCase()),
        tile('Orders', String(totals.orders), 'placed in this range'),
        tile('Average order', formatUSD(totals.averageOrder), 'across those orders'),
        tile('Items', String(totals.units), 'ordered in total'),
      ]),

      el('section', { class: 'section' }, [
        el('div', { class: 'section__head' }, [el('h2', { text: 'What you order most' })]),
        favouritesTable(favorites),
      ]),
    ]);
  }

  draw();
}
