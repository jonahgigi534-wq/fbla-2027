/**
 * Sales reports.
 *
 * The rating sheet asks for reports the user can customise and analyse, so this
 * screen is built around both halves of that.
 *
 * Customise is the control panel: a date range, filters for restaurant and order
 * type, seven ways to group the rows, four measures to plot, and sortable columns.
 *
 * Analyse is what sits above the table: the same window measured against the
 * preceding window of equal length, a percentage change on every row, and sentences
 * that name what moved. Numbers alone do not tell a manager whether a week was good.
 *
 * The whole thing runs off domain/reports.js and domain/insights.js, so what is on
 * screen is only ever a rendering of figures that are tested elsewhere.
 */

import { el, render } from '../../dom.js';
import { showToast } from '../../components/toast.js';
import { barChart } from '../../components/barChart.js';
import { managerTabs, withManagerAccess } from './shell.js';
import { getState } from '../../../app/store.js';
import { ALL_ITEMS, findCategory, findItem } from '../../../data/menu.js';
import { LOCATIONS, findLocation } from '../../../data/locations.js';
import { ORDER_TYPES } from '../../../app/store.js';
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
import { toCsv } from '../../../domain/csv.js';

/** Ready made ranges, because typing two dates to see last week is tedious. */
const RANGE_PRESETS = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
];

/**
 * Returns an ISO date a number of days before today.
 *
 * @param {number} daysAgo How far back.
 * @returns {string} An ISO date such as '2026-08-07'.
 */
function isoDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

/** What the manager has the controls set to. Kept across visits to the screen. */
const view = {
  startDate: isoDaysAgo(29),
  endDate: isoDaysAgo(0),
  locationId: '',
  orderTypeId: '',
  groupBy: 'category',
  metric: 'revenue',
  sortDirection: 'desc',
};

/**
 * Turns a row key into something readable.
 *
 * Keys are ids for items, categories, and restaurants, and already readable for the
 * date and hour groupings.
 *
 * @param {string} key The row key.
 * @returns {string} A name a person would recognise.
 */
function labelForKey(key) {
  if (view.groupBy === 'item') {
    return findItem(key)?.name ?? key;
  }
  if (view.groupBy === 'category') {
    return findCategory(key)?.name ?? key;
  }
  if (view.groupBy === 'location') {
    return findLocation(key)?.name ?? key;
  }
  if (view.groupBy === 'orderType') {
    return ORDER_TYPES.find((type) => type.id === key)?.label ?? key;
  }
  return key;
}

/**
 * Formats a measure for display.
 *
 * @param {number} value The figure.
 * @param {string} metric Which measure it is.
 * @returns {string} Money or a plain count.
 */
function formatMetric(value, metric) {
  const option = METRIC_OPTIONS.find((candidate) => candidate.id === metric);
  return option && option.isMoney ? formatUSD(value) : String(value);
}

/**
 * Offers the current table as a CSV file.
 *
 * A blob download is tried first. Opening the offline build from a file:// address
 * can block that, so a failure falls back to putting the CSV in a text box the
 * manager can select and copy. Either way the numbers get out.
 *
 * @param {object[]} rows The rows currently on screen.
 * @param {HTMLElement} fallbackHost Where to put the text box if the download fails.
 * @returns {void}
 */
function exportCsv(rows, fallbackHost) {
  const headers = [
    'Group',
    'Revenue',
    'Items sold',
    'Orders',
    'Average order',
    'Previous',
    'Change %',
  ];
  const body = rows.map((row) => [
    labelForKey(row.key),
    (row.revenue / 100).toFixed(2),
    row.units,
    row.orders,
    (row.averageOrder / 100).toFixed(2),
    (row.previousValue / 100).toFixed(2),
    row.changePercent === null ? '' : row.changePercent,
  ]);
  const csv = toCsv(headers, body);

  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = el('a', {
      href: url,
      download: `house-of-pies-report-${view.startDate}-to-${view.endDate}.csv`,
    });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Report downloaded as CSV.');
  } catch {
    render(fallbackHost, [
      el('p', {
        class: 'field__hint',
        text: 'This browser blocked the download, so here is the CSV to copy instead.',
      }),
      el('textarea', { class: 'field__control', rows: '8', readonly: true }, csv),
    ]);
    showToast('Download blocked here. The CSV is on screen to copy.', 'error');
  }
}

/**
 * Builds one labelled dropdown.
 *
 * @param {string} id Element id.
 * @param {string} label Visible label.
 * @param {Array<{id: string, label: string}>} options What to choose from.
 * @param {string} value The current value.
 * @param {Function} onChange Called with the new value.
 * @returns {HTMLElement} The field.
 */
