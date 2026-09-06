/**
 * Sales reporting: filter a date range, group it, measure it, and compare it.
 *
 * The rating sheet asks for reports the user can customise and analyse, and those
 * are two different jobs. Customising is choosing the range, the grouping, and the
 * measure, which is what buildReport does. Analysing is knowing whether a number is
 * good, which needs something to compare against, which is what
 * compareWithPreviousPeriod adds.
 *
 * A figure on its own says nothing. Two thousand dollars of pie is only meaningful
 * next to what the same stretch of days did last time.
 *
 * Pure functions over an array of orders. The manager screen passes in whatever the
 * controls are set to and renders whatever comes back.
 */

import { CANCELLED } from './orders.js';

/** Every way the rows can be grouped, with the label the dropdown shows. */
export const GROUP_BY_OPTIONS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'category', label: 'Menu category' },
  { id: 'item', label: 'Item' },
  { id: 'location', label: 'Restaurant' },
  { id: 'orderType', label: 'Order type' },
  { id: 'hour', label: 'Hour of day' },
];

/** Every measure, with how it is shown. */
export const METRIC_OPTIONS = [
  { id: 'revenue', label: 'Revenue', isMoney: true },
  { id: 'units', label: 'Items sold', isMoney: false },
  { id: 'orders', label: 'Order count', isMoney: false },
  { id: 'averageOrder', label: 'Average order value', isMoney: true },
];

/**
 * Reads the calendar date out of an order.
 *
 * @param {object} order An order.
 * @returns {string} An ISO date such as '2026-08-14'.
 */
export function orderDate(order) {
  return order.placedAt.slice(0, 10);
}

/**
 * Narrows a list of orders to the ones a report should count.
 *
 * Cancelled orders are always excluded. They were never revenue, and counting them
 * would overstate every figure on the screen.
 *
 * @param {object[]} orders Every order.
 * @param {object} filters What to keep.
 * @param {string} filters.startDate ISO date, included.
 * @param {string} filters.endDate ISO date, included.
 * @param {string} [filters.locationId] Keep only this restaurant.
 * @param {string} [filters.orderTypeId] Keep only this order type.
 * @returns {object[]} The orders that count.
 */
export function filterOrders(orders, { startDate, endDate, locationId, orderTypeId }) {
  return orders.filter((order) => {
    if (order.status === CANCELLED) {
      return false;
    }
    const date = orderDate(order);
    if (date < startDate || date > endDate) {
      return false;
    }
    if (locationId && order.locationId !== locationId) {
      return false;
    }
    if (orderTypeId && order.orderTypeId !== orderTypeId) {
      return false;
    }
    return true;
  });
}

/**
 * Works out which bucket an order, or one line of it, belongs in.
 *
 * Most groupings are a property of the order. Category and item are properties of a
 * line, so those two return one key per line and the caller splits the order up.
 *
 * @param {string} groupBy One of the GROUP_BY_OPTIONS ids.
 * @param {object} order The order.
 * @param {object} [line] One line of it, needed for category and item.
 * @returns {string} The bucket key.
 */
export function groupKeyFor(groupBy, order, line) {
  if (groupBy === 'day') {
    return orderDate(order);
  }
  if (groupBy === 'week') {
    const date = new Date(order.placedAt);
    date.setDate(date.getDate() - date.getDay());
    return `Week of ${date.toISOString().slice(0, 10)}`;
  }
  if (groupBy === 'hour') {
    return String(new Date(order.placedAt).getHours()).padStart(2, '0') + ':00';
  }
  if (groupBy === 'location') {
    return order.locationId;
  }
  if (groupBy === 'orderType') {
    return order.orderTypeId;
  }
  if (groupBy === 'category') {
    return line.categoryId;
  }
  return line.itemId;
}

/** Groupings that split an order across its lines rather than counting it whole. */
const LINE_LEVEL_GROUPINGS = ['category', 'item'];

/**
 * Builds the report table.
 *
 * Revenue is taken from the order total for order level groupings and from the line
 * value for line level ones. That distinction matters: an order's tax and delivery
 * fee belong to the order, not to any one pie in it, so a report grouped by item
 * shows what the food sold for rather than inventing a share of the tax.
 *
 * @param {object[]} orders Every order.
 * @param {object} options What the manager asked for.
 * @param {string} options.startDate ISO date, included.
 * @param {string} options.endDate ISO date, included.
 * @param {string} options.groupBy One of the GROUP_BY_OPTIONS ids.
 * @param {string} [options.locationId] Restrict to one restaurant.
 * @param {string} [options.orderTypeId] Restrict to one order type.
 * @returns {{rows: object[], totals: object, orderCount: number}} The report.
 */
