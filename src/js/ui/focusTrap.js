/**
 * Keeps Tab inside an open overlay.
 *
 * Tab wraps from the last control to the first, so focus never leaves an open overlay.
 */

/** What counts as focusable. Anything deliberately taken out of the order is not. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Lists what can be tabbed to inside a container, in document order.
 *
 * @param {HTMLElement} container The overlay.
 * @returns {HTMLElement[]} Focusable elements that are actually on screen.
 */
function focusableWithin(container) {
  return [...container.querySelectorAll(FOCUSABLE)].filter(
    (element) => element.offsetParent !== null
  );
}

/**
 * Holds Tab inside a container until the returned function is called.
 *
 * @param {HTMLElement} container The overlay to keep focus inside.
 * @returns {Function} Call to stop trapping. Safe to call more than once.
 */
export function trapFocus(container) {
  /**
   * Wraps Tab around the ends of the overlay.
   *
   * @param {KeyboardEvent} event The key press.
   * @returns {void}
   */
  function onKeyDown(event) {
    if (event.key !== 'Tab') {
      return;
    }
    const focusable = focusableWithin(container);
    if (focusable.length === 0) {
      // Nothing to move to, so Tab does nothing rather than leaving.
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!container.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', onKeyDown, true);

  return () => {
    document.removeEventListener('keydown', onKeyDown, true);
  };
}
