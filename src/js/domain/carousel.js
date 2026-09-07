/**
 * Paging arithmetic for a carousel that slides a whole page of cards at a time.
 *
 * Kept apart from the component that draws the reviews because this is the part with
 * the off by one in it, and it can be checked here without a browser. The component
 * measures how many cards fit and asks these functions where to stop.
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
 * A page is a whole screenful, so the obvious answer is page times perView. That
 * overshoots on the last page whenever the cards do not divide evenly: five cards
 * three at a time would scroll two off the end and leave a gap where a third card
 * should be. Clamping to the last full screenful backfills instead, which is what
 * the restaurant's own carousel does.
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
