/**
 * The pie wheel on the home screen, for anyone who cannot choose.
 *
 * A wheel cut into slices, each slice showing a different pie, with only its top half
 * above the edge. Spin turns it to a pie at random, and the label above says which one
 * landed under the pointer. The wheel itself is a drawing and hidden from screen
 * readers; the label and the button are the parts that say anything.
 *
 * The turning arithmetic is in domain/pieWheel.js.
 */

import { el } from '../dom.js';
import { formatUSD } from '../../domain/money.js';
import { pickSlice, rotationToShow, sliceAngle } from '../../domain/pieWheel.js';

/** The SVG namespace, which createElement does not use. */
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Wheel radius in drawing units. The viewBox is centred on the wheel. */
const RADIUS = 200;

/** Size of the photo laid into each slice, and how far out from the middle it sits. */
const PHOTO_WIDTH = 240;
const PHOTO_HEIGHT = 180;
const PHOTO_DISTANCE = 118;

/** Radius of the cream hub in the middle. */
const HUB_RADIUS = 30;

/** How long a spin takes. The stylesheet's transition matches this. */
const SPIN_MS = 3600;

/** Whole turns added to every spin, so it looks spun rather than nudged. */
const EXTRA_TURNS = 4;

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
 * @returns {string} "x y", ready for a path.
 */
function pointAt(degrees, distance) {
  const radians = (degrees * Math.PI) / 180;
  const x = distance * Math.sin(radians);
  const y = -distance * Math.cos(radians);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
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
  const start = index * step - step / 2;
  const end = start + step;
  return `M 0 0 L ${pointAt(start, RADIUS)} A ${RADIUS} ${RADIUS} 0 0 1 ${pointAt(end, RADIUS)} Z`;
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
      svg('path', { d: outline, class: 'pie-wheel__edge' }),
    ]),
  };
}

/**
 * Draws the whole wheel: every slice, the rim, and the hub.
 *
 * @param {object[]} pies One catalog item per slice.
 * @returns {{drawing: SVGElement, spinner: SVGElement}} The SVG, and the group that turns.
 */
function drawWheel(pies) {
  const parts = pies.map((pie, index) => drawSlice(pie, index, pies.length));
  const spinner = svg('g', { class: 'pie-wheel__spinner' }, [
    ...parts.map((part) => part.slice),
    svg('circle', { r: RADIUS - 3, class: 'pie-wheel__rim' }),
  ]);
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
      spinner,
      svg('circle', { r: HUB_RADIUS, class: 'pie-wheel__hub' }),
    ]
  );
  return { drawing, spinner };
}

/**
 * Builds the pie wheel section.
 *
 * @param {object[]} pies One catalog item per slice, each with a photo.
 * @param {Function} onOrder Called with the pie the wheel landed on.
 * @returns {HTMLElement} The section.
 */
export function pieWheel(pies, onOrder) {
  const { drawing, spinner } = drawWheel(pies);
  let rotation = 0;
  let current = 0;
  let chosen = null;

  const nameLine = el('p', { class: 'pie-wheel__name', text: 'Which pie today?' });
  const detailLine = el('p', {
    class: 'pie-wheel__detail',
    text: 'Spin the wheel and let it pick for you.',
  });
  const orderButton = el(
    'button',
    { class: 'button button--small', type: 'button', onClick: () => onOrder(chosen) },
    'Order this pie'
  );
  orderButton.hidden = true;
  const announcement = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const spinButton = el('button', { class: 'button', type: 'button' }, 'Spin the wheel');

  /**
   * Shows the pie the wheel stopped on.
   *
   * @returns {void}
   */
  function land() {
    chosen = pies[current];
    nameLine.textContent = chosen.name;
    detailLine.textContent = formatUSD(chosen.priceCents);
    orderButton.hidden = false;
    spinButton.disabled = false;
    announcement.textContent = `The wheel picked ${chosen.name}, ${formatUSD(chosen.priceCents)}.`;
  }

  spinButton.addEventListener('click', () => {
    current = pickSlice(pies.length, current, Math.random);
    rotation = rotationToShow(current, pies.length, rotation, EXTRA_TURNS);
    spinner.style.transform = `rotate(${rotation}deg)`;
    spinButton.disabled = true;
    nameLine.textContent = 'Spinning...';
    detailLine.textContent = '';
    orderButton.hidden = true;
    const isStill = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(land, isStill ? 0 : SPIN_MS);
  });

  return el('section', { class: 'section pie-wheel', 'aria-labelledby': 'pie-wheel-title' }, [
    el('div', { class: 'section__head' }, [
      el('h2', { id: 'pie-wheel-title', text: 'Cannot pick a pie?' }),
      el('p', { class: 'section__lede', text: 'Give the wheel a spin.' }),
    ]),
    el('div', { class: 'pie-wheel__label' }, [nameLine, detailLine, orderButton]),
    el('div', { class: 'pie-wheel__stage' }, [
      el('span', { class: 'pie-wheel__pointer', 'aria-hidden': 'true' }),
      drawing,
    ]),
    el('div', { class: 'pie-wheel__controls' }, [spinButton]),
    announcement,
  ]);
}
