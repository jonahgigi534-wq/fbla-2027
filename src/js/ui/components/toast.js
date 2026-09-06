/**
 * The short message that appears after an action.
 *
 * Adding something to a cart on another screen is invisible otherwise: the customer
 * presses a button and nothing they can see changes. The toast is the confirmation,
 * and for a refusal it is where the reason goes.
 *
 * Messages are announced to screen readers through a live region, so someone not
 * looking at the corner of the screen still hears that the item went in.
 */

import { el } from '../dom.js';

/** How long a confirmation stays before fading, in milliseconds. */
const VISIBLE_MS = 3600;

/** Errors stay longer, because the customer has to read and act on them. */
const ERROR_VISIBLE_MS = 9000;

/** The live region, created once and reused. */
let host = null;

/**
 * Creates the toast container on first use.
 *
 * @returns {HTMLElement} The live region every message is appended to.
 */
function ensureHost() {
  if (host === null) {
    host = el('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.append(host);
  }
  return host;
}

/**
 * Shows a message.
 *
 * @param {string} message The text to show.
 * @param {string} [tone] 'success' or 'error'. An error stays until dismissed.
 * @returns {void}
 */
export function showToast(message, tone = 'success') {
  const container = ensureHost();
  const isError = tone === 'error';

  const node = el('div', { class: `toast toast--${tone}` }, [
    el('span', { class: 'toast__text', text: message }),
    el(
      'button',
      {
        class: 'toast__close',
        type: 'button',
        'aria-label': 'Dismiss message',
        onClick: () => node.remove(),
      },
      '×'
    ),
  ]);

  container.append(node);

  // An error stays long enough to read and act on. It still goes on its own,
  // because a message that never leaves is one the customer stops seeing.
  setTimeout(() => node.remove(), isError ? ERROR_VISIBLE_MS : VISIBLE_MS);
}

/**
 * Shows the result of an action, picking the tone from whether it worked.
 *
 * @param {{ok: boolean, message: string|null}} result A result from app/actions.js.
 * @returns {void}
 */
export function showResult(result) {
  if (result.message) {
    showToast(result.message, result.ok ? 'success' : 'error');
  }
}

/**
 * Clears every message on screen.
 *
 * Called on navigation. An error about a checkout field is meaningless once the
 * customer has moved to another screen, and leaving it there makes the program look
 * like it is still complaining about something that is no longer in front of them.
 *
 * @returns {void}
 */
export function clearToasts() {
  if (host !== null) {
    host.replaceChildren();
  }
}
