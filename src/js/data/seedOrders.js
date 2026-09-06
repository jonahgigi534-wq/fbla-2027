/**
 * Ninety days of past orders, generated rather than stored.
 *
 * The reports screen is the part of this program that has to prove itself, and it
 * cannot do that against an empty table. Shipping a few thousand rows of JSON would
 * bloat the repository and the offline build, so the history is generated at startup
 * from a seeded random number generator instead.
 *
 * Seeded matters. The same seed produces the same ninety days every time the program
 * runs, on any machine, so a number quoted in a presentation is still true when the
 * judges run it themselves, and a bug found in the data can be reproduced.
 *
 * The shape produced here matches exactly what app/orderActions.js writes for a real
 * order, so reports never need to know which kind they are looking at.
 */

import { ALL_ITEMS } from './menu.js';
import { LOCATIONS } from './locations.js';
import { calculateOrderTotals } from '../domain/pricing.js';

/** Fixed seed. Change it and every figure in the reports changes with it. */
const SEED = 19670425;

/** How far back the generated history reaches. */
const DAYS_OF_HISTORY = 90;

/** Orders per location on an average weekday. */
const BASE_ORDERS_PER_DAY = 3;

/** Weekends are busier, so Saturday and Sunday get this multiplier. */
const WEEKEND_MULTIPLIER = 1.8;

/** Chance that a restaurant takes a catering booking on any given day. */
const CATERING_CHANCE_PER_DAY = 0.13;

/** The most items one generated order can contain. */
const MAX_LINES_PER_ORDER = 3;

/**
 * A small, fast, seeded pseudorandom number generator.
 *
 * Math.random cannot be seeded, so it would give different history on every reload
 * and make any figure quoted from the reports unrepeatable. This is mulberry32,
 * which is a few lines long and good enough for choosing menu items.
 *
 * @param {number} seed Any integer.
 * @returns {Function} A function returning a number from 0 up to but not including 1.
 */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks one entry from a list.
 *
 * @param {Function} random The seeded generator.
 * @param {Array} list Anything to choose from.
 * @returns {*} One entry.
 */
function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

/**
 * Picks a whole number between two bounds, both included.
 *
 * @param {Function} random The seeded generator.
 * @param {number} low Lowest allowed.
 * @param {number} high Highest allowed.
 * @returns {number} A number in range.
 */
function pickBetween(random, low, high) {
  return low + Math.floor(random() * (high - low + 1));
}

/**
 * Builds the pool that orders are drawn from, weighted towards the bakery.
 *
 * A plain uniform pick would sell as many gallons of catering tea as slices of pie,
 * which would make the reports meaningless. House of Pies is a pie shop, so bakery
 * items go into the pool several times over and catering goes in rarely.
 *
 * @returns {object[]} Items to draw from, with popular ones repeated.
 */
function buildWeightedPool() {
  const pool = [];
  for (const item of ALL_ITEMS) {
    let weight = 1;
    if (item.sectionId === 'bakery') {
      weight = 4;
    } else if (item.sectionId === 'food') {
      weight = 3;
    } else if (item.sectionId === 'catering') {
      // Catering never joins an everyday ticket. Nobody adds a tray for forty to a
      // breakfast order. It is booked days ahead as its own thing, so it is
      // generated separately below.
      weight = 0;
    }
    // A diner sells far more slices than whole pies, and more plates than ribeyes.
    // Without this the average check comes out near sixty dollars, which is a
    // steakhouse, not House of Pies.
    if (item.priceCents > 1600 && weight > 1) {
      weight = Math.max(Math.floor(weight / 3), 1);
    }
    if (item.isPopular) {
      weight += 4;
    }
    for (let copy = 0; copy < weight; copy += 1) {
      pool.push(item);
    }
  }
  return pool;
}

/**
 * Builds the pool of catering trays, used for the separate catering stream.
 *
 * @returns {object[]} Every catering item.
 */
function buildCateringPool() {
  return ALL_ITEMS.filter((item) => item.sectionId === 'catering');
}

