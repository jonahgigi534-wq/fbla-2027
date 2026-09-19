/**
 * The reports results table.
 *
 * Each measure heading is a button that sorts by it, which is what anyone who has
 * used a spreadsheet already expects. The last column carries the same figure from
 * the preceding period, because a number on its own says nothing.
 */

import { el } from '../../dom.js';
import { GROUP_BY_OPTIONS, METRIC_OPTIONS } from '../../../domain/reports.js';
import { formatMetric, labelForKey, view } from './reportView.js';

/**
 * Builds the results table.
 *
 * The header for the chosen measure is a button that flips the sort, which is the
 * behavior anyone who has used a spreadsheet already expects.
 *
 * @param {object[]} rows Rows to show, already sorted.
 * @param {Function} onChange Called when the sort direction flips.
 * @param {boolean} [isPreviousComplete] Whether the history spans the preceding
 *   period. When it does not there is no comparison to draw, and the column says so
 *   once rather than labelling every row as new.
 * @returns {HTMLElement} The table, in a horizontally scrollable wrapper.
 */
export function reportTable(rows, onChange, isPreviousComplete = true) {
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
    el('th', {
      scope: 'col',
      class: 'numeric',
      text: isPreviousComplete ? 'vs previous' : 'vs previous (none)',
    }),
  ]);

  const body = rows.map((row) =>
    el('tr', {}, [
      el('th', { scope: 'row', text: labelForKey(row.key) }),
      ...METRIC_OPTIONS.map((option) =>
        el('td', { class: 'numeric', text: formatMetric(row[option.id], option.id) })
      ),
      el('td', { class: 'numeric' }, [
        row.changePercent === null
          ? el('span', {
              class: 'muted',
              // Nothing before it at all reads as new. Nothing before the whole
              // period reads as no baseline, which is a different thing to say.
              text: isPreviousComplete ? 'new' : '—',
            })
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
