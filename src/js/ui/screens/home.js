/**
 * The home screen: pick a restaurant, see what is open now, jump into the menu.
 *
 * The open now status is the reason this screen leads with locations. House of Pies
 * keeps six restaurants on three different schedules, and a customer at one in the
 * morning needs to know that Fuqua is serving and Kirby is not before they spend
 * five minutes building a cart.
 */

import { el, render } from '../dom.js';
import { itemCard } from '../components/itemCard.js';
import { POPULAR_ITEMS } from '../../data/menu.js';
import { DAY_NAMES, LOCATIONS } from '../../data/locations.js';
import { describeStatus } from '../../domain/hours.js';
import { getState, update } from '../../app/store.js';
import { navigate } from '../../app/router.js';

/**
 * Builds one location tile with its live open or closed status.
 *
 * @param {object} location A location from data/locations.js.
 * @param {Date} now The moment to describe it at.
 * @param {boolean} isSelected Whether this is the customer's chosen restaurant.
 * @returns {HTMLElement} The tile.
 */
function locationCard(location, now, isSelected) {
  const status = describeStatus(location, now, DAY_NAMES);
  return el(
    'button',
    {
      class: `card card--interactive location-card${isSelected ? ' location-card--selected' : ''}`,
      type: 'button',
      'aria-pressed': isSelected ? 'true' : 'false',
      onClick: () => update(() => ({ locationId: location.id })),
    },
    [
      el('div', { class: 'card__media' }, [
        el('img', { src: `assets/img/${location.imageId}.webp`, alt: '', loading: 'lazy' }),
      ]),
      el('div', { class: 'card__body' }, [
        el('div', { class: 'location-card__head' }, [
          el('h3', { text: location.name }),
          el('span', {
            class: `badge ${status.isOpen ? 'badge--success' : 'badge--danger'}`,
            text: status.isOpen ? 'Open' : 'Closed',
          }),
        ]),
        el('p', { class: 'location-card__area', text: location.area }),
        el('p', { class: 'location-card__status', text: status.text }),
        el('p', {
          class: 'location-card__address',
          text: `${location.street}, ${location.cityStateZip}`,
        }),
        isSelected ? el('span', { class: 'badge badge--info', text: 'Ordering from here' }) : null,
      ]),
    ]
  );
}

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
        el('img', { src: 'assets/img/bakery-case.webp', alt: 'The House of Pies bakery case' }),
      ]),
    ]),

    el('section', { class: 'section' }, [
      el('div', { class: 'section__head' }, [
        el('h2', { text: 'Choose your restaurant' }),
        el('p', {
          class: 'section__lede',
          text: 'Hours differ by location. Fuqua never closes, and Katy runs around the clock on weekends.',
        }),
      ]),
      el(
        'div',
        { class: 'grid grid--wide' },
        LOCATIONS.map((location) => locationCard(location, now, location.id === state.locationId))
      ),
    ]),

    el('section', { class: 'section' }, [
      el('div', { class: 'section__head' }, [
        el('h2', { text: 'Fan favorites' }),
        el('p', { class: 'section__lede', text: 'The dishes House of Pies is known for.' }),
      ]),
      el(
        'div',
        { class: 'grid' },
        POPULAR_ITEMS.map((item) => itemCard(item, (chosen) => navigate(`/item/${chosen.id}`)))
      ),
    ]),
  ]);
}
