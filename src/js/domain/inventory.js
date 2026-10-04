/**
 * What the restaurant actually has, and what to do when it runs out.
 */

/** At or below this many left, screens warn the customer to order soon. */
export const LOW_STOCK_THRESHOLD = 5;

/** How many substitutes to offer when something is unavailable. */
const SUBSTITUTE_COUNT = 3;

/**
 * Reads the stock for one item, preferring a manager adjustment over the catalog.
 *
 * @param {object} item A finished catalog item.
 * @param {Object<string, number>} stockOverrides Manager edits, keyed by item id.
 * @returns {number} How many the restaurant has right now.
 */
export function stockFor(item, stockOverrides = {}) {
  const override = stockOverrides[item.id];
  return override === undefined ? item.stock : override;
}

/**
 * Returns the catalog with each item's stock as it stands now, staff changes included.
 *
 * Screens read item.stock directly, so without this a pie staff marked sold out still
 * looked available on the menu.
 *
 * @param {object[]} items Catalog items.
 * @param {Object<string, number>} stockOverrides Manager edits, keyed by item id.
 * @returns {object[]} The items, with a new object for each one staff have changed.
 */
export function withLiveStock(items, stockOverrides = {}) {
  return items.map((item) =>
    stockOverrides[item.id] === undefined ? item : { ...item, stock: stockOverrides[item.id] }
  );
}

/**
 * Counts how many of one item are already in the cart.
 *
 * @param {object[]} lines Cart lines.
 * @param {string} itemId The item to count.
 * @returns {number} The total quantity already reserved.
 */
export function quantityInCart(lines, itemId) {
  return lines
    .filter((line) => line.itemId === itemId)
    .reduce((total, line) => total + line.quantity, 0);
}

/**
 * Works out how many more of an item the customer may add.
 *
 * @param {object} item A finished catalog item.
 * @param {object[]} lines Current cart lines.
 * @param {Object<string, number>} stockOverrides Manager edits, keyed by item id.
 * @returns {number} How many more can be added, never below zero.
 */
export function remainingFor(item, lines, stockOverrides = {}) {
  const remaining = stockFor(item, stockOverrides) - quantityInCart(lines, item.id);
  return remaining < 0 ? 0 : remaining;
}

/**
 * Decides whether a requested quantity can be added, and says why when it cannot.
 *
 * The message names how many are left, so the customer can take that many instead.
 *
 * @param {object} item A finished catalog item.
 * @param {number} requested How many the customer is trying to add.
 * @param {object[]} lines Current cart lines.
 * @param {Object<string, number>} stockOverrides Manager edits, keyed by item id.
 * @returns {{allowed: boolean, remaining: number, message: string|null}} The verdict.
 */
export function checkAvailability(item, requested, lines, stockOverrides = {}) {
  const remaining = remainingFor(item, lines, stockOverrides);

  if (stockFor(item, stockOverrides) === 0) {
    return { allowed: false, remaining: 0, message: `${item.name} is sold out today.` };
  }
  if (remaining === 0) {
    return {
      allowed: false,
      remaining: 0,
      message: `Your cart already has the last of the ${item.name.toLowerCase()}.`,
    };
  }
  if (requested > remaining) {
    const unit = remaining === 1 ? 'is' : 'are';
    return {
      allowed: false,
      remaining,
      message: `Only ${remaining} ${unit} left, so we cannot add ${requested}.`,
    };
  }
  return { allowed: true, remaining, message: null };
}

/**
 * Reports whether an item is running low, for the badge on its tile.
 *
 * @param {object} item A finished catalog item.
 * @param {Object<string, number>} stockOverrides Manager edits, keyed by item id.
 * @returns {boolean} True when stock is low but not gone.
 */
export function isLowStock(item, stockOverrides = {}) {
  const stock = stockFor(item, stockOverrides);
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}

/**
 * Suggests replacements for something the restaurant has run out of.
 *
 * Same category, closest in price first, so a sold out pie suggests another pie at a
 * similar price.
 *
 * @param {object} item The unavailable item.
 * @param {object[]} catalog Every catalog item.
 * @param {Object<string, number>} stockOverrides Manager edits, keyed by item id.
 * @returns {object[]} Up to three in stock items from the same category.
 */
export function findSubstitutes(item, catalog, stockOverrides = {}) {
  return catalog
    .filter(
      (candidate) =>
        candidate.categoryId === item.categoryId &&
        candidate.id !== item.id &&
        stockFor(candidate, stockOverrides) > 0
    )
    .sort(
      (a, b) => Math.abs(a.priceCents - item.priceCents) - Math.abs(b.priceCents - item.priceCents)
    )
    .slice(0, SUBSTITUTE_COUNT);
}
