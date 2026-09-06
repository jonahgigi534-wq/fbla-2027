/**
 * Catering, which is the part of the menu that is a service rather than a product.
 *
 * Every item here needs 48 hours of notice, exactly as the restaurant states on its
 * own catering menu. That lead time is the reason this file exists as its own
 * category: the checkout rules in domain/validation.js have to refuse a pickup time
 * that does not clear an item's leadTimeHours, and catering is where that bites.
 *
 * The two custom inscription items at the end are special orders. The customer picks
 * the cake or pie, writes the message that goes on top, and chooses a pickup date.
 *
 * Assembled into the full catalog by menu.js. Sourcing is recorded in docs/CREDITS.md.
 */

import { createCategory, createItem } from './menuItem.js';

/** Hours of notice the kitchen needs for anything on the catering menu. */
const CATERING_NOTICE_HOURS = 48;

/** Trays are made to order, so the case never holds many at once. */
const TRAY_STOCK = 12;

/**
 * Builds one catering item with the shared 48 hour notice and tray stock already set.
 *
 * @param {string} id Stable identifier used in URLs, carts, and saved orders.
 * @param {string} name Customer-facing name.
 * @param {number} priceCents Price in whole cents.
 * @param {string} description What is in the tray and roughly how many it serves.
 * @param {object} [options] Extra overrides passed through to createItem.
 * @returns {object} A catering item.
 */
function createCateringItem(id, name, priceCents, description, options = {}) {
  return createItem(id, name, priceCents, description, {
    leadTimeHours: CATERING_NOTICE_HOURS,
    stock: TRAY_STOCK,
    ...options,
  });
}

