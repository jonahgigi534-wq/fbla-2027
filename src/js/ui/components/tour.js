/**
 * The five step tour a first time visitor gets.
 *
 * Someone meeting this program has no idea it holds a staff side, a spending report,
 * or an assistant that answers questions offline. The help center explains all of it,
 * but only to someone who already thought to open the help center. This points at the
 * five things once, in the order they matter, and then gets out of the way.
 *
 * Every step is anchored to something in the header rather than to content inside a
 * screen. The header is on every page, so no step can point at an element that is not
 * there, and the tour never has to navigate anywhere to keep working.
 *
 * It runs once. app/store.js carries hasSeenWelcome, which is set when the tour is
 * finished or skipped, so a judge who has already seen it is not shown it again on a
 * second run. The help center can start it again on demand.
 */

import { el } from '../dom.js';
import { getState, update } from '../../app/store.js';

/** How far below the highlighted control the bubble sits. */
const BUBBLE_GAP = 14;

/** Kept clear of the viewport edges so the bubble never hangs off screen. */
const EDGE_MARGIN = 12;

/** Roughly how wide the bubble is, used to keep it inside the viewport. */
const BUBBLE_WIDTH = 320;

/**
 * The steps, in order. Each target is a selector for something in the header.
 *
 * @type {Array<{target: string, title: string, body: string}>}
 */
const STEPS = [
  {
    target: 'a[href="#/locations"]',
    title: 'Pick a restaurant',
    body: 'Six of them, on three different schedules. Fuqua never closes and Katy runs around the clock on weekends. Whichever you choose sets your pickup times and your delivery area.',
  },
  {
    target: 'a[href="#/menu"]',
    title: 'Browse 426 items',
    body: 'Search by name or by ingredient, then filter by diet, price, or what is actually available. Sold out items stay on the menu rather than vanishing, so you are never left hunting.',
  },
  {
    target: '.app-nav__cart',
    title: 'Build your order',
    body: 'Set a spending cap and the cart warns you before you go over, then suggests which line to drop. Totals are worked out in whole cents, so they always add up.',
  },
  {
    target: '#assistant-toggle',
    title: 'Ask the Pie Assistant',
    body: 'Questions answered from this device with no internet at all. Try what is gluten free, anything under ten dollars, or where is my order.',
  },
  {
    target: 'a[href="#/manager"]',
    title: 'See the other side of the counter',
    body: 'Staff holds the order queue, stock levels, and sales reports you can filter, group, and export. The PIN is printed on the screen that asks for it.',
  },
];

/** The overlay while a tour is running, or null when none is. */
let overlay = null;

/**
 * Takes the tour off the screen and remembers that it has been seen.
 *
 * @returns {void}
 */
function closeTour() {
  if (overlay === null) {
    return;
  }
  overlay.remove();
  overlay = null;
  document.querySelector('#assistant-toggle')?.focus();
  if (!getState().hasSeenWelcome) {
    update(() => ({ hasSeenWelcome: true }));
  }
}

/**
 * Moves the spotlight and the bubble onto one step's target.
 *
 * The target is looked up fresh every time rather than held onto, because the header
 * is redrawn whenever the screen or the cart changes and the old node would be stale.
 *
 * @param {object} step The step being shown.
 * @param {HTMLElement} spotlight The ring drawn around the target.
 * @param {HTMLElement} bubble The card holding the text.
 * @returns {void}
 */
function positionStep(step, spotlight, bubble) {
  const target = document.querySelector(step.target);
  if (!target) {
    // Nothing to point at, so the bubble sits in the middle rather than off screen.
    spotlight.hidden = true;
    bubble.style.left = `${Math.max(EDGE_MARGIN, (window.innerWidth - BUBBLE_WIDTH) / 2)}px`;
    bubble.style.top = '80px';
    return;
  }

  const box = target.getBoundingClientRect();
  spotlight.hidden = false;
  spotlight.style.left = `${box.left - 6}px`;
  spotlight.style.top = `${box.top - 6}px`;
  spotlight.style.width = `${box.width + 12}px`;
  spotlight.style.height = `${box.height + 12}px`;

  const rightmost = Math.max(EDGE_MARGIN, window.innerWidth - BUBBLE_WIDTH - EDGE_MARGIN);
  bubble.style.left = `${Math.min(Math.max(EDGE_MARGIN, box.left - 40), rightmost)}px`;
  bubble.style.top = `${box.bottom + BUBBLE_GAP}px`;
}

