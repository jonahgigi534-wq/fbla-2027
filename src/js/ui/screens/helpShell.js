/**
 * The chrome every help screen sits inside: the section tabs and the page heading.
 *
 * The help center is five screens, not one, and all five wear the same heading and
 * the same row of tabs. Keeping that here means a sixth screen inherits it by asking
 * for it, and none of the five can drift out of step with the others.
 *
 * Used by ui/screens/help.js and ui/screens/helpPages.js.
 */

import { el } from '../dom.js';

/** The sections of the help center, in order. */
const SECTIONS = [
  { id: 'articles', path: '/help', label: 'Guides' },
  { id: 'topic', path: '/help/topic', label: 'How this meets the topic' },
  { id: 'concepts', path: '/help/concepts', label: 'Programming concepts' },
  { id: 'validation', path: '/help/validation', label: 'Validation rules' },
  { id: 'about', path: '/help/about', label: 'About this project' },
];

/**
 * Builds the section tabs.
 *
 * @param {string} activeId Which section is showing.
 * @returns {HTMLElement} The tabs.
 */
export function sectionTabs(activeId) {
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
export function head(lede) {
  return el('div', { class: 'page-head' }, [
    el('h1', { text: 'Help center' }),
    el('p', { class: 'page-head__lede', text: lede }),
  ]);
}
