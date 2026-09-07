/**
 * The searchable help center.
 *
 * Every guide in one list, filtered as you type. Typing redraws only the list rather
 * than the whole screen, so the search box keeps the caret and the focus it has.
 *
 * The four reference pages behind the other tabs live in helpPages.js, and the tabs
 * and heading they all share live in helpShell.js.
 */

import { el, emptyState, render } from '../dom.js';
import { navigate } from '../../app/router.js';
import { openAssistant } from '../components/assistant.js';
import { HELP_ARTICLES } from '../../data/helpArticles.js';
import { head, sectionTabs } from './helpShell.js';

/** What the article search is filtered to. */
const view = { query: '' };

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
   * Typing calls this rather than the whole screen so the search box keeps the caret
   * and the focus it already has.
   *
   * @returns {void}
   */
  function draw() {
    const query = view.query.trim().toLowerCase();
    const matches = HELP_ARTICLES.filter((article) => {
      if (query === '') {
        return true;
      }
      return (
        article.title.toLowerCase().includes(query) ||
        article.body.toLowerCase().includes(query) ||
        article.keywords.some((keyword) => keyword.includes(query))
      );
    });

    const groups = [...new Set(matches.map((article) => article.group))];

    const searchField = el('input', {
      class: 'field__control',
      id: 'help-search',
      type: 'search',
      placeholder: 'Search for cancel, allergy, budget, catering',
      value: view.query,
      onInput: (event) => {
        view.query = event.target.value;
        draw();
      },
    });

    render(container, [
      head('Guides to every part of the program, plus how it answers the assigned topic.'),
      sectionTabs('articles'),

      el('div', { class: 'menu-controls' }, [
        el('div', { class: 'menu-controls__search' }, [
          el('label', { class: 'field__label', for: 'help-search', text: 'Search the guides' }),
          searchField,
        ]),
        el('div', { class: 'help-ask' }, [
          el('p', { class: 'field__hint', text: 'Would rather just ask?' }),
          el(
            'button',
            { class: 'button button--secondary', type: 'button', onClick: openAssistant },
            'Open the Pie Assistant'
          ),
        ]),
      ]),

      matches.length === 0
        ? emptyState({
            icon: '\u{1F50D}',
            title: 'No guide matches that',
            body: 'Try a shorter word, or ask the Pie Assistant, which understands questions rather than keywords.',
            action: { label: 'Open the Pie Assistant', onClick: openAssistant },
          })
        : el(
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
          ),
    ]);

    const search = container.querySelector('#help-search');
    if (search && view.query !== '' && document.activeElement !== search) {
      search.focus();
      search.setSelectionRange(view.query.length, view.query.length);
    }
  }

  draw();
}
