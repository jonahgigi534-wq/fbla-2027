/**
 * The guest review carousel that closes the home screen.
 *
 * Slides a whole page of cards at a time, the way the restaurant's own site does.
 * How many cards make a page is decided by the stylesheet rather than by this file:
 * brand.css sets --per-view at each breakpoint and this reads it back, so there is
 * one place that knows the layout and it is the place doing the layout.
 *
 * The arithmetic lives in domain/carousel.js where it can be tested without a browser.
 */

import { el } from '../dom.js';
import { TESTIMONIALS, TESTIMONIAL_SOURCE } from '../../data/testimonials.js';
import { clampPage, pageCount, slideOffset } from '../../domain/carousel.js';

/** Used when the stylesheet has not loaded and --per-view reads back empty. */
const DEFAULT_PER_VIEW = 3;

/** Drawn once per star rather than stored per review, since every review is five. */
const FILLED_STAR = '★';

/**
 * Reads how many cards currently fit, as the stylesheet sees it.
 *
 * @param {HTMLElement} track The flex track holding the cards.
 * @returns {number} Cards per page, at least one.
 */
function readPerView(track) {
  const raw = window.getComputedStyle(track).getPropertyValue('--per-view');
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed < 1 ? DEFAULT_PER_VIEW : parsed;
}

/**
 * Builds the star row for one review.
 *
 * The stars are one image to a screen reader rather than five stray characters, so
 * the rating is announced as a rating instead of as punctuation.
 *
 * @param {number} rating How many stars the guest left.
 * @returns {HTMLElement} The star row.
 */
function starRow(rating) {
  return el(
    'div',
    {
      class: 'testimonial__stars',
      role: 'img',
      'aria-label': `${rating} out of 5 stars`,
    },
    [el('span', { 'aria-hidden': 'true', text: FILLED_STAR.repeat(rating) })]
  );
}

/**
 * Builds one review card.
 *
 * @param {object} review An entry from data/testimonials.js.
 * @returns {HTMLElement} The list item holding the card.
 */
function testimonialCard(review) {
  return el('li', { class: 'testimonial' }, [
    el('article', { class: 'testimonial__card' }, [
      el('span', { class: 'testimonial__quote-mark', 'aria-hidden': 'true', text: '“' }),
      starRow(review.rating),
      el('p', { class: 'testimonial__text', text: review.quote }),
      el('div', { class: 'testimonial__foot' }, [
        el('span', {
          class: 'testimonial__avatar',
          'aria-hidden': 'true',
          text: review.name.slice(0, 1),
        }),
        el('span', { class: 'testimonial__name', text: review.name }),
      ]),
    ]),
  ]);
}

/**
 * Builds the review carousel.
 *
 * @returns {HTMLElement} The finished section, ready to append to a screen.
 */
export function testimonialsSection() {
  let page = 0;

  const track = el(
    'ul',
    { class: 'testimonials__track' },
    TESTIMONIALS.map((review) => testimonialCard(review))
  );

  const pageLabel = el('p', { class: 'testimonials__page', 'aria-live': 'polite' });
  const previousButton = el(
    'button',
    { class: 'carousel-button', type: 'button', 'aria-label': 'Previous reviews' },
    [el('span', { 'aria-hidden': 'true', text: '‹' })]
  );
  const nextButton = el(
    'button',
    { class: 'carousel-button', type: 'button', 'aria-label': 'Next reviews' },
    [el('span', { 'aria-hidden': 'true', text: '›' })]
  );

  /**
   * Moves the track to the current page and brings the controls in line with it.
   *
   * @returns {void}
   */
  function update() {
    const perView = readPerView(track);
    const total = TESTIMONIALS.length;
    page = clampPage(page, total, perView);
    const pages = pageCount(total, perView);
    const shift = (slideOffset(total, perView, page) * 100) / perView;
    track.style.transform = `translateX(-${shift}%)`;
    pageLabel.textContent = `${page + 1} / ${pages}`;
    previousButton.disabled = page === 0;
    nextButton.disabled = page >= pages - 1;
  }

  previousButton.addEventListener('click', () => {
    page -= 1;
    update();
  });
  nextButton.addEventListener('click', () => {
    page += 1;
    update();
  });

  const section = el('section', { class: 'testimonials', 'aria-label': 'Guest reviews' }, [
    el('h2', { class: 'testimonials__heading', text: 'What the sweet tooths are saying' }),
    el('div', { class: 'testimonials__viewport' }, [track]),
    el('div', { class: 'testimonials__controls' }, [previousButton, pageLabel, nextButton]),
    el('p', { class: 'testimonial__source', text: TESTIMONIAL_SOURCE }),
  ]);

  /*
   * A narrower window fits fewer cards, which changes both the page count and how far
   * the track should be sitting. The listener drops itself once the screen it belongs
   * to has been replaced, so navigating away does not leave it behind.
   */
  const onResize = () => {
    if (!section.isConnected) {
      window.removeEventListener('resize', onResize);
      return;
    }
    update();
  };
  window.addEventListener('resize', onResize);

  update();
  return section;
}