/**
 * Builds the bubble and the controls that move through the steps.
 *
 * @param {object} parts Where the text and buttons are written.
 * @param {HTMLElement} parts.counter Shows which step this is.
 * @param {HTMLElement} parts.title The step heading.
 * @param {HTMLElement} parts.body The step text.
 * @param {HTMLElement} parts.backButton Goes to the previous step.
 * @param {HTMLElement} parts.nextButton Goes on, or finishes.
 * @returns {HTMLElement} The bubble.
 */
function buildBubble({ counter, title, body, backButton, nextButton }) {
  return el(
    'div',
    { class: 'tour__bubble', role: 'dialog', 'aria-label': 'Quick tour', 'aria-live': 'polite' },
    [
      counter,
      title,
      body,
      el('div', { class: 'tour__actions' }, [
        el(
          'button',
          { class: 'button button--quiet button--small', type: 'button', onClick: closeTour },
          'Skip'
        ),
        el('div', { class: 'tour__actions-right' }, [backButton, nextButton]),
      ]),
    ]
  );
}

/**
 * Starts the tour at the first step.
 *
 * Safe to call while one is already running: the old overlay is taken down first, so
 * pressing the help center button twice restarts rather than stacking overlays.
 *
 * @returns {void}
 */
export function startTour() {
  if (overlay !== null) {
    overlay.remove();
    overlay = null;
  }

  let index = 0;
  const spotlight = el('div', { class: 'tour__spotlight' });
  const counter = el('p', { class: 'tour__counter' });
  const title = el('h2', { class: 'tour__title' });
  const body = el('p', { class: 'tour__body' });
  const backButton = el(
    'button',
    { class: 'button button--secondary button--small', type: 'button' },
    'Back'
  );
  const nextButton = el('button', { class: 'button button--small', type: 'button' }, 'Next');
  const bubble = buildBubble({ counter, title, body, backButton, nextButton });

  /**
   * Draws whichever step is current.
   *
   * @returns {void}
   */
  function show() {
    const step = STEPS[index];
    counter.textContent = `Step ${index + 1} of ${STEPS.length}`;
    title.textContent = step.title;
    body.textContent = step.body;
    backButton.disabled = index === 0;
    nextButton.textContent = index === STEPS.length - 1 ? 'Done' : 'Next';
    positionStep(step, spotlight, bubble);
    nextButton.focus();
  }

  backButton.addEventListener('click', () => {
    index -= 1;
    show();
  });
  nextButton.addEventListener('click', () => {
    if (index === STEPS.length - 1) {
      closeTour();
      return;
    }
    index += 1;
    show();
  });

  overlay = el('div', { class: 'tour' }, [
    el('div', { class: 'tour__backdrop', onClick: closeTour }),
    spotlight,
    bubble,
  ]);
  document.body.append(overlay);

  /*
   * The spotlight is drawn in viewport coordinates, so anything that moves the header
   * under it has to move it too. Both listeners drop themselves once the tour is gone.
   */
  const reposition = () => {
    if (overlay === null) {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition);
      return;
    }
    positionStep(STEPS[index], spotlight, bubble);
  };
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition);

  document.addEventListener('keydown', function onKey(event) {
    if (overlay === null) {
      document.removeEventListener('keydown', onKey);
      return;
    }
    if (event.key === 'Escape') {
      closeTour();
    }
  });

  show();
}

/**
 * Starts the tour, but only for someone who has not already been shown it.
 *
 * @returns {void}
 */
export function maybeStartTour() {
  if (!getState().hasSeenWelcome) {
    startTour();
  }
}
