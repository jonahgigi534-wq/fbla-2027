/**
 * The pie wheel on the home screen, for anyone who cannot choose.
 *
 * A wheel far wider than the screen, so only the top of it shows, with one pie in
 * each slice. The slice under the pointer is the one chosen: its name sits in the tag
 * above the pointer and its description in a card inside the slice. Arrows turn it
 * one slice at a time, a drag turns it by hand, and Spin picks one at random.
 *
 * The wheel itself is a drawing and hidden from screen readers. The name, the card,
 * and the buttons are ordinary page content, and each new pie is announced.
 *
 * The arithmetic is in domain/pieWheel.js, the drawing in pieWheelDrawing.js, the
 * turning in pieWheelMotion.js, and the dragging in pieWheelDrag.js.
 */

import { el } from '../dom.js';
import { formatUSD } from '../../domain/money.js';
import { flickRotation, pickSlice, rotationToShow, sliceAngle } from '../../domain/pieWheel.js';
import { drawWheel } from './pieWheelDrawing.js';
import { createMotion } from './pieWheelMotion.js';
import { attachDrag } from './pieWheelDrag.js';

/** A spin: a slow start, a long glide, and a few whole turns on the way. */
const SPIN = { ms: 4600, easing: 'cubic-bezier(0.3, 0, 0.1, 1)', turns: 3 };

/** One slice along, from an arrow. */
const STEP = { ms: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

/** Coming to rest after a drag: longer the further it has to go. */
const SETTLE = {
  msPerDegree: 9,
  minMs: 380,
  maxMs: 1500,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

/** How far the pointer flicks as each slice goes past it. */
const POINTER_TICK = [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(-16deg)', offset: 0.35 },
  { transform: 'rotate(0deg)' },
];

/**
 * A pie's name without the trailing "Slice", which every one of them has.
 *
 * @param {object} pie A catalog item.
 * @returns {string} The name to show.
 */
function pieName(pie) {
  return pie.name.replace(/\s+Slice$/, '');
}

/**
 * Builds every part of the section that is not the drawing.
 *
 * @param {HTMLElement} disc The turning wheel.
 * @param {number} count How many slices the wheel has.
 * @returns {object} The section and the parts that change.
 */
function buildView(disc, count) {
  const name = el('p', { class: 'pie-wheel__name' });
  const pointer = el('span', { class: 'pie-wheel__pointer', 'aria-hidden': 'true' });
  const description = el('p', { class: 'pie-wheel__description' });
  const price = el('span', { class: 'pie-wheel__price' });
  const orderButton = el(
    'button',
    { class: 'button button--small', type: 'button' },
    'Order this pie'
  );
  const previous = el('button', {
    class: 'pie-wheel__arrow pie-wheel__arrow--previous',
    type: 'button',
    'aria-label': 'Previous pie',
  });
  const next = el('button', {
    class: 'pie-wheel__arrow pie-wheel__arrow--next',
    type: 'button',
    'aria-label': 'Next pie',
  });
  const spinButton = el('button', { class: 'button', type: 'button' }, 'Spin the wheel');
  const announcement = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const card = el('div', { class: 'pie-wheel__card' }, [
    description,
    el('div', { class: 'pie-wheel__buy' }, [price, orderButton]),
  ]);
  const stage = el('div', { class: 'pie-wheel__stage' }, [
    el('div', { class: 'pie-wheel__viewport' }, [
      disc,
      el('div', { class: 'pie-wheel__spotlight', 'aria-hidden': 'true' }),
    ]),
    el('div', { class: 'pie-wheel__flag' }, [name, pointer]),
    card,
    previous,
    next,
  ]);
  stage.style.setProperty('--pie-wheel-slice', `${sliceAngle(count)}deg`);
  const root = el('section', { class: 'section pie-wheel', 'aria-labelledby': 'pie-wheel-title' }, [
    el('div', { class: 'section__head' }, [
      el('h2', { id: 'pie-wheel-title', text: 'Cannot pick a pie?' }),
      el('p', { class: 'section__lede', text: 'Turn the wheel, or let it spin for you.' }),
    ]),
    stage,
    el('div', { class: 'pie-wheel__controls' }, [spinButton]),
    announcement,
  ]);
  return {
    root,
    stage,
    name,
    pointer,
    description,
    price,
    orderButton,
    previous,
    next,
    spinButton,
    announcement,
  };
}

/**
 * Builds the pie wheel section.
 *
 * @param {object[]} pies One catalog item per slice, each with a photo.
 * @param {Function} onOrder Called with the pie under the pointer.
 * @returns {HTMLElement} The section.
 */
export function pieWheel(pies, onOrder) {
  const count = pies.length;
  const disc = drawWheel(pies);
  const view = buildView(disc, count);
  const isStill = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  let chosen = 0;
  let isSpinning = false;

  const showPie = (index) => {
    const pie = pies[index];
    view.name.textContent = pieName(pie);
    view.description.textContent = pie.description;
    view.price.textContent = `${formatUSD(pie.priceCents)} a slice`;
  };

  const setMoving = (isMoving) => {
    view.root.classList.toggle('pie-wheel--moving', isMoving);
    // aria-disabled rather than disabled, so a keyboard user's focus stays on Spin.
    for (const button of [view.previous, view.next, view.spinButton]) {
      button.setAttribute('aria-disabled', String(isMoving && isSpinning));
    }
  };

  const motion = createMotion(disc, count, {
    onPass: (index) => {
      view.name.textContent = pieName(pies[index]);
      if (!isStill()) {
        view.pointer.animate?.(POINTER_TICK, { duration: 220, easing: 'ease-out' });
      }
    },
    onSettle: (index) => {
      isSpinning = false;
      chosen = index;
      showPie(index);
      setMoving(false);
      const pie = pies[index];
      view.announcement.textContent = `${pieName(pie)}, ${formatUSD(pie.priceCents)} a slice.`;
    },
  });

  const turnBy = (slices) => {
    if (isSpinning) {
      return;
    }
    setMoving(true);
    motion.turnTo(motion.rotation - slices * sliceAngle(count), STEP.ms, STEP.easing);
  };

  view.previous.addEventListener('click', () => turnBy(-1));
  view.next.addEventListener('click', () => turnBy(1));
  view.orderButton.addEventListener('click', () => onOrder(pies[chosen]));
  view.spinButton.addEventListener('click', () => {
    if (isSpinning) {
      return;
    }
    isSpinning = true;
    setMoving(true);
    const target = pickSlice(count, chosen, Math.random);
    motion.turnTo(rotationToShow(target, count, motion.rotation, SPIN.turns), SPIN.ms, SPIN.easing);
  });

  let dragStart = 0;
  let degreesPerPixel = 0;
  attachDrag(view.stage, {
    canStart: (event) => !isSpinning && !event.target.closest('button, .pie-wheel__card'),
    onStart: () => {
      setMoving(true);
      dragStart = motion.hold();
      // A pixel of drag moves the rim a pixel, so the wheel stays under the finger.
      degreesPerPixel = 180 / (Math.PI * (disc.offsetWidth / 2));
    },
    onMove: (pixels) => motion.follow(dragStart + pixels * degreesPerPixel),
    onEnd: (pixelsPerMs) => {
      const target = flickRotation(motion.rotation, pixelsPerMs * degreesPerPixel, count);
      const distance = Math.abs(target - motion.rotation) * SETTLE.msPerDegree;
      const ms = Math.min(SETTLE.maxMs, Math.max(SETTLE.minMs, distance));
      motion.turnTo(target, ms, SETTLE.easing);
    },
  });

  showPie(0);
  return view.root;
}
