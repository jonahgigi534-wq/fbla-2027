/**
 * The storefront tile a restaurant is shown as.
 *
 * Copies the way House of Pies presents its own locations: the photograph of the
 * building with the place name laid over it. What sits under the photograph is this
 * program's addition, because a customer picking somewhere to order from needs to
 * know whether it is open before they know what it looks like.
 *
 * The name is not drawn here. The restaurant publishes these photographs with the
 * label already part of the picture, so writing it over the top printed every one of
 * them twice. It travels in the alt text instead, which is what a screen reader and a
 * broken image both need anyway.
 *
 * Used by the home screen and the locations screen. The locations screen asks for the
 * detailed form, which adds the hours and the phone number.
 */

import { el } from '../dom.js';
import { DAY_NAMES } from '../../data/locations.js';
import { describeStatus } from '../../domain/hours.js';

/**
 * Builds one storefront tile.
 *
 * @param {object} location A location from data/locations.js.
 * @param {Date} now The moment to describe the opening hours at.
 * @param {object} options How the tile should behave.
 * @param {boolean} options.isSelected Whether this is the customer's chosen restaurant.
 * @param {Function} options.onSelect Called with the location when the button is pressed.
 * @param {boolean} [options.isDetailed] Include the full hours and the phone number.
 * @returns {HTMLElement} The tile.
 */
export function locationTile(location, now, { isSelected, onSelect, isDetailed = false }) {
  const status = describeStatus(location, now, DAY_NAMES);

  return el('article', { class: `location-tile${isSelected ? ' location-tile--selected' : ''}` }, [
    el('div', { class: 'location-tile__media' }, [
      el('img', {
        src: `assets/img/${location.imageId}.webp`,
        alt: `The ${location.tileLabel} House of Pies`,
        loading: 'lazy',
      }),
    ]),
    el('div', { class: 'location-tile__facts' }, [
      el('div', { class: 'location-tile__row' }, [
        el('span', {
          class: `badge ${status.isOpen ? 'badge--success' : 'badge--danger'}`,
          text: status.isOpen ? 'Open' : 'Closed',
        }),
        el('span', { class: 'location-tile__status', text: status.text }),
        location.isCorporateOffice
          ? el('span', { class: 'badge', text: 'Corporate office' })
          : null,
      ]),
      el('p', {
        class: 'location-tile__address',
        text: `${location.street}, ${location.cityStateZip}`,
      }),
      isDetailed ? el('p', { class: 'location-tile__hours', text: location.hoursLabel }) : null,
      isDetailed ? el('p', { class: 'location-tile__hours', text: location.phone }) : null,
      el(
        'button',
        {
          class: `button${isSelected ? '' : ' button--secondary'} button--small`,
          type: 'button',
          disabled: isSelected,
          'aria-label': isSelected
            ? `Already ordering from ${location.name}`
            : `Order from ${location.name}`,
          onClick: () => onSelect(location),
        },
        isSelected ? 'Ordering from here' : 'Order from here'
      ),
    ]),
  ]);
}
