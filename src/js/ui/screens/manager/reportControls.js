/**
 * The reports control panel, and getting the numbers back out as CSV.
 *
 * Split from the screen itself so neither file has to be read in full to change the
 * other. The controls are the customizing half of what the rating sheet asks for:
 * a range, two filters, seven groupings, and four measures.
 */

import { el, render } from '../../dom.js';
import { showToast } from '../../components/toast.js';
import { LOCATIONS } from '../../../data/locations.js';
import { ORDER_TYPES } from '../../../app/store.js';
import { GROUP_BY_OPTIONS, METRIC_OPTIONS } from '../../../domain/reports.js';
import { toCsv } from '../../../domain/csv.js';
import { RANGE_PRESETS, isoDaysAgo, labelForKey, view } from './reportView.js';

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
export function exportCsv(rows, fallbackHost) {
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
 * Builds one headline figure with its previous period underneath.
 *
 * @param {string} label What the figure is.
 * @param {string} value The figure now.
 * @param {string} previous The same figure last period.
 * @returns {HTMLElement} The tile.
 */
export function summaryTile(label, value, previous) {
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
export function controls(onChange) {
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
