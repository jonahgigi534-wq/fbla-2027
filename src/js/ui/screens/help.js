/**
 * The searchable help center.
 * */

import { el, emptyState, render } from '../dom.js';
import { openAssistant } from '../components/assistant.js';
import { startTour } from '../components/tour.js';
import { HELP_ARTICLES } from '../../data/helpArticles.js';

/** What the article search is filtered to. */
const view = { query: '' };

/**
 * Finds the articles whose title, body, or keywords contain the search text.
 *
 * @param {string} rawQuery What the customer typed.
 * @returns {object[]} Matching articles, in their usual order.
 */
function matchingArticles(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (query === '') {
    return HELP_ARTICLES;
  }
  return HELP_ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(query) ||
      article.body.toLowerCase().includes(query) ||
      article.keywords.some((keyword) => keyword.includes(query))
  );
}

/**
 * Builds the search box and the buttons to ask or take the tour.
 *
 * @param {Function} onSearch Called after the search text changes.
 * @returns {HTMLElement} The controls row.
 */
function helpControls(onSearch) {
  const searchField = el('input', {
    class: 'field__control',
    id: 'help-search',
    type: 'search',
    placeholder: 'Search for cancel, allergy, budget, catering',
    value: view.query,
    onInput: (event) => {
      view.query = event.target.value;
      onSearch();
    },
  });

  return el('div', { class: 'menu-controls' }, [
    el('div', { class: 'menu-controls__search' }, [
      el('label', { class: 'field__label', for: 'help-search', text: 'Search the guides' }),
      searchField,
    ]),
    el('div', { class: 'help-ask' }, [
      el('p', { class: 'field__hint', text: 'Would you rather just ask, or be shown around?' }),
      el(
        'button',
        { class: 'button button--secondary', type: 'button', onClick: openAssistant },
        'Open the Pie Assistant'
      ),
      el(
        'button',
        { class: 'button button--secondary', type: 'button', onClick: startTour },
        'Take the tour again'
      ),
    ]),
  ]);
}

/**
 * Builds the articles, grouped under their headings, or a message when none match.
 *
 * @param {object[]} matches Articles to show.
 * @returns {HTMLElement} The list.
 */
function articleList(matches) {
  if (matches.length === 0) {
    return emptyState({
      icon: '\u{1F50D}',
      title: 'No guide matches that',
      body: 'Try a shorter word, or ask the Pie Assistant, which understands questions rather than keywords.',
      action: { label: 'Open the Pie Assistant', onClick: openAssistant },
    });
  }
  const groups = [...new Set(matches.map((article) => article.group))];
  return el(
    'div',
    { class: 'stack' },
    groups.map((group) =>
      el('section', { class: 'section' }, [
        el('div', { class: 'section__head' }, [el('h2', { text: group })]),
        el(
          'div',
          { class: 'help-list' },
          matches
            .filter((article) => article.group === group)
            .map((article) =>
              el('details', { class: 'help-article' }, [
                el('summary', { class: 'help-article__title', text: article.title }),
                el('p', { class: 'help-article__body', text: article.body }),
              ])
            )
        ),
      ])
    )
  );
}

/**
 * Renders the searchable guides.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHelp(container) {
  /**
   * Redraws the article list for the current search text.
   *
   * @returns {void}
   */
  function draw() {
    render(container, [
      el('div', { class: 'page-head' }, [
        el('h1', { text: 'Help center' }),
        el('p', {
          class: 'page-head__lede',
          text: 'Short guides to ordering, the Pie Assistant, and the staff area.',
        }),
      ]),
      helpControls(draw),
      articleList(matchingArticles(view.query)),
    ]);

    // Redrawing replaces the search box, so the cursor is put back where it was.
    const search = container.querySelector('#help-search');
    if (search && view.query !== '' && document.activeElement !== search) {
      search.focus();
      search.setSelectionRange(view.query.length, view.query.length);
    }
  }

  draw();
}
