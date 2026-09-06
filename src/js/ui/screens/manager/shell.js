/**
 * The manager side: a simple gate, and the tabs behind it.
 *
 * The PIN is printed on the screen that asks for it. That looks odd until you
 * remember what this is: a demonstration where anyone, including a judge who wanders
 * into it, has to be able to get through. A hidden PIN would turn the whole manager
 * side into a dead end for the person being shown the program.
 *
 * It is not security and does not pretend to be. It keeps the customer side and the
 * staff side apart so neither screen has to carry both jobs, and the gate says so.
 * Real access control belongs on a server, which a program with no server does not
 * have. That is an honest answer, and a better one than a PIN hidden in a file.
 */

import { el, banner, render } from '../../dom.js';
import { getState, resetToDefaults, update } from '../../../app/store.js';
import { navigate } from '../../../app/router.js';

/** The demo PIN, shown on the gate so nobody is locked out of the demonstration. */
export const DEMO_PIN = '1967';

/** Wrong attempts before the gate pauses, so it behaves like a real one would. */
const MAX_ATTEMPTS = 5;

/** Attempts so far this session. Not saved, because a reload should clear it. */
let failedAttempts = 0;

/** The tabs across the top of the manager area. */
const TABS = [
  { path: '/manager/queue', label: 'Order queue' },
  { path: '/manager/inventory', label: 'Inventory' },
  { path: '/manager/reports', label: 'Reports' },
];

/**
 * Draws the PIN gate.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {string} returnPath Where to go once the PIN is accepted.
 * @returns {void}
 */
function renderGate(container, returnPath) {
  const pinField = el('input', {
    class: 'field__control',
    id: 'manager-pin',
    type: 'text',
    inputmode: 'numeric',
    maxlength: '4',
    autocomplete: 'off',
  });
  const error = el('span', { class: 'field__error', role: 'alert' });

  /**
   * Checks the entered PIN.
   *
   * @returns {void}
   */
  function submit() {
    if (failedAttempts >= MAX_ATTEMPTS) {
      error.textContent = 'Too many attempts. Reload the page to try again.';
      return;
    }
    if (pinField.value.trim() !== DEMO_PIN) {
      failedAttempts += 1;
      const left = MAX_ATTEMPTS - failedAttempts;
      error.textContent = `That is not the PIN. ${left} attempt${left === 1 ? '' : 's'} left. It is printed above.`;
      return;
    }
    failedAttempts = 0;
    update(() => ({ isManagerUnlocked: true }));
    navigate(returnPath);
  }

  render(container, [
    el('div', { class: 'page-head' }, [
      el('h1', { text: 'Staff area' }),
      el('p', {
        class: 'page-head__lede',
        text: 'The order queue, stock levels, and sales reports.',
      }),
    ]),
    el('div', { class: 'gate' }, [
      banner(
        'info',
        `Demo PIN is ${DEMO_PIN}`,
        'Printed here on purpose. This is a demonstration, and a hidden PIN would just lock you out of it. Real access control needs a server, which this program does not have.'
      ),
      el('label', { class: 'field', for: 'manager-pin' }, [
        el('span', { class: 'field__label', text: 'Enter the four digit PIN' }),
        pinField,
        error,
      ]),
      el(
        'button',
        { class: 'button button--block', type: 'button', onClick: submit },
        'Unlock the staff area'
      ),
      el(
        'button',
        {
          class: 'button button--quiet button--block',
          type: 'button',
          onClick: () => navigate('/menu'),
        },
        'Back to the menu'
      ),
    ]),
  ]);
  pinField.focus();
}

/**
 * Draws the manager tab strip.
 *
 * @param {string} activePath The route currently being shown.
 * @returns {HTMLElement} The tabs.
 */
export function managerTabs(activePath) {
  return el('nav', { class: 'manager-tabs', 'aria-label': 'Staff area' }, [
    ...TABS.map((tab) =>
      el('a', {
        class: 'chip',
        href: `#${tab.path}`,
        text: tab.label,
        'aria-current': activePath === tab.path ? 'page' : null,
      })
    ),
    el(
      'button',
      {
        class: 'button button--quiet button--small',
        type: 'button',
        onClick: () => {
          update(() => ({ isManagerUnlocked: false }));
          navigate('/menu');
        },
      },
      'Lock and exit'
    ),
    // Between judging rounds the program has to look the way it did at the start of
    // the previous one. Clicking through a cart to empty it by hand is not something
    // to do on the clock.
    el(
      'button',
      {
        class: 'button button--quiet button--small',
        type: 'button',
        onClick: () => {
          const confirmed = window.confirm(
            'Reset everything to a fresh install? This clears the cart, every order you placed, and any stock you changed. The ninety days of sample history are rebuilt.'
          );
          if (confirmed) {
            resetToDefaults();
            navigate('/home');
          }
        },
      },
      'Reset demo data'
    ),
  ]);
}

/**
 * Runs a manager screen, showing the gate first when the area is still locked.
 *
 * Every manager screen goes through here, so none of them can forget the check.
 *
 * @param {HTMLElement} container The main element to render into.
 * @param {string} path The route being shown, used by the tabs.
 * @param {Function} draw Called with the container once the area is unlocked.
 * @returns {void}
 */
export function withManagerAccess(container, path, draw) {
  if (!getState().isManagerUnlocked) {
    renderGate(container, path);
    return;
  }
  draw(container);
}
