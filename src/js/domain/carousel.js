/**
 * Paging arithmetic for a carousel that slides a whole page of cards at a time.
 *
 * Used by ui/components/testimonials.js.
 */

/**
 * How many pages a list of cards fills.
 *
 * @param {number} total How many cards there are.
 * @param {number} perView How many fit on screen at once.
 * @returns {number} Page count, never below 1 so the counter always reads "1 / 1".
 */
export function pageCount(total, perView) {
  if (perView < 1) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / perView));
}

/**
 * Holds a page number inside the range that actually exists.
 *
 * @param {number} page The page being asked for, counting from zero.
 * @param {number} total How many cards there are.
 * @param {number} perView How many fit on screen at once.
 * @returns {number} A page number that exists.
 */
export function clampPage(page, total, perView) {
  const last = pageCount(total, perView) - 1;
  return Math.min(Math.max(page, 0), last);
}

/**
 * How many cards the track shifts left to show a given page.
 *
 * The last page backfills to a full screen rather than leaving a gap.
 *
 * @param {number} total How many cards there are.
 * @param {number} perView How many fit on screen at once.
 * @param {number} page The page being shown, counting from zero.
 * @returns {number} How many card widths to shift the track by.
 */
export function slideOffset(total, perView, page) {
  if (perView < 1) {
    return 0;
  }
  const lastFlushStart = Math.max(0, total - perView);
  return Math.min(clampPage(page, total, perView) * perView, lastFlushStart);
}
