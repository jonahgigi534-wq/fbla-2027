/**
 * Saved state, with a fallback for when the browser refuses to save anything.
 *
 * Some browsers refuse to save on a page opened from a file. Every read and write is
 * wrapped, and when saving is refused the data lives in memory until the tab closes.
 *
 * Used by app/store.js, which owns the shape of what gets saved.
 */

/**
 * One key holds the whole saved state, so a save is a single write.
 */
const STORAGE_KEY = 'houseofpies.ordering';

/**
 * Bumped whenever the saved shape changes in a way older data cannot satisfy.
 * migrate() below decides what to do with anything older.
 */
const SCHEMA_VERSION = 2;

/** Holds saved state when the browser will not. Session only, by design. */
let memoryFallback = null;

/** Set once on first use so the UI can tell the customer their data will not persist. */
let isUsingMemoryFallback = false;

/**
 * Tests whether this browser will actually let the page store anything.
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
 * @returns {boolean} True when the browser blocked storage and memory is being used.
 */
export function isUsingTemporaryStorage() {
  return isUsingMemoryFallback;
}

/**
 * Brings saved data forward to the current schema version.
 *
 * Saved data from an older version is discarded rather than guessed at.
 *
 * @param {object} saved Parsed data straight out of storage.
 * @returns {object|null} Usable state, or null when it cannot be trusted.
 */
function migrate(saved) {
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