/** Catering categories, in the order the restaurant lists them. */
export const CATERING_CATEGORIES = [
  createCategory(
    'catering-breakfast',
    'Catering Breakfast',
    'Breakfast trays for the office. Forty eight hours notice.',
    [
      createCateringItem(
        'tray-scrambled-eggs',
        'Tray Scrambled Eggs',
        3500,
        'Full tray of scrambled eggs, serves about fifteen',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-scrambled-eggs-meat',
        'Tray Scrambled Eggs with Meat',
        5000,
        'Scrambled eggs with your choice of bacon or sausage'
      ),
      createCateringItem(
        'tray-hangover-eggs',
        'Tray Hangover Scrambled Eggs',
        4500,
        'Scrambled eggs with bell peppers, onions, mushrooms, cheddar, and picante',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-acapulco-eggs',
        'Tray Acapulco Scrambled Eggs',
        5000,
        'Scrambled eggs with taco meat, cheddar and jack cheese, and frijoles'
      ),
      createCateringItem(
        'tray-sausage-scrambler',
        'Tray Sausage Scrambler Platter',
        8000,
        'Sausage patties, buttermilk biscuits, scrambled eggs, and white gravy'
      ),
      createCateringItem(
        'tray-biscuits-sausage-gravy',
        'Tray Biscuits, Sausage, and Gravy',
        6500,
        'Buttermilk biscuits, sausage patties, and white gravy'
      ),
      createCateringItem('tray-bacon', 'Tray Bacon', 4000, 'Full tray of bacon strips'),
      createCateringItem(
        'tray-sausage-patties',
        'Tray Sausage Patties',
        4000,
        'Full tray of sausage patties'
      ),
      createCateringItem('tray-ham-steaks', 'Tray Ham Steaks', 4000, 'Full tray of ham steaks'),
      createCateringItem(
        'tray-hash-browns-medium',
        'Medium Tray Hash Browns',
        3000,
        'Medium tray of golden brown hash browns',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-hash-browns-large',
        'Large Tray Hash Browns',
        5500,
        'Large tray of golden brown hash browns',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-breakfast-tacos-medium',
        'Medium Tray Breakfast Tacos',
        5500,
        'Medium tray of breakfast tacos, about twelve'
      ),
      createCateringItem(
        'tray-breakfast-tacos-large',
        'Large Tray Breakfast Tacos',
        10500,
        'Large tray of breakfast tacos, about twenty four'
      ),
      createCateringItem(
        'tray-pancakes',
        'Tray Pancakes',
        4200,
        'Full tray of buttermilk pancakes',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-french-toast',
        'Tray French Toast',
        4200,
        'Full tray of French toast',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-obrien-potatoes-large',
        "Large Tray O'Brien Potatoes",
        5500,
        "Large tray of O'Brien potatoes",
        { tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory(
    'catering-entrees',
    'Catering Hot Entrees',
    'Hot entree trays. Forty eight hours notice.',
    [
      createCateringItem(
        'tray-chicken-fried-chicken-medium',
        'Medium Tray Chicken Fried Chicken',
        6000,
        'Medium tray, serves about eight'
      ),
      createCateringItem(
        'tray-chicken-fried-chicken-large',
        'Large Tray Chicken Fried Chicken',
        11000,
        'Large tray, serves about sixteen'
      ),
      createCateringItem(
        'tray-chicken-fried-steak-medium',
        'Medium Tray Chicken Fried Steak',
        7000,
        'Medium tray, serves about eight'
      ),
      createCateringItem(
        'tray-chicken-fried-steak-large',
        'Large Tray Chicken Fried Steak',
        13000,
        'Large tray, serves about sixteen'
      ),
      createCateringItem(
        'tray-chicken-tenders-medium',
        'Medium Tray Chicken Tenders',
        6000,
        'Medium tray of chicken tender strips'
      ),
      createCateringItem(
        'tray-chicken-tenders-large',
        'Large Tray Chicken Tenders',
        11000,
        'Large tray of chicken tender strips'
      ),
      createCateringItem(
        'tray-meatloaf-medium',
        'Medium Tray Meatloaf',
        6000,
        'Medium tray of homemade meatloaf with gravy'
      ),
      createCateringItem(
        'tray-meatloaf-large',
        'Large Tray Meatloaf',
        11000,
        'Large tray of homemade meatloaf with gravy'
      ),
      createCateringItem(
        'individual-chicken-pot-pie',
        'Individual Chicken Pot Pie',
        1000,
        'Six inch chicken pot pie, one per guest'
      ),
      createCateringItem(
        'tray-monterey-chicken',
        'Tray Monterey Chicken',
        6500,
        'Grilled chicken breast with mushrooms and jack cheese'
      ),
      createCateringItem(
        'tray-chicken-parmesan',
        'Tray Chicken Parmesan',
        6500,
        'Breaded chicken breast, swiss cheese, marinara, spaghetti'
      ),
      createCateringItem(
        'tray-chicken-wings-medium',
        'Medium Tray Chicken Wings',
        7000,
        'Medium tray of slightly spicy fried wings'
      ),
      createCateringItem(
        'tray-chicken-wings-large',
        'Large Tray Chicken Wings',
        13000,
        'Large tray of slightly spicy fried wings'
      ),
      createCateringItem(
        'tray-mini-corn-dogs-medium',
        'Medium Tray Mini Corn Dogs',
        6000,
        'Medium tray of mini corn dogs'
      ),
      createCateringItem(
        'tray-mini-corn-dogs-large',
        'Large Tray Mini Corn Dogs',
        11000,
        'Large tray of mini corn dogs'
      ),
    ]
  ),
  createCategory(
    'catering-sandwiches-salads',
    'Catering Sandwiches & Salads',
    'Box lunches, sandwich platters, and salad trays. Forty eight hours notice.',
    [
      createCateringItem(
        'catering-box-lunch',
        'Sandwich Box Lunch',
        1499,
        'One sandwich, chips, and a cookie, boxed per guest'
      ),
      createCateringItem(
        'catering-sandwich-platter',
        'Sandwich Platter',
        6000,
        'Assorted sandwiches cut in halves on one platter'
      ),
      createCateringItem(
        'catering-individual-regency-club',
        'Individual Regency Club',
        1099,
        'Turkey, bacon, lettuce, tomato on toasted white bread'
      ),
      createCateringItem(
        'catering-individual-blt',
        'Individual BLT',
        1099,
        'Bacon, lettuce, tomato, mayo on toasted white bread'
      ),
      createCateringItem(
        'catering-individual-chicken-salad',
        'Individual Chicken Salad Sandwich',
        1099,
        'Homemade chicken salad on a poppyseed bun'
      ),
      createCateringItem(
        'catering-individual-turkey',
        'Individual Turkey Sandwich',
        1099,
        'Deli turkey breast on a poppyseed bun'
      ),
      createCateringItem(
        'tray-garden-salad-medium',
        'Medium Tray Garden Salad',
        6000,
        'Mixed greens, carrot, cabbage, radish, cucumber, dressing on the side',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-garden-salad-large',
        'Large Tray Garden Salad',
        9000,
        'Large mixed green salad, dressing on the side',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-chef-salad-medium',
        'Medium Tray Chef Salad',
        8000,
        'Turkey, ham, swiss, american, tomato, hard boiled egg'
      ),
      createCateringItem(
        'tray-chef-salad-large',
        'Large Tray Chef Salad',
        12000,
        'Large chef salad tray'
      ),
      createCateringItem(
        'tray-strawberry-spinach-salad-medium',
        'Medium Tray Strawberry Spinach Salad',
        8000,
        'Spinach, strawberries, pecans, bacon bits, cheddar, hard boiled egg'
      ),
      createCateringItem(
        'tray-fruit-salad-large',
        'Large Tray Fruit Salad',
        12000,
        'Large tray of assorted seasonal fruit',
        { tags: ['vegetarian', 'vegan'] }
      ),
    ]
  ),
  createCategory(
    'catering-sides-drinks',
    'Catering Sides & Drinks',
    'Side trays and gallon drinks. Forty eight hours notice.',
    [
      createCateringItem(
        'tray-mashed-potatoes-medium',
        'Medium Tray Mashed Potatoes',
        3500,
        'Medium tray of creamy mashed potatoes',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-mashed-potatoes-large',
        'Large Tray Mashed Potatoes',
        6500,
        'Large tray of creamy mashed potatoes',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-loaded-mashed-potatoes-large',
        'Large Tray Loaded Mashed Potatoes',
        8000,
        'Mashed potatoes with cheddar, bacon bits, and chives'
      ),
      createCateringItem(
        'tray-mac-cheese-medium',
        'Medium Tray Mac & Cheese',
        3500,
        'Medium tray of creamy macaroni and cheese',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-mac-cheese-large',
        'Large Tray Mac & Cheese',
        6500,
        'Large tray of creamy macaroni and cheese',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'tray-loaded-mac-cheese-large',
        'Large Tray Loaded Mac & Cheese',
        12000,
        'Mac and cheese with chicken tenders, bacon bits, cheddar, chives'
      ),
      createCateringItem(
        'tray-mixed-vegetables-large',
        'Large Tray Mixed Vegetables',
        6500,
        'Large tray of sauteed vegetable mix',
        { tags: ['vegetarian', 'vegan'] }
      ),
      createCateringItem(
        'tray-spaghetti-large',
        'Large Tray Spaghetti',
        6500,
        'Large tray of spaghetti with meat sauce'
      ),
      createCateringItem(
        'catering-chicken-salad-pound',
        'Chicken Salad by the Pound',
        1500,
        'One pound of homemade chicken salad'
      ),
      createCateringItem(
        'catering-tuna-salad-pound',
        'Tuna Salad by the Pound',
        1500,
        'One pound of homemade tuna salad'
      ),
      createCateringItem(
        'gallon-sweet-tea',
        'Gallon Sweet Tea',
        1200,
        'One gallon of freshly brewed sweet tea',
        { tags: ['vegetarian', 'vegan'] }
      ),
      createCateringItem(
        'gallon-unsweet-tea',
        'Gallon Unsweet Tea',
        1200,
        'One gallon of freshly brewed unsweet tea',
        { tags: ['vegetarian', 'vegan'] }
      ),
      createCateringItem(
        'gallon-lemonade',
        'Gallon Lemonade',
        1200,
        'One gallon of chilled lemonade',
        { tags: ['vegetarian', 'vegan'] }
      ),
      createCateringItem(
        'gallon-strawberry-lemonade',
        'Gallon Strawberry Lemonade',
        1500,
        'One gallon of strawberry lemonade',
        { tags: ['vegetarian', 'vegan'] }
      ),
      createCateringItem(
        'box-of-coffee',
        'Box of Coffee',
        2500,
        'Ninety six ounces of freshly brewed coffee with cups',
        { tags: ['vegetarian', 'vegan'] }
      ),
      createCateringItem(
        'utensils-for-group',
        'Utensils for a Group of 8',
        800,
        'Plates, forks, knives, and napkins for eight'
      ),
      createCateringItem(
        'cups-and-straws',
        'Cups and Straws for 8',
        400,
        'Cups and straws for eight'
      ),
    ]
  ),
  createCategory(
    'special-orders',
    'Special Orders',
    'Whole desserts made for your event, with a message written on top. Forty eight hours notice.',
    [
      createCateringItem(
        'catering-fruit-pie',
        'Catering Fruit Pie',
        6595,
        'Full size fruit pie made for an event, choice of flavor',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-cream-pie',
        'Catering Cream Pie',
        6595,
        'Full size cream pie made for an event, choice of flavor',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-meringue-pie',
        'Catering Meringue Pie',
        6595,
        'Full size meringue pie made for an event, choice of flavor',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-cheesecake',
        'Catering Cheesecake',
        6795,
        'Full size cheesecake made for an event, choice of flavor',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-cake',
        'Catering Cake',
        6195,
        'Full size layer cake made for an event, choice of flavor',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-mini-pies-6',
        'Catering Mini Pies, Set of 6',
        4000,
        'Six five inch pies, mixed flavors',
        { imageId: 'mini-pies', tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-dozen-cookies',
        'Catering Dozen Cookies',
        2000,
        'Twelve cookies, mixed flavors',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-brownies',
        'Catering Brownies',
        4000,
        'One dozen fudge brownies',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'catering-cream-puffs-10',
        'Catering Cream Puffs, Set of 10',
        7500,
        'Ten cream puffs with chocolate topping',
        { tags: ['vegetarian'] }
      ),
      createCateringItem(
        'custom-inscribed-cake',
        'Custom Inscribed Cake',
        3495,
        'A whole cake in your choice of flavor with your own message written on top',
        { imageId: 'cake-1', tags: ['vegetarian'] }
      ),
      createCateringItem(
        'custom-inscribed-pie',
        'Custom Inscribed Pie',
        2495,
        'A whole pie in your choice of flavor with your own message written on top',
        { imageId: 'bakery-case', tags: ['vegetarian'] }
      ),
    ]
  ),
];
