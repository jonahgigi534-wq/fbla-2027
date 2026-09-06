/**
 * The menu screen: search, filter, sort, and browse 426 items.
 *
 * A list this long is only usable if a customer can cut it down fast, so the
 * controls at the top are the screen. Section tabs narrow to Food or Bakery, chips
 * narrow to a dietary need, the search box takes free text, and the sort dropdown
 * orders what is left. Everything runs through domain/search.js, which is where the
 * ranking rules are tested.
 */

import { el, emptyState, render } from '../dom.js';
import { itemCard } from '../components/itemCard.js';
import { ALL_ITEMS, SECTIONS, findCategory } from '../../data/menu.js';
import { DIETARY_TAGS } from '../../data/dietaryRules.js';
import { SORT_OPTIONS, queryMenu } from '../../domain/search.js';
import { navigate } from '../../app/router.js';

/**
 * What the customer has asked for right now.
 *
 * Kept at module level rather than in app/store.js because it describes how this one
 * screen is being looked at, not anything about the order being built. It survives
 * moving to an item and back, which is the behaviour a customer expects.
 */
const view = {
  query: '',
  sectionId: null,
  categoryId: null,
  dietaryTags: [],
  inStockOnly: false,
  sortId: 'relevance',
};

/** Re-renders the screen in place after a control changes. */
let rerender = () => {};

/**
 * Toggles a dietary tag on or off and redraws.
 *
 * @param {string} tagId One of the DIETARY_TAGS ids.
 * @returns {void}
 */
function toggleDietaryTag(tagId) {
  view.dietaryTags = view.dietaryTags.includes(tagId)
    ? view.dietaryTags.filter((id) => id !== tagId)
    : [...view.dietaryTags, tagId];
  rerender();
}

/**
 * Clears every filter and the search box.
 *
 * @returns {void}
 */
function clearFilters() {
  view.query = '';
  view.sectionId = null;
  view.categoryId = null;
  view.dietaryTags = [];
  view.inStockOnly = false;
  rerender();
}

/**
 * Builds the section tabs, plus an All tab.
 *
 * @returns {HTMLElement} The tab strip.
 */
function sectionTabs() {
  const tab = (id, label) =>
    el(
      'button',
      {
        class: 'chip',
        type: 'button',
        'aria-pressed': view.sectionId === id ? 'true' : 'false',
        onClick: () => {
          view.sectionId = id;
          view.categoryId = null;
          rerender();
        },
      },
      label
    );

  return el('div', { class: 'filter-row', role: 'group', 'aria-label': 'Menu sections' }, [
    tab(null, 'Everything'),
    ...SECTIONS.map((section) => tab(section.id, section.name)),
  ]);
}

/**
 * Builds the category chips for the chosen section, or nothing when none is chosen.
 *
 * @returns {HTMLElement|null} The chip row, or null.
 */
function categoryChips() {
  if (view.sectionId === null) {
    return null;
  }
  const section = SECTIONS.find((candidate) => candidate.id === view.sectionId);
  return el('div', { class: 'filter-row', role: 'group', 'aria-label': 'Categories' }, [
    el(
      'button',
      {
        class: 'chip',
        type: 'button',
        'aria-pressed': view.categoryId === null ? 'true' : 'false',
        onClick: () => {
          view.categoryId = null;
          rerender();
        },
      },
      `All ${section.name.toLowerCase()}`
    ),
    ...section.categories.map((category) =>
      el(
        'button',
        {
          class: 'chip',
          type: 'button',
          'aria-pressed': view.categoryId === category.id ? 'true' : 'false',
          onClick: () => {
            view.categoryId = category.id;
            rerender();
          },
        },
        category.name
      )
    ),
  ]);
}

/**
 * Builds the search box, dietary chips, stock toggle, and sort dropdown.
 *
 * @param {Function} onResultsChange Called when a control changes only which items
 *   match, so the screen can refresh the grid without rebuilding these controls.
 * @returns {HTMLElement} The control panel.
 */
