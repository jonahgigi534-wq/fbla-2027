/**
 * The pie slideshow at the top of the home screen.
 *
 * One photo shows at a time and fades into the next every few seconds. It stops while
 * the pointer or keyboard focus is on it, has a pause button for anyone who wants it
 * still, and does not start on its own for someone who has asked their computer for
 * less motion. Moving content that cannot be stopped fails WCAG 2.2.2.
 */

import { el } from '../dom.js';
import { formatUSD } from '../../domain/money.js';
import { stepIndex } from '../../domain/pieWheel.js';

/** How long each pie stays up before the next one fades in. */
const SLIDE_MS = 4500;

/**
 * Builds one slide: the photo and its caption.
 *
 * @param {object} pie A catalog item with a photo.
 * @param {Function} onOpen Called with the pie when its caption button is pressed.
 * @returns {HTMLElement} The slide.
 */
function slide(pie, onOpen) {
  return el('div', { class: 'slideshow__slide', 'aria-hidden': 'true' }, [
    el('img', { src: pie.photo.src, alt: pie.name }),
    el('div', { class: 'slideshow__caption' }, [
      el('span', { class: 'slideshow__name', text: pie.name }),
      el('span', { class: 'slideshow__price', text: formatUSD(pie.priceCents) }),
      el(
        'button',
        {
          class: 'button button--small',
          type: 'button',
          tabindex: '-1',
          onClick: () => onOpen(pie),
        },
        'See this pie'
      ),
    ]),
  ]);
}

/**
 * Builds one of the small round buttons that jump to a slide.
 *
 * @param {object} pie The pie the dot stands for.
 * @param {number} index Its place in the slideshow.
 * @param {Function} onPick Called with the index.
 * @returns {HTMLElement} The button.
 */
function dot(pie, index, onPick) {
  return el('button', {
    class: 'slideshow__dot',
    type: 'button',
    'aria-label': `Show ${pie.name}`,
    onClick: () => onPick(index),
  });
}

/**
 * Builds a previous or next arrow.
 *
 * @param {string} label What it does, for screen readers.
 * @param {string} symbol The arrow drawn on it.
 * @param {Function} onClick What pressing it does.
 * @returns {HTMLElement} The button.
 */
function arrow(label, symbol, onClick) {
  return el('button', { class: 'carousel-button', type: 'button', 'aria-label': label, onClick }, [
    el('span', { 'aria-hidden': 'true', text: symbol }),
  ]);
}

/**
 * Builds the slideshow.
 *
 * @param {object[]} pies Catalog items to show, each with a photo.
 * @param {Function} onOpen Called with a pie when the customer asks to see it.
 * @returns {HTMLElement} The slideshow.
 */
export function pieSlideshow(pies, onOpen) {
  const prefersStill = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;
  let isPausedByUser = Boolean(prefersStill);
  let isHeld = false;

  const slides = pies.map((pie) => slide(pie, onOpen));
  const dots = pies.map((pie, position) => dot(pie, position, (chosen) => show(chosen)));
  const status = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const pauseButton = el('button', {
    class: 'slideshow__pause button button--quiet button--small',
    type: 'button',
    onClick: () => {
      isPausedByUser = !isPausedByUser;
      refreshTimer();
    },
  });

  /**
   * Shows one slide and brings the dots, captions, and announcement in line.
   *
   * @param {number} next The slide to show.
   * @param {boolean} [isAutomatic] True when the timer moved it, which is not announced.
   * @returns {void}
   */
  function show(next, isAutomatic = false) {
    index = stepIndex(next, 0, pies.length);
    slides.forEach((node, position) => {
      const isActive = position === index;
      node.classList.toggle('slideshow__slide--active', isActive);
      node.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      // Only the showing slide's button can be reached with Tab.
      node.querySelector('button').tabIndex = isActive ? 0 : -1;
    });
    dots.forEach((node, position) => {
      node.setAttribute('aria-current', position === index ? 'true' : 'false');
    });
    if (!isAutomatic) {
      status.textContent = `${pies[index].name}, ${index + 1} of ${pies.length}`;
    }
  }

  /**
   * Starts or stops the timer to match the pause button, hover, focus, and whether the
   * slideshow is still on the page.
   *
   * @returns {void}
   */
  function refreshTimer() {
    window.clearInterval(timer);
    timer = null;
    pauseButton.textContent = isPausedByUser ? 'Play slideshow' : 'Pause slideshow';
    if (isPausedByUser || isHeld) {
      return;
    }
    timer = window.setInterval(() => {
      // The home screen was replaced, so this slideshow is gone and should stop.
      if (!root.isConnected) {
        window.clearInterval(timer);
        return;
      }
      show(index + 1, true);
    }, SLIDE_MS);
  }

  const hold = (isHolding) => {
    isHeld = isHolding;
    refreshTimer();
  };

  const root = el(
    'section',
    {
      class: 'slideshow',
      'aria-roledescription': 'carousel',
      'aria-label': 'Pies from the bakery',
      onMouseenter: () => hold(true),
      onMouseleave: () => hold(false),
      onFocusin: () => hold(true),
      onFocusout: () => hold(false),
    },
    [
      el('div', { class: 'slideshow__frame' }, slides),
      el('div', { class: 'slideshow__controls' }, [
        arrow('Previous pie', '‹', () => show(index - 1)),
        el('div', { class: 'slideshow__dots' }, dots),
        arrow('Next pie', '›', () => show(index + 1)),
        pauseButton,
      ]),
      status,
    ]
  );

  show(0, true);
  refreshTimer();
  return root;
}
