/**
 * Searching, filtering, and sorting the menu.
 *
 * With 426 items across 34 categories, a customer who wants the key lime pie is not
 * going to scroll for it. This module is what turns a search box, a row of filter
 * chips, and a sort dropdown into the list of items a screen renders.
 *
 * Pure functions over plain arrays. Nothing here reads the DOM or app state, which
 * is what lets test/search.test.js check the ranking rules directly.
 */

/** Every way the results can be ordered, with the label the dropdown shows. */
export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Best match' },
  { id: 'price-low', label: 'Price, low to high' },
  { id: 'price-high', label: 'Price, high to low' },
  { id: 'name', label: 'Name, A to Z' },
];

/** Score added when the whole query appears at the start of an item's name. */
const NAME_PREFIX_SCORE = 100;

/** Score added when the whole query appears anywhere in an item's name. */
const NAME_MATCH_SCORE = 50;

/** Score added per query word found in the description. */
const DESCRIPTION_WORD_SCORE = 5;

/** Score added for an item the restaurant features on its home page. */
const POPULAR_BONUS = 3;

/**
 * Normalizes text for comparison: lowercase, punctuation removed, single spaces.
 *
 * @param {string} text Any user query or item field.
 * @returns {string} A comparable form of the same text.
 */
export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reports whether a phrase appears in text starting at a word boundary.
 *
 * A plain includes would let the query "key" match "turkey sandwich", which is how
 * a search for key lime pie ends up offering deli meat. Anchoring to a word start
 * keeps "key lime" matching "fresh key lime pie" while rejecting the turkey.
 *
 * @param {string} text Normalized text to search.
 * @param {string} phrase Normalized phrase to look for.
 * @returns {boolean} True when the phrase begins a word in the text.
 */
function containsAtWordStart(text, phrase) {
  return text === phrase || text.startsWith(`${phrase} `) || text.includes(` ${phrase}`);
}

/**
 * Scores how well one item answers a search query.
 *
 * A name match beats a description match, and a name that starts with the query
 * beats one that merely contains it, so searching "pecan" puts Texas Pecan Pie above
 * a burger whose description happens to mention pecans.
 *
 * @param {object} item A finished catalog item from data/menu.js.
 * @param {string} query Normalized query text.
 * @returns {number} A score, where 0 means the item does not match at all.
 */
export function scoreItem(item, query) {
  const name = normalize(item.name);
  const descriptionWords = new Set(normalize(item.description).split(' '));
  let score = 0;

  if (name.startsWith(query)) {
    score += NAME_PREFIX_SCORE;
  } else if (containsAtWordStart(name, query)) {
    score += NAME_MATCH_SCORE;
  }

  // Whole words only. A substring test would let the query "key" score every item
  // whose description happens to mention turkey.
  for (const word of query.split(' ')) {
    if (word.length > 2 && descriptionWords.has(word)) {
      score += DESCRIPTION_WORD_SCORE;
    }
  }

  if (score > 0 && item.isPopular) {
    score += POPULAR_BONUS;
  }
  return score;
}

/**
 * Keeps only the items that pass every active filter.
 *
 * Filters combine with AND, which is what a customer expects: picking Vegetarian and
 * setting a maximum price should leave only items that satisfy both.
 *
 * @param {object[]} items Catalog items to narrow.
 * @param {object} filters Active filters.
 * @param {string} [filters.sectionId] Keep only this section.
 * @param {string} [filters.categoryId] Keep only this category.
 * @param {string[]} [filters.dietaryTags] Keep items carrying all of these tags.
 * @param {number} [filters.maxPriceCents] Keep items at or below this price.
 * @param {boolean} [filters.inStockOnly] Drop items the restaurant is out of.
 * @returns {object[]} The items that passed.
 */
export function filterItems(items, filters = {}) {
  return items.filter((item) => {
    if (filters.sectionId && item.sectionId !== filters.sectionId) {
      return false;
    }
    if (filters.categoryId && item.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.maxPriceCents !== undefined && item.priceCents > filters.maxPriceCents) {
      return false;
    }
    if (filters.inStockOnly && item.stock === 0) {
      return false;
    }
    const required = filters.dietaryTags ?? [];
    return required.every((tag) => item.dietaryTags.includes(tag));
  });
}

/**
 * Orders items by one of the SORT_OPTIONS.
 *
 * Returns a new array rather than sorting in place, because the caller's array is
 * the shared catalog and reordering it would change every other screen.
 *
 * Relevance ordering only means anything when a query was typed, so with no query it
 * falls back to name order to keep the list stable instead of arbitrary.
 *
 * @param {object[]} items Items to order.
 * @param {string} sortId One of the SORT_OPTIONS ids.
 * @param {Map<string, number>} [scores] Item id to search score, for relevance.
 * @returns {object[]} A new, ordered array.
 */
export function sortItems(items, sortId, scores) {
  const ordered = [...items];
  if (sortId === 'price-low') {
    return ordered.sort((a, b) => a.priceCents - b.priceCents || a.name.localeCompare(b.name));
  }
  if (sortId === 'price-high') {
    return ordered.sort((a, b) => b.priceCents - a.priceCents || a.name.localeCompare(b.name));
  }
  if (sortId === 'relevance' && scores) {
    return ordered.sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) || a.name.localeCompare(b.name)
    );
  }
  return ordered.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Runs a full menu query: filter, then search, then sort.
 *
 * This is the single entry point the menu screen calls. Keeping the three steps in
 * one place means the screen never has to remember the order they belong in.
 *
 * @param {object[]} items The full catalog.
 * @param {object} request What the customer is asking for.
 * @param {string} [request.query] Raw text from the search box.
 * @param {object} [request.filters] Filters, as accepted by filterItems.
 * @param {string} [request.sortId] One of the SORT_OPTIONS ids.
 * @returns {object[]} The items to render, in order.
 */
export function queryMenu(items, request = {}) {
  const filtered = filterItems(items, request.filters);
  const query = normalize(request.query ?? '');

  if (query === '') {
    return sortItems(filtered, request.sortId ?? 'name');
  }

  const scores = new Map();
  const matched = [];
  for (const item of filtered) {
    const score = scoreItem(item, query);
    if (score > 0) {
      scores.set(item.id, score);
      matched.push(item);
    }
  }
  return sortItems(matched, request.sortId ?? 'relevance', scores);
}
