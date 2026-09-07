/**
 * Sales reports.
 *
 * The rating sheet asks for reports the user can customize and analyze, and this
 * screen is built around both halves of that.
 *
 * Customize is the control panel in reportControls.js: a date range, filters for
 * restaurant and order type, seven ways to group the rows, four measures, and
 * sortable columns.
 *
 * Analyze is what sits above the table: the same window measured against the
 * preceding window of equal length, a percentage change on every row, and sentences
 * from domain/insights.js naming what moved. Numbers alone do not tell a manager
 * whether a week was good.
 *
 * This file only assembles those pieces. The figures come from domain/reports.js,
 * which is tested on its own.
 */

import { el, render } from '../../dom.js';
import { barChart } from '../../components/barChart.js';
import { managerTabs, withManagerAccess } from './shell.js';
import { getState } from '../../../app/store.js';
import { ALL_ITEMS } from '../../../data/menu.js';
import {
  GROUP_BY_OPTIONS,
  METRIC_OPTIONS,
  buildReport,
  compareWithPreviousPeriod,
  sortRows,
} from '../../../domain/reports.js';
import { buildInsights } from '../../../domain/insights.js';
import { stockFor } from '../../../domain/inventory.js';
import { isDateRangeUsable } from '../../../domain/orderRules.js';
import { formatUSD } from '../../../domain/money.js';
import { controls, exportCsv, summaryTile } from './reportControls.js';
import { reportTable } from './reportTable.js';
import { formatMetric, labelForKey, view } from './reportView.js';

/**
 * Builds the sentences generated from the report.
 *
 * A manager reading a table of numbers still has to work out what changed. These say
 * it outright, which is the difference between a report that can be analyzed and one
 * that merely can be read.
 *
 * @param {string[]} insights Sentences from domain/insights.js.
 * @returns {HTMLElement} The section.
 */
function insightsSection(insights) {
  return el('section', { class: 'insights' }, [
    el('h2', { class: 'insights__title', text: 'What the numbers say' }),
    el(
      'ul',
      { class: 'insights__list' },
      insights.map((line) => el('li', { text: line }))
    ),
  ]);
}

/**
 * Builds the four headline figures, each against the same figure last period.
 *
 * @param {object} comparison The result of compareWithPreviousPeriod.
 * @returns {HTMLElement} The row of tiles.
 */
function summaryTiles(comparison) {
  const now = comparison.current.totals;
  const before = comparison.previous.totals;
  return el('div', { class: 'summary-tiles' }, [
    summaryTile('Revenue', formatUSD(now.revenue), formatUSD(before.revenue)),
    summaryTile('Orders', String(now.orders), String(before.orders)),
    summaryTile('Items sold', String(now.units), String(before.units)),
    summaryTile('Average order', formatUSD(now.averageOrder), formatUSD(before.averageOrder)),
  ]);
}

/**
 * Builds the two ways to get the report off the screen.
 *
 * @param {object[]} rows The rows currently shown.
 * @param {HTMLElement} csvFallback Where the CSV goes when a download is refused.
 * @returns {HTMLElement} The button row.
 */
function takeAwayRow(rows, csvFallback) {
  return el('div', { class: 'row' }, [
    el(
      'button',
      {
        class: 'button button--secondary',
        type: 'button',
        onClick: () => exportCsv(rows, csvFallback),
      },
      'Export CSV'
    ),
    el(
      'button',
      { class: 'button button--secondary', type: 'button', onClick: () => window.print() },
      'Print this report'
    ),
  ]);
}

/**
 * Renders the reports screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderManagerReports(container) {
  withManagerAccess(container, '/manager/reports', () => {
    /**
     * Rebuilds the report for whatever the controls currently say.
     *
     * Every control calls this, so the filters, the grouping, the metric, the chart,
     * the insights, and the table can never disagree about which report is on screen.
     *
     * @returns {void}
     */
    function draw() {
      const state = getState();
      const rangeCheck = isDateRangeUsable(view.startDate, view.endDate);

      if (!rangeCheck.valid) {
        render(container, [
          el('div', { class: 'page-head' }, [el('h1', { text: 'Reports' })]),
          managerTabs('/manager/reports'),
          controls(draw),
          el('div', { class: 'banner banner--danger', role: 'alert' }, rangeCheck.message),
        ]);
        return;
      }

      const options = {
        startDate: view.startDate,
        endDate: view.endDate,
        locationId: view.locationId || undefined,
        orderTypeId: view.orderTypeId || undefined,
        groupBy: view.groupBy,
        metric: view.metric,
      };

      const comparison = compareWithPreviousPeriod(state.orders, options);
      const rows = sortRows(comparison.rows, view.metric, view.sortDirection);
      const hourReport = buildReport(state.orders, { ...options, groupBy: 'hour' });

      const insights = buildInsights({
        rows: sortRows(comparison.rows, 'revenue'),
        current: comparison.current.totals,
        previous: comparison.previous.totals,
        hourRows: hourReport.rows,
        labelFor: labelForKey,
        catalog: ALL_ITEMS,
        stockOverrides: state.stockOverrides,
        stockFor,
      });

      const csvFallback = el('div', { class: 'csv-fallback' });

      render(container, [
        el('div', { class: 'page-head' }, [
          el('h1', { text: 'Reports' }),
          el('p', {
            class: 'page-head__lede',
            text: `${view.startDate} to ${view.endDate}, measured against ${comparison.range.startDate} to ${comparison.range.endDate}.`,
          }),
        ]),
        managerTabs('/manager/reports'),
        controls(draw),

        insightsSection(insights),

        summaryTiles(comparison),

        barChart({
          rows,
          metric: view.metric,
          labelFor: labelForKey,
          formatValue: (value) => formatMetric(value, view.metric),
          title: `${METRIC_OPTIONS.find((option) => option.id === view.metric).label} by ${GROUP_BY_OPTIONS.find((option) => option.id === view.groupBy).label.toLowerCase()}`,
        }),

        reportTable(rows, draw),

        takeAwayRow(rows, csvFallback),
        csvFallback,
      ]);
    }

    draw();
  });
}
