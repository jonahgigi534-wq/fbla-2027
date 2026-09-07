/**
 * The drawn tile shown for an item with no photograph.
 *
 * Sides and catering trays have no picture on the restaurant's menu and none in the
 * photo set, so rather than leave a gray box or borrow a photo of something else,
 * those tiles get a drawn one: the brand colors, a glyph chosen from the item's own
 * words, and the item name.
 *
 * The SVG is written inline rather than loaded from a file because the offline build
 * has to work from a file:// address, where fetching a separate asset is unreliable.
 */

import { el } from '../dom.js';

/**
 * Glyphs keyed by a word that appears in the item name.
 *
 * Checked in order, so more specific words are listed first. 'toast' has to beat
 * 'bread', and 'fries' has to beat 'potato'.
 */
const GLYPH_BY_KEYWORD = [
  ['coffee', '☕'],
  ['tea', '\u{1F375}'],
  ['pie', '\u{1F967}'],
  ['pancake', '\u{1F95E}'],
  ['waffle', '\u{1F9C7}'],
  ['french toast', '\u{1F35E}'],
  ['cheesecake', '\u{1F370}'],
  ['cake', '\u{1F370}'],
  ['cookie', '\u{1F36A}'],
  ['muffin', '\u{1F9C1}'],
  ['fries', '\u{1F35F}'],
  ['potato', '\u{1F954}'],
  ['bacon', '\u{1F953}'],
  ['sausage', '\u{1F32D}'],
  ['steak', '\u{1F969}'],
  ['chicken', '\u{1F357}'],
  ['shrimp', '\u{1F364}'],
  ['fish', '\u{1F41F}'],
  ['egg', '\u{1F373}'],
  ['toast', '\u{1F35E}'],
  ['bread', '\u{1F35E}'],
  ['biscuit', '\u{1F35E}'],
  ['tortilla', '\u{1FAD3}'],
  ['salad', '\u{1F957}'],
  ['fruit', '\u{1F34E}'],
  ['banana', '\u{1F34C}'],
  ['strawberr', '\u{1F353}'],
  ['cheese', '\u{1F9C0}'],
  ['tray', '\u{1F371}'],
  ['gallon', '\u{1F964}'],
  ['grits', '\u{1F963}'],
  ['oatmeal', '\u{1F963}'],
  ['gravy', '\u{1F963}'],
  ['soup', '\u{1F372}'],
  ['chili', '\u{1F336}'],
  ['jalapeno', '\u{1F336}'],
  ['onion', '\u{1F9C5}'],
  ['pickle', '\u{1F952}'],
  ['tomato', '\u{1F345}'],
  ['avocado', '\u{1F951}'],
  ['spinach', '\u{1F96C}'],
  ['mushroom', '\u{1F344}'],
  ['frijoles', '\u{1FAD8}'],
  ['vegetable', '\u{1F966}'],
  ['yogurt', '\u{1F368}'],
  ['juice', '\u{1F9C3}'],
  ['water', '\u{1F4A7}'],
  ['milk', '\u{1F95B}'],
  ['roll', '\u{1F950}'],
  ['peach', '\u{1F351}'],
  ['pineapple', '\u{1F34D}'],
  ['melon', '\u{1F348}'],
  ['blueberr', '\u{1FAD0}'],
  ['utensil', '\u{1F374}'],
  ['cup', '\u{1F964}'],
  ['hash', '\u{1F954}'],
  ['sandwich', '\u{1F96A}'],
  ['club', '\u{1F96A}'],
  ['blt', '\u{1F96A}'],
  ['bagel', '\u{1F96F}'],
  ['fajita', '\u{1F32E}'],
  ['philly', '\u{1F969}'],
  ['meatloaf', '\u{1F969}'],
  ['beef', '\u{1F969}'],
  ['turkey', '\u{1F357}'],
];

/** Used when no keyword matches. */
const DEFAULT_GLYPH = '\u{1F37D}';

/**
 * Picks the glyph that best matches an item name.
 *
 * @param {string} name The item name.
 * @returns {string} A single emoji.
 */
export function glyphFor(name) {
  const lower = name.toLowerCase();
  const match = GLYPH_BY_KEYWORD.find(([keyword]) => lower.includes(keyword));
  return match ? match[1] : DEFAULT_GLYPH;
}

/**
 * Builds the drawn stand-in tile for an item with no photograph.
 *
 * @param {string} name The item name, used to pick the glyph.
 * @returns {HTMLElement} A decorative element, hidden from screen readers because
 *   the item name is already announced next to it.
 */
export function foodPlaceholder(name) {
  return el('div', { class: 'food-placeholder', 'aria-hidden': 'true' }, [
    el('span', { class: 'food-placeholder__glyph', text: glyphFor(name) }),
  ]);
}
