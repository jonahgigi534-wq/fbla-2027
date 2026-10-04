/**
 * The spending cap a customer can set on their own order.
 *
 * Going over names what to take off, not just that the order is over. The limit is
 * checked against the total with tax, the figure that leaves the customer's account.
 */

/** Warn once the order reaches this share of the cap, in basis points. */
const WARNING_THRESHOLD_BASIS_POINTS = 8500;

/** Basis points in 100 percent. */
const BASIS_POINTS_PER_WHOLE = 10000;

/** The three states an order can be in relative to its cap. */
export const BUDGET_STATUS = {
  under: 'under',
  close: 'close',
  over: 'over',
};

/**
 * Reports where an order stands against the customer's cap.
 *
 * @param {number} totalCents The order total, including tax and any fees.
 * @param {number|null} capCents The cap, or null when the customer has not set one.
 * @returns {{status: string, capCents: number|null, remainingCents: number,
 *   overByCents: number, usedBasisPoints: number}} Where the order stands.
 */
export function evaluateBudget(totalCents, capCents) {
  if (capCents === null || capCents === undefined) {
    return {
      status: BUDGET_STATUS.under,
      capCents: null,
      remainingCents: 0,
      overByCents: 0,
      usedBasisPoints: 0,
    };
  }

  const usedBasisPoints = Math.round((totalCents / capCents) * BASIS_POINTS_PER_WHOLE);
  let status = BUDGET_STATUS.under;
  if (totalCents > capCents) {
    status = BUDGET_STATUS.over;
  } else if (usedBasisPoints >= WARNING_THRESHOLD_BASIS_POINTS) {
    status = BUDGET_STATUS.close;
  }

  return {
    status,
    capCents,
    remainingCents: Math.max(capCents - totalCents, 0),
    overByCents: Math.max(totalCents - capCents, 0),
    usedBasisPoints,
  };
}

/**
 * Works out which lines to drop to bring an order back under its cap.
 *
 * Prefers the cheapest single line that closes the gap, so two dollars over never
 * suggests removing the steak.
 *
 * @param {object[]} lines Current cart lines.
 * @param {number} overByCents How much the order exceeds the cap.
 * @returns {object[]} Lines to consider removing.
 */
export function suggestRemovals(lines, overByCents) {
  if (overByCents <= 0) {
    return [];
  }

  const lineValue = (line) => line.priceCents * line.quantity;
  const cheapestFirst = [...lines].sort((a, b) => lineValue(a) - lineValue(b));

  const singleLineThatCovers = cheapestFirst.find((line) => lineValue(line) >= overByCents);
  if (singleLineThatCovers) {
    return [singleLineThatCovers];
  }

  const suggestions = [];
  let saved = 0;
  for (const line of [...cheapestFirst].reverse()) {
    if (saved >= overByCents) {
      break;
    }
    suggestions.push(line);
    saved += lineValue(line);
  }
  return suggestions;
}
