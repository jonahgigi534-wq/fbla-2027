/**
 * The shape of a single thing a customer can order, and the helper that builds one.
 *
 * Every catalog file (menu-food.js, menu-bakery.js, menu-drinks.js, menu-sides.js,
 * menu-catering.js) calls createItem so all items share one shape and one set of
 * defaults. menu.js then assembles those files into the finished catalog.
 *
 * Prices are whole cents. Nothing in this program stores money as a decimal, because
 * repeated tax and tip arithmetic on floating point produces totals like 24.310000000000002.
 */

/** Cost of one order that has no lead time, used when an item ships the same visit. */
const NO_LEAD_TIME_HOURS = 0;

/** Stock level assigned to an item that is available but has none of the seeded shortage. */
const DEFAULT_STOCK = 40;

/**
 * Builds one catalog item.
 *
 * @param {string} id Stable identifier used in URLs, carts, and saved orders.
 * @param {string} name Customer-facing name, shown exactly as the restaurant writes it.
 * @param {number} priceCents Price in whole cents.
 * @param {string} description Ingredient list or serving note shown under the name.
 * @param {object} [options] Rare per-item overrides.
 * @param {boolean} [options.soldOut] True for items the restaurant currently has none of.
 * @param {boolean} [options.popular] True for items featured on the House of Pies home page.
 * @param {string} [options.imageId] Base filename in assets/img, without the extension.
 * @param {number} [options.leadTimeHours] Hours of notice the kitchen needs before pickup.
 * @param {number} [options.stock] Explicit starting stock, overriding the default.
 * @param {string[]} [options.tags] Extra dietary tags that the description does not reveal.
 * @returns {object} A catalog item with category and section filled in later by menu.js.
 */
export function createItem(id, name, priceCents, description, options = {}) {
  const soldOut = options.soldOut === true;
  return {
    id,
    name,
    priceCents,
    description,
    isPopular: options.popular === true,
    imageId: options.imageId ?? null,
    leadTimeHours: options.leadTimeHours ?? NO_LEAD_TIME_HOURS,
    stock: soldOut ? 0 : (options.stock ?? DEFAULT_STOCK),
    extraTags: options.tags ?? [],
  };
}

/**
 * Builds one menu category, which is a named group of items inside a section.
 *
 * @param {string} id Stable identifier used by the category filter and the router.
 * @param {string} name Customer-facing heading.
 * @param {string} blurb One line describing the group, shown under the heading.
 * @param {object[]} items Items in the order the restaurant lists them.
 * @returns {object} A category ready to be attached to a section.
 */
export function createCategory(id, name, blurb, items) {
  return { id, name, blurb, items };
}