function controls(onResultsChange) {
  const searchInput = el('input', {
    class: 'field__control',
    id: 'menu-search',
    type: 'search',
    placeholder: 'Try pecan, omelette, or key lime',
    value: view.query,
    autocomplete: 'off',
    onInput: (event) => {
      view.query = event.target.value;
      onResultsChange();
    },
  });

  return el('div', { class: 'menu-controls' }, [
    el('div', { class: 'menu-controls__search' }, [
      el('label', { class: 'field__label', for: 'menu-search', text: 'Search the menu' }),
      searchInput,
    ]),
    el('div', { class: 'menu-controls__sort' }, [
      el('label', { class: 'field__label', for: 'menu-sort', text: 'Sort by' }),
      el(
        'select',
        {
          class: 'field__control',
          id: 'menu-sort',
          onChange: (event) => {
            view.sortId = event.target.value;
            onResultsChange();
          },
        },
        SORT_OPTIONS.map((option) =>
          el('option', { value: option.id, selected: option.id === view.sortId }, option.label)
        )
      ),
    ]),
    el('div', { class: 'filter-row', role: 'group', 'aria-label': 'Dietary filters' }, [
      ...DIETARY_TAGS.map((tag) =>
        el(
          'button',
          {
            class: 'chip',
            type: 'button',
            'aria-pressed': view.dietaryTags.includes(tag.id) ? 'true' : 'false',
            onClick: () => toggleDietaryTag(tag.id),
          },
          tag.label
        )
      ),
      el(
        'button',
        {
          class: 'chip',
          type: 'button',
          'aria-pressed': view.inStockOnly ? 'true' : 'false',
          onClick: () => {
            view.inStockOnly = !view.inStockOnly;
            rerender();
          },
        },
        'Available now'
      ),
    ]),
  ]);
}

/**
 * Describes what is currently being shown, for the count line and screen readers.
 *
 * @param {number} shown How many items matched.
 * @returns {string} A sentence such as '12 items in Crafted Burgers'.
 */
function resultSummary(shown) {
  const noun = shown === 1 ? 'item' : 'items';
  const category = view.categoryId ? findCategory(view.categoryId) : null;
  if (view.query.trim() !== '') {
    return `${shown} ${noun} matching "${view.query.trim()}"`;
  }
  if (category) {
    return `${shown} ${noun} in ${category.name}`;
  }
  return `${shown} ${noun}`;
}

/**
 * Runs the current query and returns the matching items.
 *
 * @returns {object[]} Items to display, in order.
 */
function currentResults() {
  return queryMenu(ALL_ITEMS, {
    query: view.query,
    sortId: view.sortId,
    filters: {
      sectionId: view.sectionId ?? undefined,
      categoryId: view.categoryId ?? undefined,
      dietaryTags: view.dietaryTags,
      inStockOnly: view.inStockOnly,
    },
  });
}

/**
 * Builds the grid of results, or the empty state when nothing matched.
 *
 * @param {object[]} results Items to show.
 * @returns {HTMLElement} The grid or the empty state.
 */
function resultsBody(results) {
  if (results.length === 0) {
    return emptyState({
      icon: '\u{1F967}',
      title: 'Nothing matches those choices',
      body: 'The filters you picked have no items in common. Clearing them brings the whole menu back.',
      action: { label: 'Clear filters and search', onClick: clearFilters },
    });
  }
  return el(
    'div',
    { class: 'grid' },
    results.map((item) => itemCard(item, (chosen) => navigate(`/item/${chosen.id}`)))
  );
}

/**
 * Renders the menu screen.
 *
 * Typing in the search box updates only the count line and the results grid. The
 * controls above them are left alone on purpose: rebuilding the whole screen on
 * every keystroke would destroy and recreate the input the customer is typing into,
 * which loses the caret after the first letter.
 *
 * Clicking a filter chip does redraw everything, because a chip changes which other
 * controls belong on screen and the customer is not mid keystroke when they click.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {object} [params] Route parameters.
 * @param {string} [params.categoryId] Opens the screen filtered to one category.
 * @returns {void}
 */
export function renderMenu(container, params = {}) {
  if (params.categoryId) {
    const category = findCategory(params.categoryId);
    if (category) {
      view.categoryId = category.id;
      view.sectionId = category.sectionId;
    }
  }

  const countLine = el('p', { class: 'result-count', role: 'status', 'aria-live': 'polite' });
  const resultsHost = el('div', { class: 'results-host' });

  /**
   * Refills the count line and the grid from the current filters.
   *
   * @returns {void}
   */
  function refreshResults() {
    const results = currentResults();
    countLine.textContent = resultSummary(results.length);
    render(resultsHost, resultsBody(results));
  }

  /**
   * Rebuilds every control, used when a filter changes the shape of the screen.
   *
   * @returns {void}
   */
  function drawEverything() {
    render(container, [
      el('div', { class: 'page-head' }, [
        el('h1', { text: 'Menu' }),
        el('p', {
          class: 'page-head__lede',
          text: 'Breakfast all day, plates, sandwiches, and over forty homemade pies.',
        }),
      ]),
      controls(refreshResults),
      sectionTabs(),
      categoryChips(),
      countLine,
      resultsHost,
    ]);
    refreshResults();
  }

  rerender = drawEverything;
  drawEverything();
}
