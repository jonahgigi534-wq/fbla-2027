/**
 * The round button in the bottom right corner of every page that opens the Pie
 * Assistant, where most shops keep their chat.
 *
 * It shows a speech bubble while the chat is shut and a cross while it is open, so the
 * same spot always closes what it opened.
 */

import { el } from '../dom.js';

/** The SVG namespace, which createElement does not use. */
const SVG_NS = 'http://www.w3.org/2000/svg';

/** A speech bubble with three dots in it, on a 24 unit grid. */
const CHAT_PATHS = [
  'M5 4.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4.5 3.6c-.4.3-1 0-1-.5v-3.1H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z',
  'M8 11h.01M12 11h.01M16 11h.01',
];

/** Two crossed strokes. */
const CLOSE_PATHS = ['M6 6l12 12M18 6L6 18'];

/**
 * Draws one of the two icons.
 *
 * @param {string} modifier Which icon, used in its class name.
 * @param {string[]} paths The strokes that make it up.
 * @returns {SVGElement} The icon, hidden from screen readers.
 */
function drawIcon(modifier, paths) {
  const icon = document.createElementNS(SVG_NS, 'svg');
  icon.setAttribute('class', `assistant-launcher__icon assistant-launcher__icon--${modifier}`);
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  for (const data of paths) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', data);
    icon.append(path);
  }
  return icon;
}

/**
 * Builds the button.
 *
 * @param {string} panelId The id of the chat window it opens.
 * @param {Function} onToggle Called on every press.
 * @returns {HTMLButtonElement} The button, not yet on the page.
 */
export function createLauncher(panelId, onToggle) {
  const launcher = el(
    'button',
    {
      class: 'assistant-launcher',
      id: 'assistant-toggle',
      type: 'button',
      'aria-controls': panelId,
      onClick: onToggle,
    },
    [drawIcon('chat', CHAT_PATHS), drawIcon('close', CLOSE_PATHS)]
  );
  showLauncherOpen(launcher, false);
  return launcher;
}

/**
 * Switches the button between its two states.
 *
 * @param {HTMLButtonElement|null} launcher The button, or null before it exists.
 * @param {boolean} isOpen Whether the chat is now open.
 * @returns {void}
 */
export function showLauncherOpen(launcher, isOpen) {
  if (!launcher) {
    return;
  }
  const label = isOpen ? 'Close the Pie Assistant' : 'Open the Pie Assistant';
  launcher.setAttribute('aria-expanded', String(isOpen));
  launcher.setAttribute('aria-label', label);
  launcher.title = label;
}
