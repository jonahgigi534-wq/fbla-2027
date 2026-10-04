/**
 * The single place application state lives.
 *
 * Updates never change the current state; they build a new one. Every change is saved,
 * so a refresh loses nothing.
 */

import { load, save } from './storage.js';
import { DEFAULT_LOCATION_ID } from '../data/locations.js';
import { generateSeedOrders, nextOrderNumberAfter } from '../data/seedOrders.js';

/** Order types the customer can choose between. */
export const ORDER_TYPES = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'dine-in', label: 'Dine in' },
];

/**
 * The state a first time visitor starts from.
 *
 * Starts with ninety days of generated orders so the reports have something to show.
 *
 * @returns {object} A fresh state object.
 */
function createInitialState() {
  const seeded = generateSeedOrders();
  return {
    locationId: DEFAULT_LOCATION_ID,
    orderTypeId: 'pickup',
    cart: [],
    orders: seeded,
    stockOverrides: {},
    budgetCapCents: null,
    promoCode: null,
    hasSeenWelcome: false,
    isManagerUnlocked: false,
    nextOrderNumber: nextOrderNumberAfter(seeded),
  };
}

/** Current state. Replaced wholesale on every update, never edited in place. */
let state = { ...createInitialState(), ...(load() ?? {}) };

/** Functions to call after every change. */
const listeners = new Set();

/**
 * Returns the current state.
 *
 * @returns {object} Current application state.
 */
export function getState() {
  return state;
}

/**
 * Subscribes to state changes.
 *
 * @param {Function} listener Called with the new state after every change.
 * @returns {Function} Call to stop listening.
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Applies a change, saves the result, and tells every listener.
 *
 * Takes a function, so a change that depends on the current value never works from a
 * stale copy.
 *
 * @param {Function} produceChanges Receives current state, returns the fields to change.
 * @returns {object} The new state.
 */
export function update(produceChanges) {
  state = { ...state, ...produceChanges(state) };
  save(state);
  for (const listener of listeners) {
    listener(state);
  }
  return state;
}

/**
 * Throws away all saved state and starts over from the defaults.
 *
 * @returns {object} The fresh state.
 */
export function resetToDefaults() {
  return update(() => createInitialState());
}
