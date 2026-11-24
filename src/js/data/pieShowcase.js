/**
 * The pies the home screen shows off, picked by hand for how they look in their
 * photos.
 *
 * The restaurant's own featured dishes (isPopular on a catalog item) are mostly
 * breakfast plates, and a steak and eggs photo is not what sells a place called House
 * of Pies. Those keep their popular mark for the assistant and search. These lists are
 * only for the home screen.
 */

import { findItem } from './menu.js';

/**
 * Turns a list of ids into catalog items, in the same order.
 *
 * @param {string[]} ids Catalog item ids.
 * @returns {object[]} The items. A wrong id comes back undefined, which the tests catch.
 */
function itemsFor(ids) {
  return ids.map((id) => findItem(id));
}

/** The grid of featured pies. */
export const FEATURED_PIES = itemsFor([
  'bayou-goo-pie-slice',
  'fresh-strawberry-pie-slice',
  'texas-pecan-pie-slice',
  'cherry-pie-slice',
  'lemon-meringue-pie-slice',
  'chocolate-cream-pie-slice',
  'apple-pie-slice',
  'ny-strawberry-cheesecake-slice',
]);

/**
 * The slices of the pie wheel, clockwise from the top. Twelve makes each slice wide
 * enough at the rim for its photo and the description to sit inside it.
 */
export const WHEEL_PIES = itemsFor([
  'bayou-goo-pie-slice',
  'key-lime-pie-slice',
  'cherry-pie-slice',
  'french-silk-pie-slice',
  'lemon-meringue-pie-slice',
  'texas-pecan-pie-slice',
  'fresh-strawberry-pie-slice',
  'coconut-cream-pie-slice',
  'blueberry-pie-slice',
  'chocolate-meringue-pie-slice',
  'pumpkin-pie-slice',
  'strawberry-cream-cheese-pie-slice',
]);
