/**
 * Savory half of the House of Pies menu: appetizers, soups and salads, the kids
 * menu, dinner plates, fusion specials, burgers, and sandwiches.
 *
 * Names, descriptions, and prices follow the restaurant's own online menu.
 * Assembled into the full catalog by menu.js. Sourcing is recorded in docs/CREDITS.md.
 */

import { createCategory, createItem } from './menuItem.js';

/** Savory categories, in the order the restaurant lists them. */
export const SAVORY_CATEGORIES = [
  createCategory(
    'appetizers',
    'Appetizers',
    'Something to share while the kitchen works on the rest.',
    [
      createItem('pickle-fries', 'Pickle Fries', 695, 'Battered Pickle Strips, Fried', { tags: ['vegetarian'] }),
      createItem('mini-corn-dogs', 'Mini Corn Dogs', 695, 'Mini Corn Dogs'),
      createItem('wings-with-a-zing', 'Wings With A Zing', 995, 'Slightly Spicy Fried Wings'),
      createItem('cauliflower-wings', 'Cauliflower Wings', 795, 'Battered Cauliflower Wings, Fried', { tags: ['vegetarian'] }),
      createItem('spicy-cheese-curds', 'Spicy Cheese Curds', 795, 'Spicy Cheese Curds, Fried', { tags: ['vegetarian'] }),
      createItem('battered-onion-rings', 'Battered Onion Rings', 695, 'Battered Onion Rings, Fried', { tags: ['vegetarian'] }),
      createItem('mozzarella-sticks', 'Breaded Mozzarella Sticks', 795, 'Breaded Mozzarella Sticks, Fried', { tags: ['vegetarian'] }),
      createItem('southwest-chicken-egg-rolls', 'Southwest Chicken Egg Rolls', 895, 'Creamy Southwest Chicken Egg Rolls, Fried'),
      createItem('pick-3-sampler', 'Pick 3 Sampler', 1595, 'Any three appetizers on one platter'),
      createItem('shrimp-basket', 'Shrimp Basket', 895, 'Panko Crusted Shrimp, Fried'),
      createItem('chicken-tenders-app', 'Chicken Tenders', 795, 'Battered Chicken Breast Strips, Fried'),
      createItem('chili-cheese-fries', 'Chili Cheese Fries', 895, 'French Fries, Chili, Cheddar Cheese, Onions, Bacon Bits'),
      createItem('chicken-quesadilla', 'Chicken Quesadilla', 1095, 'Chicken, Jack Cheese, Onions, Between 4 Flour Tortillas, Picante, Sour Cream'),
      createItem('beef-quesadilla', 'Beef Quesadilla', 1195, 'Beef, Jack Cheese, Onions, Between 4 Flour Tortillas, Picante, Sour Cream'),
      createItem('shrimp-quesadilla', 'Shrimp Quesadilla', 1295, 'Shrimp, Jack Cheese, Onions, Between 4 Flour Tortillas, Picante, Sour Cream'),
    ]
  ),
  createCategory(
    'soups-salads',
    'Soups & Salad',
    'Lighter plates, plus soup and chili by the cup, bowl, or extra large bowl.',
    [
      createItem('dinner-salad', 'Dinner Salad', 395, 'Green Leaf Lettuce, Romaine Lettuce, Carrot, Red Cabbage, Red Radish, Cucumber', { tags: ['vegetarian', 'vegan'] }),
      createItem('soup-cup', 'Homemade Soup Cup', 395, 'Soup of the day, 8 oz cup'),
      createItem('soup-bowl', 'Homemade Soup Bowl', 595, 'Soup of the day, 12 oz bowl'),
      createItem('soup-xl-bowl', 'Homemade Soup XL Bowl', 1195, 'Soup of the day, extra large bowl'),
      createItem('chili-cup', 'Chili Cup', 595, 'Homemade chili, 8 oz cup'),
      createItem('chili-bowl', 'Chili Bowl', 795, 'Homemade chili, 12 oz bowl'),
      createItem('chili-xl-bowl', 'Chili XL Bowl', 1495, 'Homemade chili, extra large bowl'),
      createItem('chefs-salad', "Chef's Salad", 1295, 'Mixed Salad, Turkey, Ham, Swiss Cheese, American Cheese, Tomatoes, Hard Boiled Egg, Choice of Dressing'),
      createItem('taco-salad', 'Taco Salad', 1295, 'Mixed Salad, Taco Meat, Onions, Bell Peppers, Chives, Mushrooms, Cheddar Cheese, Jack Cheese, Tortilla Chips, Picante, Sour Cream'),
      createItem('spinach-bacon-salad', 'Spinach & Bacon Salad', 1195, 'Spinach, Strawberries, Pecans, Bacon Bits, Cheddar Cheese, Hard Boiled Egg, Choice of Dressing'),
      createItem('hot-grilled-chicken-salad', 'Hot Grilled Chicken Salad', 1295, 'Mixed Salad, Grilled Chicken Strips, Bell Peppers, Onions, Tomatoes, Hard Boiled Egg, Choice of Dressing'),
      createItem('chicken-tender-salad', 'Chicken Tender Salad', 1295, 'Mixed Salad, Fried Chicken Tenders, Tomatoes, Choice of Dressing'),
      createItem('grilled-shrimp-salad', 'Grilled Shrimp Salad', 1495, 'Mixed Salad, Grilled Shrimp, Bell Peppers, Onions, Tomatoes, Hard Boiled Egg, Choice of Dressing'),
      createItem('tuna-salad-boat', 'Tuna Salad Boat', 1095, 'Mixed Salad, Tuna Salad, Tomato, Hard Boiled Egg, Choice of Dressing'),
      createItem('avocado-boat', 'Avocado Boat', 1195, 'Mixed Salad, Chicken Salad, Avocado, Hard Boiled Egg, Choice of Dressing'),
      createItem('fruit-salad', 'Fruit Salad', 1195, 'Assorted Seasonal Fruit, Choice of Sherbet, Cottage Cheese, or Yogurt', { tags: ['vegetarian'] }),
      createItem('loaded-baked-potato', 'Loaded Baked Potato', 695, 'Baked Potato, Butter, Cheddar Cheese, Sour Cream, Bacon Bits, Chives'),
      createItem('chili-topped-potato', 'Chili Topped Potato', 995, 'Baked Potato, Chili, Cheddar Cheese, Onions'),
      createItem('philly-baked-potato', 'Philly Baked Potato', 1095, 'Baked Potato, Thinly Sliced Ribeye, Bell Peppers, Onions, Mushrooms, Chives'),
      createItem('chicken-baked-potato', 'Chicken Baked Potato', 1095, 'Baked Potato, Grilled Chicken, Cheddar Cheese, Chives'),
    ]
  ),
  createCategory(
    'kids-corner',
    'Kids Corner',
    'Smaller plates for smaller appetites.',
    [
      createItem('kids-pancakes', 'Kids Pancakes', 795, '2 Eggs, 2 Buttermilk Pancakes, Choice of 2 Strips Bacon, 1 Sausage Patty, or Half Ham Steak'),
      createItem('kids-french-toast', 'Kids French Toast', 795, '2 Eggs, 2 French Toast Triangles, Choice of 2 Strips Bacon, 1 Sausage Patty, or Half Ham Steak'),
      createItem('kids-grilled-cheese', 'Kids Grilled Cheese & Fries', 795, 'American Cheese, White Toast, Pickles, French Fries', { tags: ['vegetarian'] }),
      createItem('kids-cheeseburger', 'Kids Cheeseburger & Fries', 795, 'Lean Ground Beef Patty, American Cheese, Sesame Seed Bun, French Fries'),
      createItem('kids-chicken-fingers', 'Kids Chicken Fingers & Fries', 795, '3 Chicken Tender Strips, French Fries'),
      createItem('kids-mini-corn-dogs', 'Kids Mini Corn Dogs & Fries', 795, '5 Mini Corn Dogs, French Fries'),
      createItem('kids-spaghetti', 'Kids Spaghetti & Meat Sauce', 795, 'Spaghetti, Meat Sauce'),
      createItem('kids-mac-cheese', "Kids Mac 'N Cheese & Fruit Cup", 795, "Bowl Mac 'N Cheese, Fruit Cup", { tags: ['vegetarian'] }),
    ]
  ),
  createCategory(
    'lunch-dinner',
    'Lunch & Dinner Specials',
    'Full plates with a side, the vegetable of the day, and soup or salad.',
    [
      createItem('chicken-pot-pie-dinner', 'Chicken Pot Pie Dinner', 1595, 'Chicken Pot Pie, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('grilled-chicken-breast', 'Grilled Chicken Breast', 1595, 'Grilled Chicken Breast, Mushrooms, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('monterey-chicken', 'Monterey Chicken', 1695, 'Grilled Chicken Breast, Mushrooms, Jack Cheese, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('chicken-tenders-platter', 'Chicken Tenders Platter', 1595, '5 Chicken Tender Strips, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('chopped-steak', 'Chopped Steak', 1595, '8 oz Ground Beef Patty, Mushrooms, Onions, Brown Gravy, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('grilled-pork-chops', 'Grilled Pork Chops', 1795, '2 Lightly Breaded Pork Chops, Onions, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('ribeye-steak-dinner', 'Ribeye Steak Dinner', 2095, '8 oz Ribeye Steak, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('ribeye-steak-shrimp', 'Ribeye Steak & Shrimp', 2395, '8 oz Ribeye Steak, 4 Grilled Shrimp, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('chicken-fried-steak', 'Chicken Fried Steak', 1695, '6 oz Chicken Fried Steak, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('chicken-fried-chicken', 'Chicken Fried Chicken', 1695, '8 oz Chicken Fried Chicken, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('fish-platter', 'Fish Platter', 1695, 'Catfish Fillet Fried or Grilled, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('shrimp-platter', 'Shrimp Platter', 1795, 'Shrimp Fried or Grilled, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
      createItem('fish-and-chips', 'Fish & Chips', 1695, 'Hand Battered Fish Fillet, 1 Side Choice, Vegetable of the Day, Soup or Salad'),
    ]
  ),
  createCategory(
    'fusion-specials',
    'Fusion Specials',
    'Comfort classics and Tex-Mex plates.',
    [
      createItem('spaghetti-meat-sauce', 'Spaghetti & Meat Sauce', 1595, 'Spaghetti, Meat Sauce, Garlic Toast, Soup or Salad'),
      createItem('chicken-parmesan', 'Chicken Parmesan', 1695, 'Hand Breaded Chicken Breast, Swiss Cheese, Marinara Sauce, Spaghetti, Soup or Salad'),
      createItem('meatloaf', 'Meatloaf', 1595, 'Homemade Meatloaf, Brown Gravy, Mashed Potatoes, Vegetable of the Day, Soup or Salad'),
      createItem('loaded-mac-cheese', "Loaded Mac 'N Cheese", 1595, "Mac 'N Cheese, Chopped Chicken Tenders, Bacon Bits, Cheddar Cheese, Chives, Soup or Salad"),
      createItem('beef-tacos', 'Beef Tacos', 1295, 'Beef Tacos, Lettuce, Tomatoes, Cheddar Cheese, Frijoles, Picante, Sour Cream'),
      createItem('fried-chicken-tacos', 'Fried Chicken Tacos', 1295, 'Fried Chicken Tacos, Lettuce, Tomatoes, Cheddar Cheese, Frijoles, Picante, Sour Cream'),
      createItem('fried-fish-tacos', 'Fried Fish Tacos', 1295, 'Fried Fish Tacos, Lettuce, Tomatoes, Cheddar Cheese, Frijoles, Picante, Sour Cream'),
      createItem('grilled-shrimp-tacos', 'Grilled Shrimp Tacos', 1295, 'Grilled Shrimp Tacos, Lettuce, Tomatoes, Cheddar Cheese, Frijoles, Picante, Sour Cream'),
    ]
  ),
  createCategory(
    'burgers',
    'Crafted Burgers',
    'Half pound patties on a sesame seed bun, served with a side.',
    [
      createItem('hamburger', 'Hamburger', 1295, '8 oz Ground Beef Patty, Sesame Seed Bun, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
      createItem('cheeseburger', 'Cheeseburger', 1395, '8 oz Ground Beef Patty, Cheese Choice, Sesame Seed Bun, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
      createItem('bacon-cheeseburger', 'Bacon Cheeseburger', 1495, '8 oz Ground Beef Patty, Cheese Choice, 2 Bacon Strips, Sesame Seed Bun, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
      createItem('mushroom-swiss-burger', 'Mushroom Swiss Burger', 1495, '8 oz Ground Beef Patty, Cheese Choice, Mushrooms, Onions, Sesame Seed Bun, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
      createItem('chili-burger', 'Chili Burger', 1495, '8 oz Ground Beef Patty, Chili, Onions, Cheese Choice, 1 Side Choice'),
      createItem('avocado-burger', 'Avocado Burger', 1395, '8 oz Ground Beef Patty, Cheese Choice, Avocado, Sesame Seed Bun, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
      createItem('bayou-city-burger', 'Bayou City Burger', 1695, '8 oz Ground Beef Patty, Cheese Choice, Fried Egg, Mushrooms, Jalapeno, 2 Bacon Strips, Sesame Seed Bun, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice', { popular: true, imageId: 'bayou-city-burger' }),
      createItem('cheeseburger-club', 'Cheeseburger Club', 1195, '8 oz Ground Beef Patty, 2 Bacon Strips, American Cheese, Toasted White Bread, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
    ]
  ),
  createCategory(
    'sandwiches-melts',
    'Sandwiches & Melts',
    'Diner sandwiches, po boys, and griddled melts.',
    [
      createItem('blt', 'BLT', 1095, 'Toasted White Bread, 4 Bacon Strips, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('bltec-sandwich', 'BLTEC Sandwich', 1295, 'Toasted White Bread, 4 Bacon Strips, Fried Egg, American Cheese, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('grilled-cheese-sandwich', 'Grilled Cheese Sandwich', 895, 'Toasted White Bread, American Cheese, Swiss Cheese, Cheddar Cheese, Pickles, 1 Side Choice', { tags: ['vegetarian'] }),
      createItem('deli-delight-sandwich', 'Deli Delight Sandwich', 1095, 'Choice of Ham, Turkey, or Roast Beef, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('tuna-salad-sandwich', 'Tuna Salad Sandwich', 995, 'Homemade Tuna, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('chicken-salad-sandwich', 'Chicken Salad Sandwich', 995, 'Homemade Chicken Salad with Raisin and Pecan Pieces, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('regency-club', 'Regency Club', 1195, 'Deli Turkey Breast, 2 Bacon Strips, Toasted White Bread, Lettuce, Tomato, Pickles, Mayo, 1 Side Choice'),
      createItem('shrimp-po-boy', 'Shrimp Po Boy', 1495, 'Shrimp Fried or Grilled, Hoagie Roll, Lettuce, Tomato, Tartar Sauce, 1 Side Choice'),
      createItem('fish-po-boy', 'Fish Po Boy', 1295, 'Fillet of Fish Fried or Grilled, Hoagie Roll, Lettuce, Tomato, Tartar Sauce, 1 Side Choice'),
      createItem('monte-cristo', 'Monte Cristo', 1395, 'Deli Ham, Deli Turkey Breast, Swiss Cheese, White Bread, Egg Cream Batter, Fried, Powdered Sugar, 1 Side Choice'),
      createItem('grilled-chicken-sandwich', 'Grilled Chicken Sandwich', 1195, 'Grilled Chicken Breast, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('monterey-chicken-sandwich', 'Monterey Chicken Sandwich', 1395, 'Grilled Chicken Breast, Monterey Jack Cheese, Mushrooms, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('texas-fried-chicken-sandwich', 'Texas Fried Chicken Sandwich', 1695, 'Chicken Fried Chicken, Choice of Cheese, Mushrooms, Jalapeno, Bacon, Texas Toast, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('chicken-fried-chicken-sandwich', 'Chicken Fried Chicken Sandwich', 1395, 'Chicken Fried Chicken, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('chicken-fried-steak-sandwich', 'Chicken Fried Steak Sandwich', 1395, 'Chicken Fried Steak, Poppyseed Bun, Lettuce, Tomato, Mayo, Pickles, 1 Side Choice'),
      createItem('french-beef-dip', 'French Beef Dip', 1395, 'Roast Beef, Grilled Onions, Swiss Cheese, Hoagie Roll, Au Jus, 1 Side Choice'),
      createItem('philly-cheesesteak-sandwich', 'Philly Cheesesteak Sandwich', 1495, 'Grilled Thin Ribeye, Bell Peppers, Onions, Mushrooms, Swiss Cheese, Hoagie Roll, 1 Side Choice'),
      createItem('ribeye-steak-sandwich', 'Ribeye Steak Sandwich', 1695, '8 oz Ribeye Steak, Hoagie Roll, Lettuce, Tomato, 1 Side Choice'),
      createItem('patty-melt-deluxe', 'Patty Melt Deluxe', 1395, '8 oz Ground Beef Patty, Special Sauce, Grilled Onions, Tomato, American Cheese, Grilled Herb Bread, 1 Side Choice'),
      createItem('tuna-melt', 'Tuna Melt', 1195, 'Homemade Tuna, Special Sauce, American Cheese, Grilled Herb Bread, 1 Side Choice'),
      createItem('ham-swiss-melt', 'Ham & Swiss Melt', 1195, 'Deli Ham, Special Sauce, Tomato, Swiss Cheese, Grilled Herb Bread, Pickles, 1 Side Choice'),
      createItem('turkey-swiss-melt', 'Turkey & Swiss Melt', 1195, 'Deli Turkey Breast, Special Sauce, Tomato, Swiss Cheese, Grilled Herb Bread, Pickles, 1 Side Choice'),
    ]
  ),
];
