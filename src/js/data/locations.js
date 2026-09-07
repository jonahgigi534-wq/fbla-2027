/**
 * The six real House of Pies restaurants, with the hours and delivery areas the
 * ordering system needs.
 *
 * Read by the location picker, the open-now badge on the home screen, the pickup
 * slot builder in domain/slots.js, and the delivery ZIP check in domain/validation.js.
 *
 * Hours are stored as minutes past midnight rather than clock strings so the
 * open-now and pickup-time checks are plain number comparisons. A closing time of
 * 1440 means midnight at the end of that day. Fuqua never closes, so it opens at
 * minute 0; Katy runs around the clock on weekends only.
 */

/** Minutes in a day. A closing time equal to this means midnight. */
export const MINUTES_PER_DAY = 1440;

/** 7:00 AM, the opening time every location shares. */
const OPENS_AT_7AM = 420;

/** Day indexes match JavaScript's Date.getDay(), where Sunday is 0. */
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Builds a seven-day schedule where every day keeps the same hours.
 *
 * @param {number} openMinute Minutes past midnight when the doors open.
 * @param {number} closeMinute Minutes past midnight when the doors close.
 * @returns {Array<{openMinute: number, closeMinute: number}>} One entry per weekday.
 */
function sameHoursEveryDay(openMinute, closeMinute) {
  const week = [];
  for (let day = 0; day < DAY_NAMES.length; day += 1) {
    week.push({ openMinute, closeMinute });
  }
  return week;
}

/**
 * Builds a schedule that runs around the clock on Saturday and Sunday but keeps
 * normal hours on weekdays. Only the Katy restaurant works this way.
 *
 * @param {number} weekdayOpenMinute Minutes past midnight when the doors open Monday to Friday.
 * @returns {Array<{openMinute: number, closeMinute: number}>} One entry per weekday.
 */
function twentyFourHoursOnWeekends(weekdayOpenMinute) {
  const allDay = { openMinute: 0, closeMinute: MINUTES_PER_DAY };
  const weekday = { openMinute: weekdayOpenMinute, closeMinute: MINUTES_PER_DAY };
  return [allDay, weekday, weekday, weekday, weekday, weekday, allDay];
}

/**
 * Every restaurant that can take an order.
 *
 * `tileLabel` is the caption the restaurant lays over each storefront photograph on
 * its own locations page, kept as its own field because it does not follow from the
 * name and the city: the Woodlands store is captioned "Woodlands, TX" while the Kirby
 * store is captioned "Kirby, Houston".
 *
 * `deliveryZips` is a fixed list per store rather than a distance calculation.
 * Real delivery areas are drawn by hand around road access, not by radius, and a
 * hardcoded list keeps the program free of any network lookup.
 */
export const LOCATIONS = [
  {
    id: 'kirby',
    name: 'Kirby',
    tileLabel: 'Kirby, Houston',
    area: 'River Oaks, Houston',
    isCorporateOffice: true,
    street: '3112 Kirby Drive',
    cityStateZip: 'Houston, TX 77098',
    zip: '77098',
    phone: '(713) 528-3816',
    imageId: 'loc-kirby',
    hours: sameHoursEveryDay(OPENS_AT_7AM, MINUTES_PER_DAY),
    hoursLabel: 'Monday to Sunday, 7:00 AM to midnight',
    deliveryZips: ['77005', '77006', '77019', '77027', '77030', '77046', '77098'],
  },
  {
    id: 'westheimer',
    name: 'Westheimer',
    tileLabel: 'Westheimer, Houston',
    area: 'Galleria, Houston',
    isCorporateOffice: false,
    street: '6142 Westheimer Road',
    cityStateZip: 'Houston, TX 77057',
    zip: '77057',
    phone: '(713) 782-1290',
    imageId: 'loc-westheimer',
    hours: sameHoursEveryDay(OPENS_AT_7AM, MINUTES_PER_DAY),
    hoursLabel: 'Monday to Sunday, 7:00 AM to midnight',
    deliveryZips: ['77027', '77042', '77056', '77057', '77063', '77074'],
  },
  {
    id: 'fuqua',
    name: 'Fuqua',
    tileLabel: 'Fuqua, Houston',
    area: 'South Houston',
    isCorporateOffice: false,
    street: '11311 Fuqua Street',
    cityStateZip: 'Houston, TX 77089',
    zip: '77089',
    phone: '(832) 203-7549',
    imageId: 'loc-fuqua',
    hours: sameHoursEveryDay(0, MINUTES_PER_DAY),
    hoursLabel: 'Open 24 hours, every day',
    deliveryZips: ['77034', '77047', '77048', '77075', '77089'],
  },
  {
    id: 'woodlands',
    name: 'The Woodlands',
    tileLabel: 'Woodlands, TX',
    area: 'Lake Woodlands',
    isCorporateOffice: false,
    street: '1330 Lake Woodlands Drive',
    cityStateZip: 'The Woodlands, TX 77380',
    zip: '77380',
    phone: '(713) 389-5514',
    imageId: 'loc-woodlands',
    hours: sameHoursEveryDay(OPENS_AT_7AM, MINUTES_PER_DAY),
    hoursLabel: 'Monday to Sunday, 7:00 AM to midnight',
    deliveryZips: ['77380', '77381', '77382', '77384', '77385', '77386'],
  },
  {
    id: 'cypress',
    name: 'Cypress',
    tileLabel: 'Cypress, TX',
    area: 'Northwest Freeway',
    isCorporateOffice: false,
    street: '25686 Northwest Freeway',
    cityStateZip: 'Cypress, TX 77429',
    zip: '77429',
    phone: '(346) 379-8398',
    imageId: 'loc-cypress',
    hours: sameHoursEveryDay(OPENS_AT_7AM, MINUTES_PER_DAY),
    hoursLabel: 'Monday to Sunday, 7:00 AM to midnight',
    deliveryZips: ['77065', '77070', '77095', '77429', '77433'],
  },
  {
    id: 'katy',
    name: 'Katy',
    tileLabel: 'Katy, TX',
    area: 'Katy Freeway',
    isCorporateOffice: false,
    street: '20802 Katy Freeway',
    cityStateZip: 'Katy, TX 77449',
    zip: '77449',
    phone: '(281) 717-8400',
    imageId: 'loc-katy',
    hours: twentyFourHoursOnWeekends(OPENS_AT_7AM),
    hoursLabel: 'Monday to Friday 7:00 AM to midnight, open 24 hours Saturday and Sunday',
    deliveryZips: ['77084', '77449', '77450', '77493', '77494'],
  },
];

/** The location the app starts on before the customer picks one. */
export const DEFAULT_LOCATION_ID = 'kirby';

/**
 * Finds one restaurant by its id.
 *
 * @param {string} locationId Identifier such as 'kirby'.
 * @returns {object|undefined} The matching location, or undefined if the id is unknown.
 */
export function findLocation(locationId) {
  return LOCATIONS.find((location) => location.id === locationId);
}
