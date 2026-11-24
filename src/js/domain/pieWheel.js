/**
 * The arithmetic behind the pie wheel on the home screen.
 *
 * Slices are numbered clockwise from the top, and the wheel turns clockwise as its
 * rotation grows. Slice i sits under the pointer when the rotation, taken round one
 * full turn, equals minus i slices.
 *
 * Used by ui/components/pieWheel.js.
 */

/** Degrees in one full turn of the wheel. */
export const FULL_TURN = 360;

/**
 * Wraps a number into the range 0 up to, but not including, the modulus.
 *
 * JavaScript's % keeps the sign of the left side, so -1 % 8 is -1 rather than 7.
 *
 * @param {number} value Any number.
 * @param {number} modulus A positive number.
 * @returns {number} The value wrapped into range.
 */
function wrap(value, modulus) {
  // Adding 0 turns a -0 into 0, so a test comparing to 0 does not trip on it.
  return (((value % modulus) + modulus) % modulus) + 0;
}

/**
 * How wide each slice is.
 *
 * @param {number} count How many slices the wheel has.
 * @returns {number} Degrees per slice.
 */
export function sliceAngle(count) {
  return FULL_TURN / count;
}

/**
 * Which slice is under the pointer at a given rotation.
 *
 * @param {number} rotation The wheel's rotation in degrees, any size or sign.
 * @param {number} count How many slices the wheel has.
 * @returns {number} The slice index, counting from zero.
 */
export function sliceAtTop(rotation, count) {
  return wrap(Math.round(-rotation / sliceAngle(count)), count);
}

/**
 * The rotation that brings a slice under the pointer, always turning forward.
 *
 * Rotations only ever grow, so the wheel never jumps backwards between spins, and the
 * extra turns are what make it look spun rather than nudged.
 *
 * @param {number} index The slice to land on.
 * @param {number} count How many slices the wheel has.
 * @param {number} current The rotation the wheel is at now.
 * @param {number} [extraTurns] Whole turns to add before landing.
 * @returns {number} The new rotation in degrees, never less than the current one.
 */
export function rotationToShow(index, count, current, extraTurns = 0) {
  const start = current + extraTurns * FULL_TURN;
  const wanted = wrap(-index * sliceAngle(count), FULL_TURN);
  return start + wrap(wanted - wrap(start, FULL_TURN), FULL_TURN);
}

/**
 * Picks a slice at random, never the one already showing.
 *
 * Landing on the same pie twice in a row looks like the button did nothing.
 *
 * @param {number} count How many slices the wheel has.
 * @param {number} current The slice showing now.
 * @param {Function} random Returns a number from 0 up to 1, like Math.random.
 * @returns {number} The chosen slice index.
 */
export function pickSlice(count, current, random) {
  if (count < 2) {
    return 0;
  }
  const choice = Math.floor(random() * (count - 1));
  return choice >= current ? choice + 1 : choice;
}
