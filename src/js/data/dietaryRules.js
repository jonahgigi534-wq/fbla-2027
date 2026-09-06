/**
 * Keyword tables used to read allergens and dietary tags out of an item's
 * ingredient description.
 *
 * Read by domain/dietary.js, which does the matching. They live here as data rather
 * than inside that module so the rules can be reviewed and corrected by anyone
 * without touching logic, and so the matching function stays small enough to test.
 *
 * Deriving allergens from ingredients instead of hand tagging four hundred items
 * keeps the catalog honest: when a description changes, the allergen list follows.
 * It is not a substitute for asking the restaurant, which the UI says plainly.
 */

/**
 * Allergen name mapped to the ingredient words that imply it.
 *
 * Words are matched whole, case insensitively, against the item name and
 * description together. Order does not matter; every rule is checked.
 */
export const ALLERGEN_KEYWORDS = {
  egg: ['egg', 'eggs', 'omelette', 'meringue', 'custard', 'mayo', 'mayonnaise', 'hollandaise', 'benedict', 'eggsadillas'],
  dairy: ['milk', 'cheese', 'cheddar', 'swiss', 'jack', 'mozzarella', 'butter', 'buttermilk', 'cream', 'yogurt', 'gravy', 'custard', 'cheesecake', 'latte', 'cappuccino', 'mocha', 'curds'],
  wheat: ['bread', 'toast', 'bun', 'buns', 'biscuit', 'biscuits', 'pancake', 'pancakes', 'waffle', 'tortilla', 'tortillas', 'crust', 'batter', 'battered', 'breaded', 'flour', 'spaghetti', 'macaroni', 'muffin', 'bagel', 'roll', 'hoagie', 'cookie', 'cookies', 'brownie', 'cake', 'pastry', 'graham', 'panko', 'streusel', 'oats', 'oatmeal'],
  soy: ['soy', 'tofu', 'teriyaki'],
  fish: ['fish', 'catfish', 'tuna', 'fillet', 'anchovy', 'tartar'],
  shellfish: ['shrimp', 'crab', 'lobster', 'oyster'],
  'tree-nut': ['pecan', 'pecans', 'walnut', 'walnuts', 'almond', 'almonds', 'coconut', 'praline', 'cashew'],
  peanut: ['peanut', 'peanuts'],
};

/**
 * Words that mean an item contains meat or seafood.
 *
 * Used to withhold the vegetarian tag from anything whose description mentions one,
 * which is safer than assuming an item is meat free because nobody said otherwise.
 */
export const MEAT_KEYWORDS = [
  'bacon', 'sausage', 'ham', 'steak', 'beef', 'chicken', 'turkey', 'pork', 'chops',
  'meat', 'meatloaf', 'brisket', 'shrimp', 'fish', 'catfish', 'tuna', 'corned',
  'hash', 'chili', 'gravy', 'fajita', 'fajitas', 'philly', 'ribeye', 'patty',
  'patties', 'wings', 'tenders', 'tender', 'jus', 'deli', 'roast', 'taco', 'tacos',
];

/**
 * Every dietary tag the filter bar can show, with the label a customer reads.
 *
 * `vegetarian` and `vegan` come from the catalog and the meat keyword check.
 * `sugar-free` and `seasonal` are set by hand in the catalog files.
 */
export const DIETARY_TAGS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'sugar-free', label: 'Sugar free' },
  { id: 'seasonal', label: 'Seasonal' },
];

/** Labels shown next to each allergen in the item detail panel. */
export const ALLERGEN_LABELS = {
  egg: 'Egg',
  dairy: 'Dairy',
  wheat: 'Wheat',
  soy: 'Soy',
  fish: 'Fish',
  shellfish: 'Shellfish',
  'tree-nut': 'Tree nuts',
  peanut: 'Peanuts',
};
