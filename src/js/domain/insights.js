/**
 * Turns a report into sentences a manager can act on.
 *
 * A table answers "what happened". This answers "so what". The rating sheet asks for
 * reports that let the user analyze the information, and a grid of numbers only does
 * that if the reader already knows what to look for. These sentences say which line
 * mattered, which direction it moved, and what is about to run out.
 *
 * Every sentence is derived from the same figures shown in the table, so nothing here
 * can claim something the table contradicts. Nothing is invented and nothing is
 * rounded in a flattering direction.
 *
 * Pure functions. The manager screen passes in the report it already built.
 */

import { formatUSD } from './money.js';

/** Below this many left, an item is called out as running down. */
const STOCKOUT_WARNING_LEVEL = 8;

/** How many low stock items to name before summarising the rest. */
const MAX_NAMED_ITEMS = 3;

/**
 * Describes a percentage change in words.
 *
 * @param {number|null} change The percentage change, or null when there is no baseline.
 * @returns {string} A phrase such as 'up 12%' or 'with nothing to compare against'.
 */
function describeChange(change) {
  if (change === null) {
    return 'with nothing to compare it against';
  }
  if (change === 0) {
    return 'level with the period before';
  }
  return `${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% on the period before`;
}

/**
 * Builds the headline sentence about the biggest earner.
 *
 * @param {object[]} rows Rows from compareWithPreviousPeriod, already sorted.
 * @param {number} totalRevenue Revenue across every row.
 * @param {Function} labelFor Turns a row key into a readable name.
 * @returns {string|null} The sentence, or null when there is nothing to say.
 */
export function topPerformerInsight(rows, totalRevenue, labelFor) {
  if (rows.length === 0 || totalRevenue === 0) {
    return null;
  }
  const best = rows[0];
  const share = Math.round((best.revenue / totalRevenue) * 100);
  return `${labelFor(best.key)} brought in ${formatUSD(best.revenue)}, ${share}% of the total, ${describeChange(best.changePercent)}.`;
}

/**
 * Builds a sentence about the busiest trading hour.
 *
 * @param {object[]} hourRows Rows from a report grouped by hour.
 * @returns {string|null} The sentence, or null when there is nothing to say.
 */
export function peakHourInsight(hourRows) {
  if (hourRows.length === 0) {
    return null;
  }
  const sorted = [...hourRows].sort((a, b) => b.revenue - a.revenue);
  const peak = sorted[0];
  const share = Math.round(
    (peak.revenue / hourRows.reduce((sum, row) => sum + row.revenue, 0)) * 100
  );
  return `The busiest hour is ${peak.key}, taking ${share}% of the period's revenue across ${peak.orders} orders.`;
}

/**
 * Builds a sentence naming what is about to run out.
 *
 * This is the one insight that is about the future rather than the past, and it is
 * the one a manager can act on this morning.
 *
 * @param {object[]} catalog Every catalog item.
 * @param {Object<string, number>} stockOverrides Live stock, keyed by item id.
 * @param {Function} stockFor Reads an item's current stock.
 * @returns {string|null} The sentence, or null when nothing is running low.
 */
export function stockWarningInsight(catalog, stockOverrides, stockFor) {
  const low = catalog
    .filter((item) => {
      const stock = stockFor(item, stockOverrides);
      return stock > 0 && stock <= STOCKOUT_WARNING_LEVEL;
    })
    .sort((a, b) => stockFor(a, stockOverrides) - stockFor(b, stockOverrides));

  const soldOut = catalog.filter((item) => stockFor(item, stockOverrides) === 0);

  if (low.length === 0 && soldOut.length === 0) {
    return null;
  }
  if (low.length === 0) {
    return `${soldOut.length} item${soldOut.length === 1 ? ' is' : 's are'} sold out and need restocking.`;
  }

  const named = low
    .slice(0, MAX_NAMED_ITEMS)
    .map((item) => `${item.name} (${stockFor(item, stockOverrides)})`);
  const rest = low.length - named.length;
  const tail = rest > 0 ? `, and ${rest} other${rest === 1 ? '' : 's'}` : '';
  const soldOutTail =
    soldOut.length > 0
      ? ` ${soldOut.length} item${soldOut.length === 1 ? ' is' : 's are'} already out.`
      : '';

  return `Running low: ${named.join(', ')}${tail}.${soldOutTail}`;
}

/**
 * Builds a sentence about how the period as a whole moved.
 *
 * @param {object} current Totals for the chosen range.
 * @param {object} previous Totals for the preceding range.
 * @returns {string|null} The sentence, or null when there is nothing to say.
 */
export function periodSummaryInsight(current, previous) {
  if (current.orders === 0) {
    return 'No orders fall inside this range.';
  }
  const revenueChange =
    previous.revenue === 0
      ? null
      : Math.round(((current.revenue - previous.revenue) / previous.revenue) * 1000) / 10;

  return `${current.orders} orders totalling ${formatUSD(current.revenue)}, ${describeChange(revenueChange)}. Average order ${formatUSD(current.averageOrder)}.`;
}

/**
 * Collects every insight worth showing, dropping the ones with nothing to say.
 *
 * @param {object} input Everything the sentences are built from.
 * @param {object[]} input.rows Compared rows, sorted by the chosen measure.
 * @param {object} input.current Totals for the chosen range.
 * @param {object} input.previous Totals for the preceding range.
 * @param {object[]} input.hourRows Rows from the same range grouped by hour.
 * @param {Function} input.labelFor Turns a row key into a readable name.
 * @param {object[]} input.catalog Every catalog item.
 * @param {Object<string, number>} input.stockOverrides Live stock.
 * @param {Function} input.stockFor Reads an item's current stock.
 * @returns {string[]} Sentences, in the order they should be shown.
 */
export function buildInsights({
  rows,
  current,
  previous,
  hourRows,
  labelFor,
  catalog,
  stockOverrides,
  stockFor,
}) {
  return [
    periodSummaryInsight(current, previous),
    topPerformerInsight(rows, current.revenue, labelFor),
    peakHourInsight(hourRows),
    stockWarningInsight(catalog, stockOverrides, stockFor),
  ].filter((sentence) => sentence !== null);
}
