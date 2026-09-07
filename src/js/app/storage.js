/**
 * Saved state, with a fallback for when the browser refuses to save anything.
 *
 * The offline build of this program is opened straight off the disk with a file://
 * address. Browsers treat every file:// page as one shared, untrusted origin, and
 * several of them refuse localStorage there outright. A private window, cleared site
 * data, or a locked down school laptop can do the same thing.
 *
 * So every read and write here is wrapped, and when the browser says no the data
 * lives in a plain object for the rest of the session instead. The program keeps
 * working; it just forgets when the tab closes. That is the right trade for a demo
 * running on a machine nobody controls.
 *
 * Used by app/store.js, which owns the shape of what gets saved.
 */

/**
 * One key holds the whole saved state, so a save is a single write.
 *
 * No version in the name. It used to end in .v1, which stopped being true the moment
 * SCHEMA_VERSION went to 2 and left two things that both looked like the version
 * disagreeing with each other. The version lives in the saved object, where migrate()
 * can actually read it.
 */
const STORAGE_KEY = 'houseofpies.ordering';

/**
 * Bumped whenever the saved shape changes in a way older data cannot satisfy.
 * migrate() below decides what to do with anything older.
 */
export const SCHEMA_VERSION = 2;

/** Holds saved state when the browser will not. Session only, by design. */
let memoryFallback = null;

/** Set once on first use so the UI can tell the customer their data will not persist. */
let isUsingMemoryFallback = false;

/**
 * Tests whether this browser will actually let the page store anything.
 *
 * Writing and removing a probe key is the only reliable test. Some browsers expose
 * localStorage as an object and then throw on the first write.
 *
 * @returns {boolean} True when localStorage can be written and read.
 */
function isLocalStorageWritable() {
  try {
    const probe = `${STORAGE_KEY}.probe`;
    window.localStorage.setItem(probe, 'ok');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reports whether saved data will survive closing the tab.
 *
 * The UI uses this to warn the customer once, rather than letting them believe an
 * order history is being kept when it is not.
 *
 * @returns {boolean} True when the browser blocked storage and memory is being used.
 */
export function isUsingTemporaryStorage() {
  return isUsingMemoryFallback;
}

/**
 * Brings saved data forward to the current schema version.
 *
 * Anything older than the current version is discarded rather than guessed at, and
 * silently keeping data whose shape no longer matches is how a demo crashes in front
 * of a judge.
 *
 * Version 2 renamed the cancelled order status to Canceled. Orders saved under
 * version 1 still carry the old spelling, which no longer matches anything the status
 * machine or the reports know about, so they are dropped rather than converted. There
 * is nothing in them worth keeping: the seeded history rebuilds itself on load.
 *
 * @param {object} saved Parsed data straight out of storage.
 * @returns {object|null} Usable state, or null when it cannot be trusted.
 */
export function migrate(saved) {
  if (saved === null || typeof saved !== 'object') {
    return null;
  }
  if (saved.schemaVersion !== SCHEMA_VERSION) {
    return null;
  }
  return saved;
}

/**
 * Loads saved state.
 *
 * @returns {object|null} The saved state, or null when there is none to load.
 */
export function load() {
  try {
    if (!isLocalStorageWritable()) {
      isUsingMemoryFallback = true;
      return memoryFallback;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : migrate(JSON.parse(raw));
  } catch {
    isUsingMemoryFallback = true;
    return memoryFallback;
  }
}

/**
 * Saves state, falling back to memory when the browser refuses.
 *
 * @param {object} state The state to save. A schemaVersion is added here so callers
 *   never have to remember it.
 * @returns {boolean} True when the data reached localStorage and will survive a reload.
 */
export function save(state) {
  const withVersion = { ...state, schemaVersion: SCHEMA_VERSION };
  try {
    if (!isLocalStorageWritable()) {
      throw new Error('localStorage is not writable');
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withVersion));
    return true;
  } catch {
    memoryFallback = withVersion;
    isUsingMemoryFallback = true;
    return false;
  }
}

/**
 * Removes everything this program saved, so the next load starts fresh.
 *
 * Backs the Reset demo data button, which matters between judging rounds.
 *
 * @returns {void}
 */
export function clear() {
  memoryFallback = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    isUsingMemoryFallback = true;
  }
}
