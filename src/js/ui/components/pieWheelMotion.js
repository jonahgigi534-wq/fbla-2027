/**
 * Turns the pie wheel and keeps track of where it is while it moves.
 *
 * The turning itself is a CSS transition on one transform, which the browser runs off
 * the main thread, so the wheel stays smooth even while the page is busy. While it
 * moves, a frame loop reads back the angle actually on screen so the name above the
 * pointer can change as each slice passes under it.
 */

import { rotationFromMatrix, sliceAtTop, unwrapNear } from '../../domain/pieWheel.js';

/**
 * Whether the visitor has asked their computer for less motion.
 *
 * @returns {boolean} True when movement should be skipped.
 */
function prefersStill() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * The angle the element is drawn at this instant, partway through any transition.
 *
 * @param {HTMLElement} disc The element that turns.
 * @returns {number} Degrees, between -180 and 180.
 */
function angleOnScreen(disc) {
  const matrix = window.getComputedStyle(disc).transform;
  if (!matrix || matrix === 'none') {
    return 0;
  }
  const [a, b] = matrix
    .slice(matrix.indexOf('(') + 1, -1)
    .split(',')
    .map(Number);
  return rotationFromMatrix(a, b);
}

/**
 * Sets up the motion for one wheel.
 *
 * @param {HTMLElement} disc The element that turns.
 * @param {number} count How many slices the wheel has.
 * @param {{onPass: Function, onSettle: Function}} listeners onPass gets the slice now
 *   under the pointer each time it changes; onSettle gets the slice it came to rest on.
 * @returns {{rotation: number, hold: Function, follow: Function, turnTo: Function}}
 *   rotation is where the wheel is heading. hold stops it where it is and returns that
 *   rotation, follow moves it with no easing, and turnTo eases it to a new rotation.
 */
export function createMotion(disc, count, listeners) {
  let rotation = 0;
  let underPointer = 0;
  let isMoving = false;
  let settleTimer = null;
  let frame = null;

  const place = (next, ms = 0, easing = 'linear') => {
    rotation = next;
    disc.style.transition = ms > 0 ? `transform ${ms}ms ${easing}` : 'none';
    disc.style.transform = `rotate(${next}deg)`;
  };

  const watch = () => {
    const index = sliceAtTop(angleOnScreen(disc), count);
    if (index !== underPointer) {
      underPointer = index;
      listeners.onPass(index);
    }
    frame = isMoving && disc.isConnected ? window.requestAnimationFrame(watch) : null;
  };

  const startMoving = () => {
    window.clearTimeout(settleTimer);
    isMoving = true;
    if (frame === null) {
      frame = window.requestAnimationFrame(watch);
    }
  };

  const settle = () => {
    isMoving = false;
    underPointer = sliceAtTop(rotation, count);
    listeners.onSettle(underPointer);
  };

  return {
    get rotation() {
      return rotation;
    },
    hold() {
      startMoving();
      place(unwrapNear(angleOnScreen(disc), rotation));
      return rotation;
    },
    follow(next) {
      place(next);
    },
    turnTo(next, ms, easing) {
      startMoving();
      place(next, ms, easing);
      settleTimer = window.setTimeout(settle, prefersStill() ? 0 : ms);
    },
  };
}
