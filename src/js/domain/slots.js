/**
 * Pickup time slots, and the capacity limit on each one.
 *
 * A kitchen can only hand over so many orders at once. Letting forty customers all
 * choose 6:30pm is how a queue forms at the counter, so each fifteen minute slot
 * holds a fixed number of orders and a full one is offered as taken with the next
 * free time named.
 *
 * This is the part of the program that answers the topic's question about helping
 * the business operate more efficiently rather than just serving the customer:
 * spreading collection across the hour is worth more to the restaurant than any
 * feature on the ordering side.
 *
 * Pure functions. The current time arrives as an argument so the whole schedule is
 * testable at any hour of any day.
 */

import { MINUTES_PER_DAY } from '../data/locations.js';

/** Slots are offered on the quarter hour. */
export const SLOT_MINUTES = 15;

/** How many orders one slot can hold at a single restaurant. */
export const SLOT_CAPACITY = 4;

/** Minutes the kitchen needs before the earliest everyday order can be collected. */
export const MINIMUM_PREP_MINUTES = 20;

/** How far ahead the picker offers times. */
const SLOTS_TO_OFFER = 24;

/** Minutes in an hour. */
const MINUTES_PER_HOUR = 60;

/**
 * Rounds a time up to the next slot boundary.
 *
 * @param {number} minute Minutes past midnight.
 * @returns {number} The same time, or the next quarter hour after it.
 */
export function roundUpToSlot(minute) {
  return Math.ceil(minute / SLOT_MINUTES) * SLOT_MINUTES;
}

/**
 * Formats minutes past midnight as a pickup time.
 *
 * @param {number} minute Minutes past midnight, which may exceed one day.
 * @returns {string} A string such as '6:45 PM'.
 */
export function formatSlot(minute) {
  const wrapped = ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(wrapped / MINUTES_PER_HOUR);
  const minutes = String(wrapped % MINUTES_PER_HOUR).padStart(2, '0');
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/**
 * Counts how many orders are already booked into one slot at one restaurant.
 *
 * @param {object[]} orders Orders already placed.
 * @param {string} locationId The restaurant.
 * @param {string} slotKey The slot, as an ISO date plus minute, e.g. '2026-09-08:1110'.
 * @returns {number} How many orders hold that slot.
 */
export function bookingsInSlot(orders, locationId, slotKey) {
  return orders.filter(
    (order) =>
      order.locationId === locationId && order.slotKey === slotKey && order.status !== 'Cancelled'
  ).length;
}

/**
 * Builds the slot key that identifies one slot on one day.
 *
 * @param {Date} day The day the slot falls on.
 * @param {number} minute Minutes past midnight.
 * @returns {string} A key such as '2026-09-08:1110'.
 */
export function slotKeyFor(day, minute) {
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, '0');
  const date = String(day.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}:${minute}`;
}

/**
 * Builds the list of collection times to offer a customer.
 *
 * The earliest offered time respects two separate limits: the kitchen's standard
 * prep time, and the notice the slowest item in the cart needs. A cart with a
 * catering tray in it cannot be collected in twenty minutes.
 *
 * Slots outside the restaurant's hours are dropped rather than shown as unavailable,
 * because a list of thirty greyed out times is worse than a short list of real ones.
 *
 * @param {object} options What is being scheduled.
 * @param {object} options.location The chosen restaurant.
 * @param {Date} options.now The current moment.
 * @param {number} options.leadTimeHours Notice required by the slowest item in the cart.
 * @param {object[]} options.orders Orders already placed, for the capacity check.
 * @returns {Array<{minute: number, dayOffset: number, key: string, label: string,
 *   isFull: boolean, remaining: number}>} Offered slots, earliest first.
 */
export function buildSlots({ location, now, leadTimeHours = 0, orders = [] }) {
  const earliest =
    now.getHours() * MINUTES_PER_HOUR +
    now.getMinutes() +
    Math.max(MINIMUM_PREP_MINUTES, leadTimeHours * MINUTES_PER_HOUR);

  const slots = [];
  let minute = roundUpToSlot(earliest);

  // Walk forward in quarter hours, skipping any that fall while the doors are shut.
  // The guard on total steps stops a closed restaurant from looping forever.
  for (let step = 0; step < SLOTS_TO_OFFER * 8 && slots.length < SLOTS_TO_OFFER; step += 1) {
    const dayOffset = Math.floor(minute / MINUTES_PER_DAY);
    const minuteOfDay = minute % MINUTES_PER_DAY;
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    const hours = location.hours[day.getDay()];

    if (minuteOfDay >= hours.openMinute && minuteOfDay < hours.closeMinute) {
      const key = slotKeyFor(day, minuteOfDay);
      const taken = bookingsInSlot(orders, location.id, key);
      slots.push({
        minute: minuteOfDay,
        dayOffset,
        key,
        label: formatSlot(minuteOfDay) + (dayOffset > 0 ? ` (+${dayOffset}d)` : ''),
        isFull: taken >= SLOT_CAPACITY,
        remaining: Math.max(SLOT_CAPACITY - taken, 0),
      });
    }
    minute += SLOT_MINUTES;
  }
  return slots;
}

/**
 * Finds the first slot that still has room.
 *
 * @param {object[]} slots Slots from buildSlots.
 * @returns {object|null} The first slot with room, or null when every one is full.
 */
export function firstAvailableSlot(slots) {
  return slots.find((slot) => !slot.isFull) ?? null;
}
