/**
 * A representative photo for each menu category.
 *
 * House of Pies publishes a photo for some menu items but not most of them, and a
 * grid where one tile in twenty has a picture looks broken rather than sparse. So an
 * item without its own photo falls back to one for its category.
 *
 * The item detail screen labels a category photo as such. Showing a picture of a
 * different pie without saying so would be a small lie told four hundred times.
 *
 * Sides and catering have no entry on purpose: nothing in the photo set represents
 * a side of toast or a catering tray honestly, so those fall through to the drawn
 * placeholder in ui/components/foodPlaceholder.js instead.
 *
 * Keys are category ids from data/menu.js. Values are filenames in assets/img.
 */
export const CATEGORY_PHOTOS = {
  // Food
  'texas-breakfast': 'cat-texas-breakfast.jpg',
  'breakfast-favorites': 'cat-breakfast-favorites.jpg',
  'from-the-griddle': 'cat-from-the-griddle.jpg',
  omelettes: 'texan-omelette.webp',
  appetizers: 'cat-appetizers.jpg',
  'soups-salads': 'cat-soups-salads.jpg',
  'kids-corner': 'cat-kids-corner.jpg',
  'lunch-dinner': 'cat-lunch-dinner.jpg',
  'fusion-specials': 'cat-fusion-specials.jpg',
  burgers: 'bayou-city-burger.webp',
  'sandwiches-melts': 'cat-sandwiches-melts.jpg',

  // Bakery
  'specialty-dessert': 'cat-specialty-dessert.jpg',
  'fruit-pies-slice': 'cat-fruit-pies-slice.jpg',
  'cream-pies-slice': 'bayou-goo-pie.webp',
  'meringue-specialty-slice': 'cat-meringue-specialty.jpg',
  'cakes-cheesecakes-slice': 'strawberry-cheesecake.webp',
  'whole-fruit-pies': 'cat-whole-fruit-pies.jpg',
  'whole-cream-pies': 'cat-whole-cream-pies.jpg',
  'whole-meringue-specialty': 'cat-whole-meringue.jpg',
  'whole-cakes-cheesecakes': 'cat-whole-cakes.jpg',
  'other-goodies': 'mini-pies.webp',

  // Drinks
  coffee: 'cat-coffee.jpg',
  'tea-soda': 'cat-tea-soda.jpg',
  'juice-milk': 'cat-juice-milk.jpg',

  // Catering special orders are whole cakes and pies, so a real one fits here
  'special-orders': 'cake-1.webp',
};
