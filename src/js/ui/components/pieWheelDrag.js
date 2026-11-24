/**
 * Lets a mouse or a finger turn the pie wheel by dragging sideways.
 *
 * A press only becomes a drag once it has moved a few pixels, so a tap on the page
 * still works as a tap. The stage allows vertical panning, so a finger moving up or
 * down still scrolls the page, and the browser cancels the drag when it does.
 */

/** How far a press must move before it counts as a drag. */
const DRAG_START_PX = 6;

/** How much recent movement the release speed is judged on. */
const VELOCITY_WINDOW_MS = 90;

/**
 * How fast the pointer was moving when it was let go.
 *
 * @param {Array<{time: number, x: number}>} samples Recent positions, oldest first.
 * @param {number} now The time of the release.
 * @returns {number} Pixels per millisecond, positive to the right.
 */
function releaseSpeed(samples, now) {
  const recent = samples.filter((sample) => now - sample.time <= VELOCITY_WINDOW_MS);
  if (recent.length < 2) {
    return 0;
  }
  const first = recent[0];
  const last = recent[recent.length - 1];
  const elapsed = last.time - first.time;
  return elapsed > 0 ? (last.x - first.x) / elapsed : 0;
}

/**
 * Watches a surface for sideways drags.
 *
 * @param {HTMLElement} surface The element to drag on.
 * @param {object} handlers What to do at each stage.
 * @param {Function} handlers.canStart Given the pointerdown event, says whether a drag
 *   may begin there.
 * @param {Function} handlers.onStart Called once the press has become a drag.
 * @param {Function} handlers.onMove Called with how far, in pixels, it has moved.
 * @param {Function} handlers.onEnd Called with the release speed in pixels per ms.
 * @returns {void}
 */
export function attachDrag(surface, handlers) {
  let gesture = null;

  surface.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || !handlers.canStart(event)) {
      return;
    }
    if (event.pointerType === 'mouse') {
      // Stops the browser picking up a photo to drag it somewhere else.
      event.preventDefault();
    }
    gesture = { id: event.pointerId, startX: event.clientX, isDragging: false, samples: [] };
  });

  surface.addEventListener('pointermove', (event) => {
    if (!gesture || event.pointerId !== gesture.id) {
      return;
    }
    if (!gesture.isDragging) {
      if (Math.abs(event.clientX - gesture.startX) < DRAG_START_PX) {
        return;
      }
      // Still measured from the press, so the wheel stays under the finger.
      gesture = { ...gesture, isDragging: true };
      surface.setPointerCapture(event.pointerId);
      handlers.onStart();
    }
    const recent = gesture.samples.filter(
      (sample) => event.timeStamp - sample.time <= VELOCITY_WINDOW_MS
    );
    gesture = { ...gesture, samples: [...recent, { time: event.timeStamp, x: event.clientX }] };
    handlers.onMove(event.clientX - gesture.startX);
  });

  const finish = (event) => {
    if (!gesture || event.pointerId !== gesture.id) {
      return;
    }
    const { isDragging, samples } = gesture;
    gesture = null;
    if (isDragging) {
      handlers.onEnd(event.type === 'pointercancel' ? 0 : releaseSpeed(samples, event.timeStamp));
    }
  };
  surface.addEventListener('pointerup', finish);
  surface.addEventListener('pointercancel', finish);
}
