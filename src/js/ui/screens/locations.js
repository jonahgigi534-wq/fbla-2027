/**
 * The locations screen: every restaurant as a storefront photograph, laid out the way
 * House of Pies lays out its own locations page.
 *
 * The home screen shows the same tiles so a customer can pick somewhere without
 * leaving the front page. This screen adds what will not fit there, which is the full
 * opening hours and the phone number for each restaurant, and it is where the Locations
 * link in the header goes.
 */

import { el, render } from '../dom.js';
import { locationTile } from '../components/locationTile.js';
import { LOCATIONS, DAY_NAMES } from '../../data/locations.js';
import { describeStatus } from '../../domain/hours.js';
import { getState, update } from '../../app/store.js';

/**
 * Renders the locations screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderLocations(container) {
  const now = new Date();
  const state = getState();
  const openCount = LOCATIONS.filter(
    (location) => describeStatus(location, now, DAY_NAMES).isOpen
  ).length;

  render(container, [
    el('section', { class: 'section section--feature' }, [
      el('div', { class: 'section__head' }, [
        el('h1', {}, [
          'Order from any ',
          el('span', { class: 'brand-mark', text: 'House of Pies' }),
          ` location`,
        ]),
        el('p', { class: 'section__lede' }, [
          'Hours differ by restaurant. Fuqua never closes, Katy runs around the clock on ',
          'weekends, and the rest serve from 7:00 AM to midnight. Choosing one sets the ',
          'menu, the pickup times, and the delivery area for your order.',
        ]),
        el('p', {
          class: 'section__lede',
          text: `${openCount} of ${LOCATIONS.length} open right now.`,
        }),
      ]),
      el(
        'div',
        { class: 'location-grid' },
        LOCATIONS.map((location) =>
          locationTile(location, now, {
            isSelected: location.id === state.locationId,
            onSelect: (chosen) => update(() => ({ locationId: chosen.id })),
            isDetailed: true,
          })
        )
      ),
    ]),
  ]);
}
