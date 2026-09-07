/**
 * The help center.
 *
 * Four things live here, and each exists for a reason the rating sheet names.
 *
 *   - Searchable how-to articles, which is the interactive help menu.
 *   - How This Meets the Topic, which quotes every clause of the assigned topic and
 *     links to the feature answering it. Full marks for Functionality need the
 *     correlation explained in the instructions, and the instructions a judge reads
 *     are the ones inside the program.
 *   - Programming Concepts, pointing at the file and function behind each construct
 *     the topic asks the program to demonstrate.
 *   - Validation rules, listing both checks applied to every input.
 */

import { el, emptyState, render } from '../dom.js';
import { navigate } from '../../app/router.js';
import { openAssistant } from '../components/assistant.js';
import { HELP_ARTICLES } from '../../data/helpArticles.js';
import { TOPIC_COVERAGE, TOPIC_TITLE } from '../../data/topicCoverage.js';
import { PROGRAMMING_CONCEPTS } from '../../data/programmingConcepts.js';
import { VALIDATION_CATALOG } from '../../data/validationCatalog.js';
import { ATTRIBUTION, INSTEAD_OF_LIBRARIES, PROJECT_STATS } from '../../data/projectFacts.js';

/** The sections of the help center, in order. */
const SECTIONS = [
  { id: 'articles', path: '/help', label: 'Guides' },
  { id: 'topic', path: '/help/topic', label: 'How this meets the topic' },
  { id: 'concepts', path: '/help/concepts', label: 'Programming concepts' },
  { id: 'validation', path: '/help/validation', label: 'Validation rules' },
  { id: 'about', path: '/help/about', label: 'About this project' },
];

/** What the article search is filtered to. */
const view = { query: '' };

/**
 * Builds the section tabs.
 *
 * @param {string} activeId Which section is showing.
 * @returns {HTMLElement} The tabs.
 */
function sectionTabs(activeId) {
  return el(
    'nav',
    { class: 'manager-tabs', 'aria-label': 'Help sections' },
    SECTIONS.map((section) =>
      el('a', {
        class: 'chip',
        href: `#${section.path}`,
        text: section.label,
        'aria-current': section.id === activeId ? 'page' : null,
      })
    )
  );
}

/**
 * Builds the page heading shared by every section.
 *
 * @param {string} lede The line under the title.
 * @returns {HTMLElement} The heading block.
 */
function head(lede) {
  return el('div', { class: 'page-head' }, [
    el('h1', { text: 'Help center' }),
    el('p', { class: 'page-head__lede', text: lede }),
  ]);
}

