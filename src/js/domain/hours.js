/**
 * Opening hours logic: whether a restaurant is open, and when it opens next.
 *
 * Pure functions that take the moment to test as an argument rather than reading the
 * clock themselves. That is what makes "is Katy open at 3am on a Tuesday" a unit test
 * instead of something you can only find out by waiting until Tuesday.
 *
 * The six House of Pies restaurants do not keep the same hours. Fuqua never closes,
 * Katy runs around the clock on weekends only, and the other four run 7:00 AM to
 * midnight. Every one of those cases goes through the same two functions below.
 *
 * Used by the open now badge on the home screen, the location picker, and the pickup
 * slot builder in domain/slots.js.
 */

/** Minutes in a day. A closing time equal to this means midnight. */
const MINUTES_PER_DAY = 1440;

/** Minutes in an hour. */
const MINUTES_PER_HOUR = 60;

/** Days in a week, used to wrap around when looking ahead for the next opening. */
const DAYS_PER_WEEK = 7;

/**
 * Converts a moment to minutes past midnight on its own day.
 *
 * @param {Date} moment Any date and time.
 * @returns {number} Minutes since midnight, from 0 to 1439.
 */
export function minutesIntoDay(moment) {
  return moment.getHours() * MINUTES_PER_HOUR + moment.getMinutes();
}

/**
 * Decides whether a restaurant is serving at a given moment.
 *
 * @param {object} location A location from data/locations.js.
 * @param {Date} moment The time to test.
 * @returns {boolean} True when the doors are open.
 */
export function isOpenAt(location, moment) {
  const today = location.hours[moment.getDay()];
  const minute = minutesIntoDay(moment);
  return minute >= today.openMinute && minute < today.closeMinute;
}

/**
 * Formats minutes past midnight as a clock time a customer reads.
 *
 * @param {number} minute Minutes since midnight. 1440 is treated as midnight.
 * @returns {string} A string such as '7:00 AM' or '12:00 AM'.
 */
export function formatMinute(minute) {
  const wrapped = minute % MINUTES_PER_DAY;
  const hour24 = Math.floor(wrapped / MINUTES_PER_HOUR);
  const minutes = String(wrapped % MINUTES_PER_HOUR).padStart(2, '0');
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/**
 * Finds the next moment a closed restaurant will open.
 *
 * Looks at the rest of today first, then walks forward a day at a time. Seven days
 * is the limit because a weekly schedule cannot hide an opening longer than that,
 * and returning null instead of looping forever is the safe answer for a location
 * that somehow never opens.
 *
 * @param {object} location A location from data/locations.js.
 * @param {Date} moment The time to look forward from.
 * @returns {{dayOffset: number, openMinute: number}|null} How many days ahead the
 *   next opening is and at what minute, or null if the schedule never opens.
 */
export function nextOpening(location, moment) {
  const startMinute = minutesIntoDay(moment);
  for (let dayOffset = 0; dayOffset < DAYS_PER_WEEK; dayOffset += 1) {
    const dayIndex = (moment.getDay() + dayOffset) % DAYS_PER_WEEK;
    const day = location.hours[dayIndex];
    const opensLaterToday = dayOffset === 0 && startMinute < day.openMinute;
    if (opensLaterToday || dayOffset > 0) {
      return { dayOffset, openMinute: day.openMinute };
    }
  }
  return null;
}

/**
 * Reports whether a restaurant runs around the clock on a given weekday.
 *
 * Katy is the reason this is per day rather than per location: it opens at midnight
 * and closes at midnight on Saturday and Sunday only, so a location-wide check would
 * describe a Saturday morning at Katy as closing soon when it never closes that day.
 *
 * @param {object} location A location from data/locations.js.
 * @param {number} dayIndex Weekday index, where Sunday is 0.
 * @returns {boolean} True when that day has no closing time.
 */
export function isOpenAllDay(location, dayIndex) {
  const day = location.hours[dayIndex];
  return day.openMinute === 0 && day.closeMinute >= MINUTES_PER_DAY;
}

/**
 * Builds the sentence shown under a location name, such as
 * 'Open now, closes at midnight' or 'Closed, opens tomorrow at 7:00 AM'.
 *
 * @param {object} location A location from data/locations.js.
 * @param {Date} moment The time to describe.
 * @param {string[]} dayNames Weekday names indexed the way Date.getDay is.
 * @returns {{isOpen: boolean, text: string}} Whether it is open and the sentence.
 */
export function describeStatus(location, moment, dayNames) {
  const dayIndex = moment.getDay();

  if (isOpenAt(location, moment)) {
    const isAlwaysOpen = location.hours.every((_, index) => isOpenAllDay(location, index));
    if (isAlwaysOpen) {
      return { isOpen: true, text: 'Open 24 hours' };
    }
    if (isOpenAllDay(location, dayIndex)) {
      return { isOpen: true, text: 'Open 24 hours today' };
    }
    const closeMinute = location.hours[dayIndex].closeMinute;
    const closeText = closeMinute >= MINUTES_PER_DAY ? 'midnight' : formatMinute(closeMinute);
    return { isOpen: true, text: `Open now, closes at ${closeText}` };
  }

  const opening = nextOpening(location, moment);
  if (opening === null) {
    return { isOpen: false, text: 'Closed' };
  }

  let when = `on ${dayNames[(dayIndex + opening.dayOffset) % DAYS_PER_WEEK]}`;
  if (opening.dayOffset === 0) {
    when = 'today';
  } else if (opening.dayOffset === 1) {
    when = 'tomorrow';
  }
  return { isOpen: false, text: `Closed, opens ${when} at ${formatMinute(opening.openMinute)}` };
}