/**
 * Builds one generated order.
 *
 * @param {object} options What to build.
 * @param {Function} options.random The seeded generator.
 * @param {object[]} options.pool Weighted item pool.
 * @param {object} options.location Which restaurant.
 * @param {Date} options.placedAt When it was placed.
 * @param {number} options.orderNumber The order number to assign.
 * @returns {object} An order in the same shape a real one takes.
 */
function buildOrder({ random, pool, location, placedAt, orderNumber }) {
  const lines = [];
  const lineCount = pickBetween(random, 1, MAX_LINES_PER_ORDER);

  for (let index = 0; index < lineCount; index += 1) {
    const item = pick(random, pool);
    if (lines.some((line) => line.itemId === item.id)) {
      continue;
    }
    lines.push({
      lineId: `seed-${orderNumber}-${index}`,
      itemId: item.id,
      name: item.name,
      priceCents: item.priceCents,
      categoryId: item.categoryId,
      leadTimeHours: item.leadTimeHours,
      // Most tickets are one of a thing. Two happens, three is rare.
      quantity: random() < 0.72 ? 1 : pickBetween(random, 2, 3),
      note: '',
    });
  }

  const orderTypeId = pick(random, ['pickup', 'pickup', 'pickup', 'delivery', 'dine-in']);
  const totals = calculateOrderTotals(lines, { orderTypeId });

  return {
    orderNumber,
    placedAt: placedAt.toISOString(),
    locationId: location.id,
    orderTypeId,
    status: 'Complete',
    lines,
    customer: { name: 'Past customer', phone: '', email: '', street: null, zip: null },
    cardLastFour: '0000',
    slotKey: `${placedAt.toISOString().slice(0, 10)}:${placedAt.getHours() * 60}`,
    slotLabel: 'Collected',
    promoCode: null,
    totals,
    isSeeded: true,
  };
}

/**
 * Generates the whole ninety day history.
 *
 * Order numbers count up as time moves forward, so the oldest order has the lowest
 * number, which is what a real till would produce. The live order counter starts
 * above whatever this generates so a new order never collides with a seeded one.
 *
 * @param {Date} [today] The day to count back from. Passed in so tests can fix it.
 * @returns {object[]} Orders, newest first.
 */
export function generateSeedOrders(today = new Date()) {
  const random = createRandom(SEED);
  const pool = buildWeightedPool();
  const cateringPool = buildCateringPool();
  const orders = [];
  let orderNumber = 1;

  for (let daysAgo = DAYS_OF_HISTORY; daysAgo >= 1; daysAgo -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - daysAgo);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

    for (const location of LOCATIONS) {
      const target = Math.round(BASE_ORDERS_PER_DAY * (isWeekend ? WEEKEND_MULTIPLIER : 1));
      const count = pickBetween(random, Math.max(target - 1, 1), target + 2);

      for (let index = 0; index < count; index += 1) {
        const placedAt = new Date(day);
        // Two humps, breakfast and dinner, rather than orders spread flat over the day.
        const isMorning = random() < 0.45;
        placedAt.setHours(
          isMorning ? pickBetween(random, 7, 11) : pickBetween(random, 17, 21),
          pickBetween(random, 0, 59),
          0,
          0
        );
        orders.push(buildOrder({ random, pool, location, placedAt, orderNumber }));
        orderNumber += 1;
      }

      // Catering runs at roughly two bookings a week per restaurant, placed during
      // office hours rather than at the breakfast or dinner rush.
      if (random() < CATERING_CHANCE_PER_DAY) {
        const placedAt = new Date(day);
        placedAt.setHours(pickBetween(random, 9, 16), pickBetween(random, 0, 59), 0, 0);
        orders.push(buildOrder({ random, pool: cateringPool, location, placedAt, orderNumber }));
        orderNumber += 1;
      }
    }
  }

  return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

/**
 * The order number a live order should start from, given a seeded history.
 *
 * @param {object[]} orders The generated history.
 * @returns {number} One past the highest number used.
 */
export function nextOrderNumberAfter(orders) {
  return orders.reduce((highest, order) => Math.max(highest, order.orderNumber), 1000) + 1;
}
