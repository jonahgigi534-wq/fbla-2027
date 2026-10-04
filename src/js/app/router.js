/**
 * Hash based routing.
 *
 * Routes live after the # because the offline build opens from a file:// address, where
 * a normal path cannot be reloaded. Back, Forward, and refresh all work, and an unknown
 * address shows Not Found.
 */

/** Where an empty or bare '#' address goes. */
const DEFAULT_PATH = '/home';

/** Registered routes, in the order they are tested. */
const routes = [];

/** Called after every navigation with the matched route and its parameters. */
let onNavigate = null;

/**
 * Set while a dialog is open, so Back can close it instead of navigating.
 *
 * @type {{close: Function, path: string}|null}
 */
let openDialog = null;

/**
 * Registers one route.
 *
 * @param {string} pattern Path pattern, always starting with '/'.
 * @param {string} name Screen name passed back to the navigation handler.
 * @returns {void}
 */
export function addRoute(pattern, name) {
  routes.push({ segments: pattern.split('/').filter(Boolean), name, pattern });
}

/**
 * Reads the current path out of the address bar.
 *
 * @returns {string} A path such as '/menu/burgers', defaulting to '/home'.
 */
export function currentPath() {
  const raw = window.location.hash.replace(/^#/, '');
  return raw === '' || raw === '/' ? DEFAULT_PATH : raw;
}

/**
 * Matches a path against the registered routes.
 *
 * @param {string} path A path such as '/menu/burgers'.
 * @param {object[]} routeTable Routes to test, defaulting to the registered ones.
 * @returns {{name: string, params: object}|null} The match, or null when nothing fits.
 */
export function matchPath(path, routeTable = routes) {
  const parts = path.split('?')[0].split('/').filter(Boolean);

  for (const route of routeTable) {
    if (route.segments.length !== parts.length) {
      continue;
    }
    const params = {};
    const isMatch = route.segments.every((segment, index) => {
      if (segment.startsWith(':')) {
        params[segment.slice(1)] = decodeURIComponent(parts[index]);
        return true;
      }
      return segment === parts[index];
    });
    if (isMatch) {
      return { name: route.name, params };
    }
  }
  return null;
}

/**
 * Navigates to a path, adding a history entry so Back returns to where you were.
 *
 * @param {string} path A path such as '/cart'.
 * @returns {void}
 */
export function navigate(path) {
  // A call to navigate is always something the customer asked for, a link or a button,
  // so an open dialog is dismissed rather than allowed to swallow the move.
  dismissDialog();
  const target = `#${path}`;
  if (window.location.hash === target) {
    handleLocationChange();
    return;
  }
  window.location.hash = target;
}

/**
 * Replaces the current history entry instead of adding one.
 *
 * @param {string} path A path such as '/home'.
 * @returns {void}
 */
export function replace(path) {
  dismissDialog();
  window.location.replace(`#${path}`);
}

/**
 * Registers a dialog so the next Back press closes it instead of navigating.
 *
 * So pressing Back to close the assistant leaves you on the screen you were on.
 *
 * @param {Function} close Called to dismiss the dialog.
 * @returns {void}
 */
export function registerDialog(close) {
  openDialog = { close, path: currentPath() };
}

/**
 * Forgets the registered dialog, called when it closes on its own.
 *
 * @returns {void}
 */
export function clearDialog() {
  openDialog = null;
}

/**
 * Closes whatever dialog is open, if one is.
 *
 * @returns {{path: string}|null} Where the dialog was opened from, or null if none was.
 */
function dismissDialog() {
  if (openDialog === null) {
    return null;
  }
  const { close, path } = openDialog;
  openDialog = null;
  close();
  return { path };
}

/**
 * Resolves the current address and hands the result to the navigation handler.
 *
 * @returns {void}
 */
function handleLocationChange() {
  /*
   * Reaching here with a dialog still open means the browser moved the address on its
   * own, which is Back or Forward. Everything else that can move it has dismissed the
   * dialog already: navigate and replace do it themselves, and a click on one of the
   * header's links is caught by the listener start() installs, because an anchor
   * changing the fragment looks exactly like a Back press from in here.
   *
   * The address has already left for the previous screen, so it is put back: closing
   * the dialog is what the press meant, and the screen under it should not move.
   *
   * Put back by navigating rather than replacing. Back popped an entry, so pushing one
   * leaves the history exactly as it was and a second Back still goes where the first
   * would have. Replacing here would overwrite the entry Back had just returned to,
   * and the customer would find themselves unable to leave the screen at all.
   */
  const dismissed = dismissDialog();
  if (dismissed !== null) {
    navigate(dismissed.path);
    return;
  }

  const path = currentPath();
  const match = matchPath(path) ?? { name: 'not-found', params: { path } };
  if (onNavigate !== null) {
    onNavigate(match.name, match.params, path);
  }
}

/**
 * Starts routing and resolves whatever address the page was loaded with.
 *
 * Reading the address on start is what makes a refresh return to the same screen.
 *
 * @param {Function} handler Called with (screenName, params, path) on every navigation.
 * @returns {void}
 */
export function start(handler) {
  onNavigate = handler;
  window.addEventListener('hashchange', handleLocationChange);

  /*
   * Every link in this program is an anchor pointing at a fragment, which the browser
   * follows by changing the address itself. From inside hashchange that is
   * indistinguishable from a Back press, so with the assistant or the tour open a
   * click on Menu would close the overlay and then be swallowed as though it had been
   * Back: the panel went away and the screen never moved.
   *
   * Catching the click first, while it is still recognisably a click, is what keeps
   * the two apart. The navigation is not interfered with, only the dialog is let go
   * of, so by the time the address changes there is nothing left to absorb it.
   */
  document.addEventListener(
    'click',
    (event) => {
      if (event.target.closest?.('a[href^="#"]')) {
        dismissDialog();
      }
    },
    true
  );

  handleLocationChange();
}
