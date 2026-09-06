/**
 * Assembles the six catalog files into the one menu the rest of the app reads.
 *
 * Each raw item arrives from its catalog file knowing only its own name, price, and
 * description. This module gives it the two things it cannot know about itself,
 * which category and section it belongs to, then runs the description through
 * domain/dietary.js to work out allergens and dietary tags.
 *
 * Everything here runs once, when the module is first imported. Screens read the
 * finished arrays and the id lookups below rather than searching the catalog again.
 */

import { BREAKFAST_CATEGORIES } from './menu-breakfast.js';
import { SAVORY_CATEGORIES } from './menu-savory.js';
import { BAKERY_CATEGORIES } from './menu-bakery.js';
import { DRINK_CATEGORIES } from './menu-drinks.js';
import { SIDE_CATEGORIES } from './menu-sides.js';
import { CATERING_CATEGORIES } from './menu-catering.js';
import { ALLERGEN_KEYWORDS, MEAT_KEYWORDS } from './dietaryRules.js';
import { CATEGORY_PHOTOS } from './categoryPhotos.js';
import { buildDietaryTags, detectAllergens, toWords } from '../domain/dietary.js';

/**
 * An item that needs notice before pickup is a service the kitchen schedules,
 * not something already sitting in the case.
 */
const SERVICE_TYPE = 'service';

/** Anything available on the spot is a product. */
const PRODUCT_TYPE = 'product';

/**
 * Works out which picture an item should show.
 *
 * An item with its own photograph uses it. Otherwise it borrows the one for its
 * category, flagged so the detail screen can say that is what happened. Sides and
 * catering have no honest stand-in, so they get null and the screens draw a tile.
 *
 * @param {object} rawItem An item straight out of a catalog file.
 * @param {string} categoryId The category this item was listed under.
 * @returns {{src: string, isCategoryPhoto: boolean}|null} The picture, or null.
 */
function resolvePhoto(rawItem, categoryId) {
  if (rawItem.imageId) {
    return { src: `assets/img/${rawItem.imageId}.webp`, isCategoryPhoto: false };
  }
  const categoryFile = CATEGORY_PHOTOS[categoryId];
  if (categoryFile) {
    return { src: `assets/img/${categoryFile}`, isCategoryPhoto: true };
  }
  return null;
}

/**
 * Fills in the fields an item cannot know about itself and derives its dietary data.
 *
 * @param {object} rawItem An item straight out of a catalog file.
 * @param {string} categoryId The category this item was listed under.
 * @param {string} sectionId The section that category belongs to.
 * @returns {object} A finished catalog item, ready for the screens.
 */
function finishItem(rawItem, categoryId, sectionId) {
  const words = toWords(`${rawItem.name} ${rawItem.description}`);
  return {
    ...rawItem,
    categoryId,
    sectionId,
    type: rawItem.leadTimeHours > 0 ? SERVICE_TYPE : PRODUCT_TYPE,
    allergens: detectAllergens(words, ALLERGEN_KEYWORDS),
    dietaryTags: buildDietaryTags(words, rawItem.extraTags, MEAT_KEYWORDS),
    photo: resolvePhoto(rawItem, categoryId),
  };
}

/**
 * Builds one section by finishing every item in every category it holds.
 *
 * @param {string} id Section identifier used by the router and the section tabs.
 * @param {string} name Section heading a customer reads.
 * @param {string} blurb One line describing the section.
 * @param {object[][]} categoryGroups One or more category arrays from the catalog files.
 * @returns {object} A section whose items are ready to display.
 */
function buildSection(id, name, blurb, categoryGroups) {
  const categories = categoryGroups.flat().map((category) => ({
    ...category,
    sectionId: id,
    items: category.items.map((item) => finishItem(item, category.id, id)),
  }));
  return { id, name, blurb, categories };
}

/** The top level of the menu, in the order the section tabs show them. */
export const SECTIONS = [
  buildSection('food', 'Food', 'Breakfast all day, plus burgers, plates, and sandwiches.', [
    BREAKFAST_CATEGORIES,
    SAVORY_CATEGORIES,
  ]),
  buildSection(
    'bakery',
    'Bakery',
    'Over forty pies, cakes, and cheesecakes, by the slice or whole.',
    [BAKERY_CATEGORIES]
  ),
  buildSection('drinks', 'Drinks', 'Coffee, tea, the fountain, and shakes.', [DRINK_CATEGORIES]),
  buildSection('sides', 'A la Carte', 'Sides on their own, from hash browns to a ribeye.', [
    SIDE_CATEGORIES,
  ]),
  buildSection(
    'catering',
    'Catering',
    'Trays and special orders for events. Forty eight hours notice.',
    [CATERING_CATEGORIES]
  ),
];

/** Every category across every section, flattened for the category filter. */
export const ALL_CATEGORIES = SECTIONS.flatMap((section) => section.categories);

/** Every orderable item, flattened. This is the array search and reports work over. */
export const ALL_ITEMS = ALL_CATEGORIES.flatMap((category) => category.items);

/**
 * Item id to item, so looking one up from a cart line or a saved order does not
 * rescan four hundred items.
 */
const ITEMS_BY_ID = new Map(ALL_ITEMS.map((item) => [item.id, item]));

/** Category id to category, for the same reason. */
const CATEGORIES_BY_ID = new Map(ALL_CATEGORIES.map((category) => [category.id, category]));

/** The dishes House of Pies features on its own home page. */
export const POPULAR_ITEMS = ALL_ITEMS.filter((item) => item.isPopular);

/**
 * Finds one item by id.
 *
 * @param {string} itemId Identifier such as 'bayou-goo-pie-slice'.
 * @returns {object|undefined} The item, or undefined when the id is unknown.
 */
export function findItem(itemId) {
  return ITEMS_BY_ID.get(itemId);
}

/**
 * Finds one category by id.
 *
 * @param {string} categoryId Identifier such as 'cream-pies-slice'.
 * @returns {object|undefined} The category, or undefined when the id is unknown.
 */
export function findCategory(categoryId) {
  return CATEGORIES_BY_ID.get(categoryId);
}

/**
 * Finds one section by id.
 *
 * @param {string} sectionId Identifier such as 'bakery'.
 * @returns {object|undefined} The section, or undefined when the id is unknown.
 */
export function findSection(sectionId) {
  return SECTIONS.find((section) => section.id === sectionId);
}
