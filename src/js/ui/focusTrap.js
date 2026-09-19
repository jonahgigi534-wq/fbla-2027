/**
 * Keeps Tab inside an open overlay.
 *
 * The assistant and the tour both cover the screen, move focus into themselves when
 * they open, hand it back when they close, and shut on Escape or Back. Everything
 * about them says modal except what Tab did: it walked straight out of the panel and
 * carried on through the twenty seven controls behind it, which for anyone not using
 * a mouse meant being somewhere invisible with no obvious way back.
 *
 * So Tab is wrapped. The last control leads to the first, the first leads back to the
 * last, and focus that has somehow landed outside is pulled back in. Used together
 * with aria-modal on the overlay, which is what tells a screen reader to ignore the
 * rest of the page while it is open.
 *
 * Deliberately small. It does not remember what had focus before it started, because
 * both callers already do that themselves.
 */

/** What counts as focusable. Anything deliberately taken out of the order is not. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Lists what can be tabbed to inside a container, in document order.
 *
 * offsetParent is null for anything display:none or inside something hidden, which is
 * how the assistant's panel sits while it is closed.
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
 * Listens on the capture phase so it sees the key before anything inside the overlay
 * does, such as the assistant's input.
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
