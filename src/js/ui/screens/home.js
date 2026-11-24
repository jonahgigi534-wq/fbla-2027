/**
 * The home screen: pick a restaurant, see what is open now, jump into the menu.
 */

import { el, render } from '../dom.js';
import { favoriteCard } from '../components/favoriteCard.js';
import { locationTile } from '../components/locationTile.js';
import { testimonialsSection } from '../components/testimonials.js';
import { pieSlideshow } from '../components/pieSlideshow.js';
import { pieWheel } from '../components/pieWheel.js';
import { FEATURED_PIES, SLIDESHOW_PIES, WHEEL_PIES } from '../../data/pieShowcase.js';
import { DAY_NAMES, LOCATIONS } from '../../data/locations.js';
import { describeStatus } from '../../domain/hours.js';
import { withLiveStock } from '../../domain/inventory.js';
import { getState, update } from '../../app/store.js';
import { navigate } from '../../app/router.js';

/**
 * Renders the home screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderHome(container) {
  const now = new Date();
  const state = getState();
  const openCount = LOCATIONS.filter(
    (location) => describeStatus(location, now, DAY_NAMES).isOpen
  ).length;

  render(container, [
    el('section', { class: 'hero' }, [
      el('div', { class: 'hero__text' }, [
        el('p', { class: 'hero__eyebrow', text: 'A Houston tradition since 1967' }),
        el('h1', { text: 'Order House of Pies, however you like it' }),
        el('p', { class: 'hero__lede' }, [
          'Breakfast all day, comfort food classics, and over forty homemade pies. ',
          'Pick a restaurant, build your order, and choose a pickup time that works.',
        ]),
        el('div', { class: 'row' }, [
          el(
            'button',
            { class: 'button', type: 'button', onClick: () => navigate('/menu') },
            'Browse the menu'
          ),
          el(
            'button',
            { class: 'button button--secondary', type: 'button', onClick: () => navigate('/help') },
            'How this works'
          ),
        ]),
        el('p', {
          class: 'hero__status',
          text: `${openCount} of ${LOCATIONS.length} restaurants open right now.`,
        }),
      ]),
      el('div', { class: 'hero__media' }, [
        pieSlideshow(SLIDESHOW_PIES, (pie) => navigate(`/item/${pie.id}`)),
      ]),
    ]),

    el('section', { class: 'section section--feature' }, [
      el('div', { class: 'section__head' }, [
        el('h2', { text: 'Choose your restaurant' }),
        el('p', {
          class: 'section__lede',
          text: 'Hours differ by location. Fuqua never closes, and Katy runs around the clock on weekends.',
        }),
      ]),
      el(
        'div',
        { class: 'location-grid' },
        LOCATIONS.map((location) =>
          locationTile(location, now, {
            isSelected: location.id === state.locationId,
            onSelect: (chosen) => update(() => ({ locationId: chosen.id })),
          })
        )
      ),
      el('div', { class: 'row row--centred' }, [
        el(
          'button',
          {
            class: 'button button--secondary',
            type: 'button',
            onClick: () => navigate('/locations'),
          },
          'Hours and phone numbers'
        ),
      ]),
    ]),

    el('section', { class: 'section section--feature' }, [
      el('div', { class: 'section__head' }, [
        el('h2', { text: 'Pies worth the trip' }),
        el('p', {
          class: 'section__lede',
          text: 'A few of the forty plus homemade pies, by the slice or whole.',
        }),
      ]),
      el(
        'div',
        { class: 'grid' },
        withLiveStock(FEATURED_PIES, state.stockOverrides).map((item) =>
          favoriteCard(item, (chosen) => navigate(`/item/${chosen.id}`))
        )
      ),
    ]),

    pieWheel(WHEEL_PIES, (pie) => navigate(`/item/${pie.id}`)),

    testimonialsSection(),
  ]);
}
