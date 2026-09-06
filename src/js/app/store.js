/**
 * The single place application state lives.
 *
 * One object holds everything that can change: which restaurant the customer picked,
 * what is in the cart, the orders placed so far, and the stock the manager has
 * adjusted. Screens read it, call an update function, and re-render when told to.
 *
 * Two rules keep this small enough to reason about:
 *
 *   1. Updates never modify the current state. They build a new object from it. That
 *      means a screen can hold onto the state it rendered from and compare, and no
 *      screen can quietly corrupt another screen's data.
 *   2. Nothing outside this module writes to state directly. The setters below are
 *      the whole surface.
 *
 * Every change is saved through app/storage.js, so a refresh mid demo loses nothing.
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
 * The order list is not empty. Ninety days of past orders are generated so the
 * reports screen has something real to report on, which it cannot do from a blank
 * table. See data/seedOrders.js for how they are built and why they are seeded.
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
 * The object handed back is the live one, so callers read from it and never write
 * to it. Every write goes through update() below.
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
 * The argument is a function rather than an object so a caller that needs to read
 * the current value before changing it, such as adding one to a quantity, cannot
 * accidentally work from a stale copy.
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
 * Backs the Reset demo data button. Between judging rounds the program has to look
 * the same way it did at the start of the previous one, and clicking through a
 * cart to empty it by hand is not something to do on the clock.
 *
 * @returns {object} The fresh state.
 */
export function resetToDefaults() {
  return update(() => createInitialState());
}
