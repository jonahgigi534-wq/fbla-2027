/**
 * The cart: adding, changing, and removing lines.
 *
 * Every function returns a new array instead of changing the one it was given. The
 * store replaces state wholesale on each update, so a function that edited the
 * existing array would change what other screens are still holding and make a bug
 * appear somewhere far from its cause.
 *
 * A line copies the item's name and price rather than only its id. A cart becomes an
 * order, and an order is a record of what was actually charged. If the restaurant
 * raises the price of a pie next week, last week's receipt has to keep saying what
 * the customer paid.
 */

/**
 * Builds a cart line from a catalog item.
 *
 * @param {object} item A finished catalog item from data/menu.js.
 * @param {number} quantity How many to add.
 * @param {string} [note] Special instructions for the kitchen.
 * @returns {object} A new cart line.
 */
export function createLine(item, quantity, note = '') {
  return {
    lineId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId: item.id,
    name: item.name,
    priceCents: item.priceCents,
    categoryId: item.categoryId,
    leadTimeHours: item.leadTimeHours,
    quantity,
    note: note.trim(),
  };
}

/**
 * Adds an item to the cart.
 *
 * An identical line, meaning the same item with the same instructions, has its
 * quantity raised rather than appearing twice. Two slices of the same pie with
 * different instructions do stay on separate lines, because the kitchen needs them
 * separate.
 *
 * @param {object[]} lines Current cart lines.
 * @param {object} item The catalog item being added.
 * @param {number} quantity How many to add.
 * @param {string} [note] Special instructions for the kitchen.
 * @returns {object[]} A new cart.
 */
export function addToCart(lines, item, quantity, note = '') {
  const trimmedNote = note.trim();
  const existing = lines.find((line) => line.itemId === item.id && line.note === trimmedNote);

  if (existing) {
    return lines.map((line) =>
      line.lineId === existing.lineId ? { ...line, quantity: line.quantity + quantity } : line
    );
  }
  return [...lines, createLine(item, quantity, trimmedNote)];
}

/**
 * Changes the quantity on one line.
 *
 * A quantity of zero or less removes the line rather than leaving an empty one in
 * the cart, which is what a customer means when they press minus on the last one.
 *
 * @param {object[]} lines Current cart lines.
 * @param {string} lineId The line to change.
 * @param {number} quantity The new quantity.
 * @returns {object[]} A new cart.
 */
export function setLineQuantity(lines, lineId, quantity) {
  if (quantity <= 0) {
    return removeLine(lines, lineId);
  }
  return lines.map((line) => (line.lineId === lineId ? { ...line, quantity } : line));
}

/**
 * Removes one line.
 *
 * @param {object[]} lines Current cart lines.
 * @param {string} lineId The line to remove.
 * @returns {object[]} A new cart.
 */
export function removeLine(lines, lineId) {
  return lines.filter((line) => line.lineId !== lineId);
}

/**
 * Counts everything in the cart, for the badge on the cart button.
 *
 * @param {object[]} lines Current cart lines.
 * @returns {number} The total number of items, not the number of lines.
 */
export function countItems(lines) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/**
 * Finds the longest notice any line in the cart requires.
 *
 * A cart holding one catering tray cannot be collected in twenty minutes just
 * because everything else in it is a coffee, so checkout schedules against the
 * slowest thing in the order.
 *
 * @param {object[]} lines Current cart lines.
 * @returns {number} Hours of notice needed, which is 0 for an everyday order.
 */
export function longestLeadTimeHours(lines) {
  return lines.reduce((longest, line) => Math.max(longest, line.leadTimeHours ?? 0), 0);
}
