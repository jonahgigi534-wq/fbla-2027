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

/**
 * The nearest rotation that leaves a slice exactly under the pointer.
 *
 * @param {number} rotation Any rotation in degrees.
 * @param {number} count How many slices the wheel has.
 * @returns {number} The rotation, snapped to the middle of a slice.
 */
export function snapRotation(rotation, count) {
  const step = sliceAngle(count);
  return Math.round(rotation / step) * step + 0;
}

/**
 * Puts an angle on the same lap as a reference, so 10 degrees near a rotation of 725
 * reads as 730 rather than jumping two turns back.
 *
 * @param {number} angle An angle in degrees, often only known up to a full turn.
 * @param {number} reference The rotation it should land close to.
 * @returns {number} The angle plus however many whole turns brings it nearest.
 */
export function unwrapNear(angle, reference) {
  const half = FULL_TURN / 2;
  return reference + wrap(angle - reference + half, FULL_TURN) - half;
}

/**
 * Reads the turn out of the first two numbers of a CSS rotation matrix.
 *
 * @param {number} a The matrix's a value, the cosine of the angle.
 * @param {number} b The matrix's b value, the sine of the angle.
 * @returns {number} The angle in degrees, between -180 and 180.
 */
export function rotationFromMatrix(a, b) {
  return (Math.atan2(b, a) * FULL_TURN) / (2 * Math.PI);
}

/** How long a flicked wheel keeps coasting, used to judge how far it travels. */
const COAST_MS = 320;

/** The furthest a single flick can carry the wheel, so a wild swipe stays calm. */
const MAX_FLICK = FULL_TURN;

/**
 * Where a wheel let go of mid flick comes to rest.
 *
 * @param {number} rotation The rotation at the moment it was let go.
 * @param {number} velocity How fast it was turning, in degrees per millisecond.
 * @param {number} count How many slices the wheel has.
 * @returns {number} The rotation it settles on, snapped to a slice.
 */
export function flickRotation(rotation, velocity, count) {
  const travel = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, velocity * COAST_MS));
  return snapRotation(rotation + travel, count);
}