/**
 * Renders the searchable guides.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHelp(container) {
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

/**
 * Renders the topic coverage page.
 *
 * Each clause of the assigned topic is quoted exactly, followed by what answers it
 * and a button that navigates straight to that feature. A judge can check every
 * claim on this page without being told where to look.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHelpTopic(container) {
  render(container, [
    head(`Every clause of the assigned topic, and what in this program answers it.`),
    sectionTabs('topic'),
    el('div', { class: 'banner banner--info' }, [
      el('div', {}, [
        el('div', { class: 'banner__title', text: `2026-2027 topic: ${TOPIC_TITLE}` }),
        el('div', {
          text: 'Quoted below exactly as the event guidelines word it. Each entry links to the screen where you can see it working.',
        }),
      ]),
    ]),
    el(
      'ol',
      { class: 'coverage' },
      TOPIC_COVERAGE.map((entry) =>
        el('li', { class: 'coverage__item' }, [
          el('blockquote', { class: 'coverage__clause', text: `“${entry.clause}”` }),
          el('p', { class: 'coverage__answer', text: entry.answer }),
          el(
            'button',
            {
              class: 'button button--secondary button--small',
              type: 'button',
              onClick: () => navigate(entry.path),
            },
            entry.linkLabel
          ),
        ])
      )
    ),
  ]);
}

/**
 * Renders the programming concepts page.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHelpConcepts(container) {
  render(container, [
    head('Where each construct the topic asks for actually lives in the code.'),
    sectionTabs('concepts'),
    el('div', { class: 'banner banner--info' }, [
      el('div', {}, [
        el('div', { class: 'banner__title', text: 'Why this page exists' }),
        el('div', {
          text: 'Modern JavaScript hides some of these. map and filter do the work a for loop does in other languages, so someone scanning for loops could conclude there are none. Every claim below names a file and a function.',
        }),
      ]),
    ]),
    el('div', { class: 'table-wrap' }, [
      el('table', { class: 'table' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { scope: 'col', text: 'Concept' }),
            el('th', { scope: 'col', text: 'Where' }),
            el('th', { scope: 'col', text: 'What it does there' }),
          ]),
        ]),
        el(
          'tbody',
          {},
          PROGRAMMING_CONCEPTS.map((entry) =>
            el('tr', {}, [
              el('th', { scope: 'row', text: entry.concept }),
              el('td', {}, [el('code', { class: 'code', text: entry.where })]),
              el('td', { class: 'table__prose', text: entry.detail }),
            ])
          )
        ),
      ]),
    ]),
  ]);
}

/**
 * Renders the validation catalog.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHelpValidation(container) {
  render(container, [
    head('Every input the program checks, and both checks it applies.'),
    sectionTabs('validation'),
    el('div', { class: 'banner banner--info' }, [
      el('div', {}, [
        el('div', { class: 'banner__title', text: 'Two different questions' }),
        el('div', {
          text: 'Syntactic asks whether a value is the right shape. Semantic asks whether it is right for this order, this restaurant, and this moment. A ZIP code can be a real ZIP and still not be one Kirby delivers to, and each gets its own message.',
        }),
      ]),
    ]),
    el('div', { class: 'table-wrap' }, [
      el('table', { class: 'table' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { scope: 'col', text: 'Input' }),
            el('th', { scope: 'col', text: 'Syntactic check' }),
            el('th', { scope: 'col', text: 'Semantic check' }),
          ]),
        ]),
        el(
          'tbody',
          {},
          VALIDATION_CATALOG.map((entry) =>
            el('tr', {}, [
              el('th', { scope: 'row', text: entry.field }),
              el('td', { class: 'table__prose', text: entry.syntactic }),
              el('td', { class: 'table__prose' }, [
                entry.semantic
                  ? el('span', { text: entry.semantic })
                  : el('span', {
                      class: 'muted',
                      text: 'Shape is the only check this field needs.',
                    }),
              ]),
            ])
          )
        ),
      ]),
    ]),
  ]);
}

/**
 * Renders the about page: what was borrowed, and what was built rather than installed.
 *
 * This exists because the competition provides no internet and judges have no Markdown
 * reader. The attribution and the library list are the two documents most likely to be
 * asked about, so they are readable inside the program rather than only in the repository.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHelpAbout(container) {
  render(container, [
    head('What this project is, what was borrowed, and what was built.'),
    sectionTabs('about'),

    el('div', { class: 'summary-tiles' }, PROJECT_STATS.map((stat) =>
      el('div', { class: 'summary-tile' }, [
        el('p', { class: 'summary-tile__label', text: stat.label }),
        el('p', { class: 'summary-tile__value', text: stat.value }),
        el('p', { class: 'summary-tile__previous', text: stat.note }),
      ])
    )),

    el('div', { class: 'banner banner--warning' }, [
      el('div', {}, [
        el('div', { class: 'banner__title', text: 'An independent student project' }),
        el('div', {
          text: 'Built for an FBLA Introduction to Programming event. Not affiliated with, endorsed by, or connected to House of Pies. No order placed here reaches the restaurant and no payment is ever processed.',
        }),
      ]),
    ]),

    el('section', { class: 'section' }, [
      el('div', { class: 'section__head' }, [
        el('h2', { text: 'Credit where it is due' }),
        el('p', { class: 'section__lede', text: 'Everything in this program that came from somewhere else.' }),
      ]),
      el('div', { class: 'table-wrap' }, [
        el('table', { class: 'table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', { scope: 'col', text: 'What' }),
              el('th', { scope: 'col', text: 'Where from' }),
              el('th', { scope: 'col', text: 'Notes' }),
            ]),
          ]),
          el('tbody', {}, ATTRIBUTION.map((entry) =>
            el('tr', {}, [
              el('th', { scope: 'row', text: entry.what }),
              el('td', { text: entry.source }),
              el('td', { class: 'table__prose', text: entry.detail }),
            ])
          )),
        ]),
      ]),
    ]),

    el('section', { class: 'section' }, [
      el('div', { class: 'section__head' }, [
        el('h2', { text: 'Libraries used: none' }),
        el('p', {
          class: 'section__lede',
          text: 'The competition provides no electricity and warns that venue wifi may not work, so anything fetched from a content delivery network is a risk with no upside. These were written instead.',
        }),
      ]),
      el('div', { class: 'table-wrap' }, [
        el('table', { class: 'table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', { scope: 'col', text: 'Usually a library' }),
              el('th', { scope: 'col', text: 'What this uses instead' }),
            ]),
          ]),
          el('tbody', {}, INSTEAD_OF_LIBRARIES.map((entry) =>
            el('tr', {}, [
              el('th', { scope: 'row', text: entry.usually }),
              el('td', {}, [el('code', { class: 'code', text: entry.instead })]),
            ])
          )),
        ]),
      ]),
    ]),
  ]);
}
