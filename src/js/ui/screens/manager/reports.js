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

        el('section', { class: 'insights' }, [
          el('h2', { class: 'insights__title', text: 'What the numbers say' }),
          el(
            'ul',
            { class: 'insights__list' },
            insights.map((line) => el('li', { text: line }))
          ),
        ]),

        el('div', { class: 'summary-tiles' }, [
          summaryTile(
            'Revenue',
            formatUSD(comparison.current.totals.revenue),
            formatUSD(comparison.previous.totals.revenue)
          ),
          summaryTile(
            'Orders',
            String(comparison.current.totals.orders),
            String(comparison.previous.totals.orders)
          ),
          summaryTile(
            'Items sold',
            String(comparison.current.totals.units),
            String(comparison.previous.totals.units)
          ),
          summaryTile(
            'Average order',
            formatUSD(comparison.current.totals.averageOrder),
            formatUSD(comparison.previous.totals.averageOrder)
          ),
        ]),

        barChart({
          rows,
          metric: view.metric,
          labelFor: labelForKey,
          formatValue: (value) => formatMetric(value, view.metric),
          title: `${METRIC_OPTIONS.find((option) => option.id === view.metric).label} by ${GROUP_BY_OPTIONS.find((option) => option.id === view.groupBy).label.toLowerCase()}`,
        }),

        reportTable(rows, draw),

        el('div', { class: 'row' }, [
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
        ]),
        csvFallback,
      ]);
    }

    draw();
  });
}