export function buildReport(orders, options) {
  const kept = filterOrders(orders, options);
  const isLineLevel = LINE_LEVEL_GROUPINGS.includes(options.groupBy);
  const buckets = new Map();

  /**
   * Finds or starts the bucket for a key.
   *
   * @param {string} key The bucket key.
   * @returns {object} The bucket.
   */
  function bucketFor(key) {
    if (!buckets.has(key)) {
      buckets.set(key, { key, revenue: 0, units: 0, orders: 0, orderIds: new Set() });
    }
    return buckets.get(key);
  }

  for (const order of kept) {
    if (isLineLevel) {
      for (const line of order.lines) {
        const bucket = bucketFor(groupKeyFor(options.groupBy, order, line));
        bucket.revenue += line.priceCents * line.quantity;
        bucket.units += line.quantity;
        bucket.orderIds.add(order.orderNumber);
      }
    } else {
      const bucket = bucketFor(groupKeyFor(options.groupBy, order));
      bucket.revenue += order.totals.total;
      bucket.units += order.lines.reduce((sum, line) => sum + line.quantity, 0);
      bucket.orderIds.add(order.orderNumber);
    }
  }

  const rows = [...buckets.values()].map((bucket) => ({
    key: bucket.key,
    revenue: bucket.revenue,
    units: bucket.units,
    orders: bucket.orderIds.size,
    averageOrder:
      bucket.orderIds.size === 0 ? 0 : Math.round(bucket.revenue / bucket.orderIds.size),
  }));

  const totalRevenue = kept.reduce((sum, order) => sum + order.totals.total, 0);
  const totalUnits = kept.reduce(
    (sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0
  );

  return {
    rows,
    orderCount: kept.length,
    totals: {
      revenue: totalRevenue,
      units: totalUnits,
      orders: kept.length,
      averageOrder: kept.length === 0 ? 0 : Math.round(totalRevenue / kept.length),
    },
  };
}

/**
 * Sorts report rows by one measure.
 *
 * @param {object[]} rows Rows from buildReport.
 * @param {string} metric One of the METRIC_OPTIONS ids.
 * @param {string} [direction] 'desc' by default, or 'asc'.
 * @returns {object[]} A new, sorted array.
 */
export function sortRows(rows, metric, direction = 'desc') {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => factor * (a[metric] - b[metric]) || a.key.localeCompare(b.key));
}

/**
 * Finds the range of the same length immediately before the chosen one.
 *
 * Comparing June against May would be comparing 30 days against 31. This shifts the
 * window back by its own length instead, so the two stretches are the same size and
 * the percentage change means something.
 *
 * @param {string} startDate ISO date.
 * @param {string} endDate ISO date.
 * @returns {{startDate: string, endDate: string}} The preceding range.
 */
export function previousPeriod(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.round((end - start) / 86400000) + 1;

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (days - 1));

  return {
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: previousEnd.toISOString().slice(0, 10),
  };
}

/**
 * Works out the percentage change between two figures.
 *
 * Growth from zero has no meaningful percentage, so it is reported as null and the
 * screen shows a dash. Printing "infinity percent up" would be worse than saying
 * nothing.
 *
 * @param {number} current The figure now.
 * @param {number} previous The figure before.
 * @returns {number|null} The percentage change, or null when there is no baseline.
 */
export function percentChange(current, previous) {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Builds the report with the preceding period alongside it.
 *
 * @param {object[]} orders Every order.
 * @param {object} options The same options buildReport takes.
 * @returns {{current: object, previous: object, rows: object[], range: object}}
 *   The report, the baseline, and rows carrying both plus the change between them.
 */
export function compareWithPreviousPeriod(orders, options) {
  const current = buildReport(orders, options);
  const range = previousPeriod(options.startDate, options.endDate);
  const previous = buildReport(orders, { ...options, ...range });

  const previousByKey = new Map(previous.rows.map((row) => [row.key, row]));
  const metric = options.metric ?? 'revenue';

  const rows = current.rows.map((row) => {
    const before = previousByKey.get(row.key);
    const previousValue = before ? before[metric] : 0;
    return {
      ...row,
      previousValue,
      changePercent: percentChange(row[metric], previousValue),
    };
  });

  return { current, previous, rows, range };
}
