/**
 * What the restaurant actually has, and what to do when it runs out.
 *
 * The assigned topic asks the program to handle unavailable items and inventory
 * limits, and this is where both live. Two things make that more than a stock number:
 *
 *   - Stock is checked against what is already in the cart, not just the catalog.
 *     A customer holding the last four slices of key lime cannot add a fifth.
 *   - When something sells out, the customer is offered a substitute from the same
 *     category rather than a dead end.
 *
 * Pure functions. The live stock numbers arrive as arguments so the manager's
 * adjustments and the catalog defaults go through exactly the same rules.
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
 * Counts how many of one item are already in the cart.
 *
 * An item can appear on more than one cart line, because two lines can carry
 * different special instructions, so this adds them up rather than finding one.
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
 * The message names the number left rather than saying the request failed, because
 * a customer who knows three are available can decide to take three.
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
 * Candidates come from the same category, so a sold out key lime pie offers other
 * pies rather than an omelette, and are ordered by how close they are in price so
 * the first suggestion does not cost twice as much.
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
