/**
 * The screen shown when an address matches no route.
 *
 * Every bad address lands here with a way back.
 */

import { el, emptyState, render } from '../dom.js';
import { navigate } from '../../app/router.js';

/**
 * Renders the not found screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {object} params Route parameters.
 * @param {string} [params.path] The address that did not match, shown to the customer.
 * @returns {void}
 */
export function renderNotFound(container, params = {}) {
  render(container, [
    emptyState({
      icon: '\u{1F967}',
      title: 'That page does not exist',
      body: params.path
        ? `Nothing lives at ${params.path}. The menu and your orders are both still here.`
        : 'The menu and your orders are both still here.',
      action: { label: 'Go to the menu', onClick: () => navigate('/menu') },
    }),
    el('div', { class: 'row row--centred' }, [
      el(
        'button',
        { class: 'button button--secondary', type: 'button', onClick: () => navigate('/home') },
        'Back to home'
      ),
      el(
        'button',
        { class: 'button button--secondary', type: 'button', onClick: () => navigate('/help') },
        'Open the help center'
      ),
    ]),
  ]);
}
