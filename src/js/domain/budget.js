/**
 * The spending cap a customer can set on their own order.
 *
 * The assigned topic asks the program to account for customer budget constraints.
 * A warning alone would satisfy the letter of that, but not the situation: someone
 * ordering lunch for a table on a fixed amount does not want to be told they are
 * over, they want to know what to take off.
 *
 * So this module does three things. It reports where the order stands against the
 * cap, it warns before the cap is reached rather than after, and when the order is
 * over it works out the smallest set of lines to remove to get back under.
 *
 * The cap is checked against the order total including tax and fees, because that
 * is the number that leaves the customer's account.
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
 * Prefers the cheapest single line that covers the shortfall. Someone two dollars
 * over should not be told to remove the twenty dollar steak, which is what a plain
 * most-expensive-first rule would say.
 *
 * When no single line is enough, it falls back to taking the largest lines first
 * until the gap is closed. That is not the mathematically optimal set, which would
 * be a knapsack problem, but it is the choice a person makes at a till and it
 * reaches an answer in one pass.
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
