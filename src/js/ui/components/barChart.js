/**
 * A bar chart, drawn as SVG by hand.
 *
 * No charting library. Every library worth using would have to be fetched from a CDN
 * or installed, and this program has to run with the wifi off, from a file on a disk.
 * A bar chart is a handful of rectangles and some text, so it is drawn here.
 *
 * SVG rather than canvas because it scales to any screen without going soft, prints
 * cleanly, and each bar can carry a title a screen reader will read out.
 *
 * The chart is decorative in the strict sense. Every number in it also appears in the
 * table underneath, and the chart is marked so assistive technology skips straight to
 * that table rather than reading out coordinates.
 */

import { el } from '../dom.js';

/** SVG namespace, needed because createElement does not work for SVG. */
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Drawing area, in SVG user units. The viewBox scales it to fit any container. */
const WIDTH = 720;
const HEIGHT = 260;
const PADDING_LEFT = 8;
const PADDING_BOTTOM = 34;
const PADDING_TOP = 16;

/** Most bars to draw before the rest are dropped as unreadable. */
const MAX_BARS = 12;

/**
 * Creates an SVG element with attributes.
 *
 * @param {string} tag SVG tag name.
 * @param {object} attributes Attributes to set.
 * @param {Array} [children] Child nodes.
 * @returns {SVGElement} The element.
 */
function svg(tag, attributes = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== null && value !== undefined) {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

/**
 * Shortens a label so it fits under a bar.
 *
 * @param {string} text The label.
 * @param {number} limit Longest allowed.
 * @returns {string} The label, truncated with an ellipsis if it was too long.
 */
function shorten(text, limit) {
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

/**
 * Draws a bar chart of report rows.
 *
 * @param {object} options What to draw.
 * @param {object[]} options.rows Rows from domain/reports.js, already sorted.
 * @param {string} options.metric Which measure to plot.
 * @param {Function} options.labelFor Turns a row key into a readable name.
 * @param {Function} options.formatValue Turns a value into display text.
 * @param {string} options.title What the chart shows, for the caption.
 * @returns {HTMLElement} A figure holding the chart and its caption.
 */
export function barChart({ rows, metric, labelFor, formatValue, title }) {
  const visible = rows.slice(0, MAX_BARS);

  if (visible.length === 0) {
    return el('figure', { class: 'chart chart--empty' }, [
      el('p', { class: 'muted', text: 'Nothing to chart for this range.' }),
    ]);
  }

  const highest = Math.max(...visible.map((row) => row[metric]), 1);
  const plotHeight = HEIGHT - PADDING_BOTTOM - PADDING_TOP;
  const slotWidth = (WIDTH - PADDING_LEFT * 2) / visible.length;
  const barWidth = Math.min(slotWidth * 0.62, 64);

  const bars = visible.flatMap((row, index) => {
    const value = row[metric];
    const barHeight = Math.max((value / highest) * plotHeight, 2);
    const x = PADDING_LEFT + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = PADDING_TOP + (plotHeight - barHeight);
    const label = labelFor(row.key);

    return [
      svg(
        'rect',
        {
          x,
          y,
          width: barWidth,
          height: barHeight,
          rx: 4,
          class: 'chart__bar',
        },
        [svg('title', {}, [document.createTextNode(`${label}: ${formatValue(value)}`)])]
      ),
      svg(
        'text',
        {
          x: x + barWidth / 2,
          y: y - 5,
          class: 'chart__value',
          'text-anchor': 'middle',
        },
        [document.createTextNode(formatValue(value))]
      ),
      svg(
        'text',
        {
          x: x + barWidth / 2,
          y: HEIGHT - PADDING_BOTTOM + 16,
          class: 'chart__label',
          'text-anchor': 'middle',
        },
        [document.createTextNode(shorten(label, 14))]
      ),
    ];
  });

  const baseline = svg('line', {
    x1: PADDING_LEFT,
    y1: PADDING_TOP + plotHeight,
    x2: WIDTH - PADDING_LEFT,
    y2: PADDING_TOP + plotHeight,
    class: 'chart__axis',
  });

  const canvas = svg(
    'svg',
    {
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
      class: 'chart__svg',
      // The table below carries the same numbers, so nothing is lost by skipping this.
      role: 'presentation',
      'aria-hidden': 'true',
    },
    [baseline, ...bars]
  );

  return el('figure', { class: 'chart' }, [
    canvas,
    el('figcaption', {
      class: 'chart__caption',
      text: `${title}. Top ${visible.length} of ${rows.length}. Full figures in the table below.`,
    }),
  ]);
}