function selectField(id, label, options, value, onChange) {
  return el('label', { class: 'field', for: id }, [
    el('span', { class: 'field__label', text: label }),
    el(
      'select',
      { class: 'field__control', id, onChange: (event) => onChange(event.target.value) },
      options.map((option) =>
        el('option', { value: option.id, selected: option.id === value }, option.label)
      )
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

/**
 * Builds one headline figure with its previous period underneath.
 *
 * @param {string} label What the figure is.
 * @param {string} value The figure now.
 * @param {string} previous The same figure last period.
 * @returns {HTMLElement} The tile.
 */
function summaryTile(label, value, previous) {
  return el('div', { class: 'summary-tile' }, [
    el('p', { class: 'summary-tile__label', text: label }),
    el('p', { class: 'summary-tile__value', text: value }),
    el('p', { class: 'summary-tile__previous', text: `was ${previous}` }),
  ]);
}

/**
 * Builds the control panel.
 *
 * @param {Function} onChange Called after any control changes.
 * @returns {HTMLElement} The panel.
 */
function controls(onChange) {
  const startField = el('input', {
    class: 'field__control',
    id: 'report-start',
    type: 'date',
    value: view.startDate,
    onChange: (event) => {
      view.startDate = event.target.value;
      onChange();
    },
  });
  const endField = el('input', {
    class: 'field__control',
    id: 'report-end',
    type: 'date',
    value: view.endDate,
    onChange: (event) => {
      view.endDate = event.target.value;
      onChange();
    },
  });

  return el('div', { class: 'report-controls' }, [
    el(
      'div',
      { class: 'filter-row' },
      RANGE_PRESETS.map((preset) =>
        el(
          'button',
          {
            class: 'chip',
            type: 'button',
            onClick: () => {
              view.startDate = isoDaysAgo(preset.days - 1);
              view.endDate = isoDaysAgo(0);
              onChange();
            },
          },
          preset.label
        )
      )
    ),
    el('div', { class: 'report-controls__grid' }, [
      el('label', { class: 'field', for: 'report-start' }, [
        el('span', { class: 'field__label', text: 'From' }),
        startField,
      ]),
      el('label', { class: 'field', for: 'report-end' }, [
        el('span', { class: 'field__label', text: 'To' }),
        endField,
      ]),
      selectField(
        'report-location',
        'Restaurant',
        [
          { id: '', label: 'All six' },
          ...LOCATIONS.map((location) => ({ id: location.id, label: location.name })),
        ],
        view.locationId,
        (value) => {
          view.locationId = value;
          onChange();
        }
      ),
      selectField(
        'report-type',
        'Order type',
        [{ id: '', label: 'All types' }, ...ORDER_TYPES],
        view.orderTypeId,
        (value) => {
          view.orderTypeId = value;
          onChange();
        }
      ),
      selectField('report-group', 'Group by', GROUP_BY_OPTIONS, view.groupBy, (value) => {
        view.groupBy = value;
        onChange();
      }),
      selectField('report-metric', 'Measure', METRIC_OPTIONS, view.metric, (value) => {
        view.metric = value;
        onChange();
      }),
    ]),
  ]);
}

/**
 * Builds the results table.
 *
 * The header for the chosen measure is a button that flips the sort, which is the
 * behaviour anyone who has used a spreadsheet already expects.
 *
 * @param {object[]} rows Rows to show, already sorted.
 * @param {Function} onChange Called when the sort direction flips.
 * @returns {HTMLElement} The table, in a horizontally scrollable wrapper.
 */
function reportTable(rows, onChange) {
  if (rows.length === 0) {
    return el(
      'div',
      { class: 'banner banner--info' },
      'No orders fall inside this range and these filters.'
    );
  }

  const sortIndicator = view.sortDirection === 'desc' ? ' ▼' : ' ▲';

  const header = el('tr', {}, [
    el('th', {
      scope: 'col',
      text: GROUP_BY_OPTIONS.find((option) => option.id === view.groupBy).label,
    }),
    ...METRIC_OPTIONS.map((option) =>
      el('th', { scope: 'col', class: 'numeric' }, [
        el(
          'button',
          {
            class: 'table__sort',
            type: 'button',
            onClick: () => {
              if (view.metric === option.id) {
                view.sortDirection = view.sortDirection === 'desc' ? 'asc' : 'desc';
              } else {
                view.metric = option.id;
                view.sortDirection = 'desc';
              }
              onChange();
            },
          },
          option.label + (view.metric === option.id ? sortIndicator : '')
        ),
      ])
    ),
    el('th', { scope: 'col', class: 'numeric', text: 'vs previous' }),
  ]);

  const body = rows.map((row) =>
    el('tr', {}, [
      el('th', { scope: 'row', text: labelForKey(row.key) }),
      ...METRIC_OPTIONS.map((option) =>
        el('td', { class: 'numeric', text: formatMetric(row[option.id], option.id) })
      ),
      el('td', { class: 'numeric' }, [
        row.changePercent === null
          ? el('span', { class: 'muted', text: 'new' })
          : el('span', {
              class: `change ${row.changePercent >= 0 ? 'change--up' : 'change--down'}`,
              text: `${row.changePercent > 0 ? '+' : ''}${row.changePercent}%`,
            }),
      ]),
    ])
  );

  return el('div', { class: 'table-wrap' }, [
    el('table', { class: 'table' }, [
      el('caption', {
        class: 'visually-hidden',
        text: 'Sales report. Each column heading sorts by that measure.',
      }),
      el('thead', {}, [header]),
      el('tbody', {}, body),
    ]),
  ]);
}
