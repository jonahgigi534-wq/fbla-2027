/**
 * Draws the pie wheel: a disc cut into slices, each holding one pie's photo.
 *
 * The disc is far wider than the screen and only its top edge shows, so the photos
 * sit in the outer band of each slice where they can be seen. Everything here is a
 * picture and is hidden from screen readers; ui/components/pieWheel.js puts the words
 * beside it.
 */

import { sliceAngle } from '../../domain/pieWheel.js';
import { el } from '../dom.js';

/** The SVG namespace, which createElement does not use. */
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Wheel radius in drawing units. The viewBox is centred on the wheel. */
const RADIUS = 1000;

/** The photo in each slice, and how far out from the middle its centre sits. */
const PHOTO_WIDTH = 540;
const PHOTO_HEIGHT = 405;
const PHOTO_DISTANCE = 800;

/** Where the rim's ring and the studs on it are drawn. */
const RIM_RADIUS = 990;
const STUD_RADIUS = 9;

/**
 * Builds an SVG element. The DOM helper makes HTML elements, which SVG ignores.
 *
 * @param {string} tag SVG tag name.
 * @param {object} attributes Attributes to set.
 * @param {Element[]} [children] Child elements.
 * @returns {SVGElement} The element.
 */
function svg(tag, attributes, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  node.append(...children);
  return node;
}

/**
 * A point on the wheel, measured clockwise from the top.
 *
 * @param {number} degrees Angle clockwise from straight up.
 * @param {number} distance How far out from the middle.
 * @returns {{x: number, y: number}} The point.
 */
function pointAt(degrees, distance) {
  const radians = (degrees * Math.PI) / 180;
  return { x: distance * Math.sin(radians), y: -distance * Math.cos(radians) };
}

/**
 * The outline of one slice: from the middle, out to the rim, round, and back.
 *
 * @param {number} index Which slice, clockwise from the top.
 * @param {number} count How many slices there are.
 * @returns {string} SVG path data.
 */
function slicePath(index, count) {
  const step = sliceAngle(count);
  const start = pointAt(index * step - step / 2, RADIUS);
  const end = pointAt(index * step + step / 2, RADIUS);
  const arc = `A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  return `M 0 0 L ${start.x.toFixed(2)} ${start.y.toFixed(2)} ${arc} Z`;
}

/**
 * Draws one slice with its pie's photo inside it, turned to face outward.
 *
 * @param {object} pie The catalog item for this slice.
 * @param {number} index Which slice, clockwise from the top.
 * @param {number} count How many slices there are.
 * @returns {{clip: SVGElement, slice: SVGElement}} The clip outline and the slice.
 */
function drawSlice(pie, index, count) {
  const clipId = `pie-wheel-slice-${index}`;
  const outline = slicePath(index, count);
  const photo = svg('image', {
    href: pie.photo.src,
    x: -PHOTO_WIDTH / 2,
    y: -PHOTO_DISTANCE - PHOTO_HEIGHT / 2,
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    preserveAspectRatio: 'xMidYMid slice',
    transform: `rotate(${index * sliceAngle(count)})`,
  });
  return {
    clip: svg('clipPath', { id: clipId }, [svg('path', { d: outline })]),
    slice: svg('g', { 'clip-path': `url(#${clipId})` }, [
      svg('path', { d: outline, class: 'pie-wheel__fill' }),
      photo,
    ]),
  };
}

/**
 * Draws the lines between slices and the studs where they meet the rim.
 *
 * @param {number} count How many slices there are.
 * @returns {{lines: SVGElement[], studs: SVGElement[]}} The dividers and the studs.
 */
function drawDividers(count) {
  const step = sliceAngle(count);
  const angles = Array.from({ length: count }, (_, index) => index * step + step / 2);
  return {
    lines: angles.map((angle) => {
      const end = pointAt(angle, RADIUS);
      return svg('line', { x1: 0, y1: 0, x2: end.x, y2: end.y, class: 'pie-wheel__divider' });
    }),
    studs: angles.map((angle) => {
      const spot = pointAt(angle, RIM_RADIUS);
      return svg('circle', { cx: spot.x, cy: spot.y, r: STUD_RADIUS, class: 'pie-wheel__stud' });
    }),
  };
}

/**
 * Draws the whole wheel inside the element that turns.
 *
 * @param {object[]} pies One catalog item per slice.
 * @returns {HTMLElement} The element that turns, with the drawing inside.
 */
export function drawWheel(pies) {
  const parts = pies.map((pie, index) => drawSlice(pie, index, pies.length));
  const { lines, studs } = drawDividers(pies.length);
  const drawing = svg(
    'svg',
    {
      class: 'pie-wheel__drawing',
      viewBox: `${-RADIUS} ${-RADIUS} ${RADIUS * 2} ${RADIUS * 2}`,
      'aria-hidden': 'true',
      focusable: 'false',
    },
    [
      svg(
        'defs',
        {},
        parts.map((part) => part.clip)
      ),
      ...parts.map((part) => part.slice),
      ...lines,
      svg('circle', { r: RIM_RADIUS, class: 'pie-wheel__rim' }),
      ...studs,
    ]
  );
  return el('div', { class: 'pie-wheel__disc' }, [drawing]);
}
