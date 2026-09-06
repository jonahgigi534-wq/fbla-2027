/**
 * Breakfast half of the House of Pies menu: the Texas Breakfast plates, the
 * favorites regulars order by name, the griddle, and the three egg omelettes.
 *
 * House of Pies serves breakfast all day, so these are not gated by time of day.
 * Names, descriptions, and prices follow the restaurant's own online menu.
 * Assembled into the full catalog by menu.js. Sourcing is recorded in docs/CREDITS.md.
 */

import { createCategory, createItem } from './menuItem.js';

/** Breakfast categories, in the order the restaurant lists them. */
export const BREAKFAST_CATEGORIES = [
  createCategory(
    'texas-breakfast',
    'Texas Breakfast',
    'Two eggs your way with a side and a bread choice.',
    [
      createItem('eggs-alone', 'Eggs Alone', 895, '2 Eggs, 1 Side Choice, 1 Bread Choice'),
      createItem('bacon-eggs', 'Bacon & Eggs', 1245, '2 Eggs, 4 Bacon Strips, 1 Side Choice, 1 Bread Choice'),
      createItem('sausage-eggs', 'Sausage & Eggs', 1245, '2 Eggs, 2 Sausage Patties, 1 Side Choice, 1 Bread Choice'),
      createItem('ham-steak-eggs', 'Ham Steak & Eggs', 1245, '2 Eggs, 1 Ham Steak, 1 Side Choice, 1 Bread Choice'),
      createItem('turkey-sausage-eggs', 'Turkey Sausage & Eggs', 1245, '2 Eggs, 2 Turkey Sausage Patties, 1 Side Choice, 1 Bread Choice'),
      createItem('sunshine-breakfast', 'Sunshine Breakfast', 1245, '2 Eggs, 4 oz Peaches, Half Meat Choice, 1 Side Choice, 1 Bread Choice'),
      createItem('corned-beef-hash-eggs', 'Corned Beef Hash & Eggs', 1395, '2 Eggs, 8 oz Corned Beef Hash, 1 Side Choice, 1 Bread Choice'),
      createItem('chicken-fried-steak-eggs', 'Chicken Fried Steak & Eggs', 1395, '2 Eggs, 4 oz Chicken Fried Steak, 1 Side Choice, 1 Bread Choice'),
      createItem('chicken-fried-chicken-eggs', 'Chicken Fried Chicken & Eggs', 1395, '2 Eggs, 8 oz Chicken Fried Chicken, 1 Side Choice, 1 Bread Choice'),
      createItem('pork-chops-eggs', 'Pork Chops & Eggs', 1595, '2 Eggs, 2 Lightly Breaded Pork Chops, 1 Side Choice, 1 Bread Choice'),
      createItem('ribeye-steak-eggs', 'Ribeye Steak & Eggs', 1895, '2 Eggs, 8 oz Ribeye Steak, 1 Side Choice, 1 Bread Choice', { popular: true }),
      createItem('chopped-steak-eggs', 'Chopped Steak & Eggs', 1395, '2 Eggs, 8 oz Ground Beef Patty, 1 Side Choice, 1 Bread Choice'),
      createItem('chicken-breast-eggs', 'Chicken Breast & Eggs', 1395, '2 Eggs, 8 oz Chicken Breast, 1 Side Choice, 1 Bread Choice'),
    ]
  ),
  createCategory(
    'breakfast-favorites',
    'Breakfast Favorites',
    'The plates regulars order by name.',
    [
      createItem('sausage-scrambler', 'Sausage Scrambler', 1295, '2 Sausage Patties, Buttermilk Biscuits, Scrambled Eggs, White Gravy, 1 Side Choice', { popular: true, imageId: 'sausage-scrambler' }),
      createItem('huevos-rancheros', 'Huevos Rancheros', 1295, '2 Scrambled Eggs, Flour Tortilla, Picante, Cheddar and Jack Cheese, Frijoles, 1 Side Choice'),
      createItem('acapulco-breakfast', 'Acapulco Breakfast', 1295, '2 Scrambled Eggs, Taco Meat, Cheddar and Jack Cheese, Frijoles, 1 Side Choice, Flour Tortillas'),
      createItem('eggs-benedict', 'Eggs Benedict', 1395, '2 Poached Eggs, English Muffin, Ham Steak, Hollandaise Sauce, Paprika, 1 Side Choice'),
      createItem('avocado-toast', 'Avocado Toast', 1195, '1 Sunny Side Up Egg, Herb Toast, Avocado, Tomato, Spinach, Balsamic Vinaigrette, Paprika, 1 Side Choice'),
      createItem('bltec-breakfast', 'BLTEC Breakfast Sandwich', 1295, 'Bacon, Lettuce, Tomatoes, Over Hard Egg, American Cheese, White Toast, Mayonnaise, 1 Side Choice'),
      createItem('bagel-breakfast-sandwich', 'Bagel Breakfast Sandwich', 1195, '2 Eggs Omelette Style, Bagel, American Cheese, 2 Bacon Strips or 1 Sausage Patty, 1 Side Choice'),
      createItem('benedict-florentine', 'Benedict Florentine', 1395, '2 Poached Eggs, English Muffin, Tomatoes, Spinach, Mushroom, Hollandaise Sauce, Paprika, 1 Side Choice'),
      createItem('eggsadillas', 'Eggsadillas', 1195, "2 Eggs Scrambled, O'Brien Potatoes, Sausage, Cheddar Cheese, Between 2 Flour Tortillas, Frijoles, Picante, Sour Cream"),
      createItem('breakfast-tacos', 'Breakfast Tacos', 1195, "2 Eggs Scrambled, O'Brien Potatoes, Sausage or Bacon, Cheddar Cheese, Stuffed in 3 Flour Tortillas, Frijoles, Picante"),
      createItem('biscuits-sausage-gravy', 'Biscuits, Sausage & Gravy', 795, '2 Buttermilk Biscuits, 2 Sausage Patties, White Gravy'),
      createItem('overnight-oats-yogurt', 'Overnight Oats & Yogurt', 895, 'Oats, Milk, Honey, Yogurt, Bananas, Strawberries, Cinnamon', { tags: ['vegetarian'] }),
    ]
  ),
  createCategory(
    'from-the-griddle',
    'From The Griddle',
    'Pancakes, waffles, and French toast, served all day.',
    [
      createItem('griddle-platter', 'Griddle Platter', 795, 'Choice of Waffle, 4 French Toast Triangles, or 3 Pancakes'),
      createItem('club-breakfast', 'Club Breakfast', 895, '2 Eggs, 2 French Toast Triangles, Choice of 2 Strips Bacon, 1 Sausage Patty, or Half Ham Steak'),
      createItem('country-breakfast', 'Country Breakfast', 895, '2 Eggs, 2 Buttermilk Pancakes, Choice of 2 Strips Bacon, 1 Sausage Patty, or Half Ham Steak'),
      createItem('waffle-platter', 'Waffle Platter', 995, '2 Eggs, 1 Belgian Waffle, Choice of 2 Strips Bacon, 1 Sausage Patty, or Half Ham Steak'),
      createItem('banana-pecan-pancakes', 'Banana Pecan Pancakes', 1295, '3 Buttermilk Pancakes, Bananas, Pecan, Caramel, Powdered Sugar', { popular: true, imageId: 'pancakes', tags: ['vegetarian'] }),
      createItem('strawberry-cream-waffle', 'Strawberry Cream Waffle', 1295, '1 Belgian Waffle, Strawberries, Whipped Cream, Strawberry Glaze, Powdered Sugar', { tags: ['vegetarian'] }),
      createItem('french-toast-supreme', 'French Toast Supreme', 1395, 'French Toast Filled with Cream Cheese and Strawberry Jam, Strawberries, Whipped Cream, Strawberry Glaze, Powdered Sugar', { tags: ['vegetarian'] }),
      createItem('chicken-waffle', 'Chicken & Waffle', 1395, '1 Belgian Waffle, 3 Chicken Tender Strips'),
      createItem('single-waffle', 'Single Waffle', 795, '1 Belgian Waffle', { tags: ['vegetarian'] }),
      createItem('single-french-toast', 'Single French Toast', 495, '2 French Toast Triangles', { tags: ['vegetarian'] }),
      createItem('single-pancake', 'Single Pancake', 395, '1 Buttermilk Pancake', { tags: ['vegetarian'] }),
      createItem('short-stack', 'Short Stack', 595, '2 Buttermilk Pancakes', { tags: ['vegetarian'] }),
    ]
  ),
  createCategory(
    'omelettes',
    '3 Egg Omelettes',
    'Three eggs folded around whatever you are in the mood for.',
    [
      createItem('cheddar-omelette', 'Cheddar Cheese Omelette', 1095, '3 Egg Omelette, Cheddar Cheese, 1 Side Choice, 1 Bread Choice', { tags: ['vegetarian'] }),
      createItem('ham-cheese-omelette', 'Ham & Cheese Omelette', 1295, '3 Egg Omelette, Ham, Cheddar Cheese, 1 Side Choice, 1 Bread Choice'),
      createItem('bacon-cheese-omelette', 'Bacon & Cheese Omelette', 1295, '3 Egg Omelette, Bacon, Cheddar Cheese, 1 Side Choice, 1 Bread Choice'),
      createItem('sausage-cheese-omelette', 'Sausage & Cheese Omelette', 1295, '3 Egg Omelette, Sausage, Cheddar Cheese, 1 Side Choice, 1 Bread Choice'),
      createItem('turkey-sausage-omelette', 'Turkey Sausage & Cheese Omelette', 1295, '3 Egg Omelette, Turkey Sausage, Swiss Cheese, 1 Side Choice, 1 Bread Choice'),
      createItem('spinach-mushroom-swiss-omelette', 'Spinach, Mushroom & Swiss Omelette', 1295, '3 Egg Omelette, Spinach, Mushroom, Swiss Cheese, 1 Side Choice, 1 Bread Choice', { tags: ['vegetarian'] }),
      createItem('chili-cheddar-omelette', 'Chili & Cheddar Cheese Omelette', 1395, '3 Egg Omelette, Chili, Cheddar Cheese, Onions, 1 Side Choice, 1 Bread Choice'),
      createItem('denver-omelette', 'Denver Omelette', 1295, '3 Egg Omelette, Ham, Bell Peppers, Cheddar Cheese, 1 Side Choice, 1 Bread Choice'),
      createItem('acapulco-omelette', 'Acapulco Omelette', 1395, '3 Egg Omelette, Taco Meat, Cheddar Cheese, Jack Cheese, Picante, 1 Side Choice, 1 Bread Choice'),
      createItem('texan-omelette', 'Texan Omelette', 1495, '3 Egg Omelette, Bacon, Sausage, Jalapeno, Onions, Cheddar Cheese, 1 Side Choice, 1 Bread Choice', { popular: true, imageId: 'texan-omelette' }),
      createItem('hangover-omelette', 'Hangover Omelette', 1295, '3 Egg Omelette, Bell Peppers, Onions, Mushrooms, Cheddar Cheese, Picante, 1 Side Choice, 1 Bread Choice', { tags: ['vegetarian'] }),
      createItem('philly-cheesesteak-omelette', 'Philly Cheesesteak Omelette', 1495, '3 Egg Omelette, Thinly Sliced Ribeye, Bell Pepper, Onions, Mushrooms, Swiss Cheese, 1 Side Choice, 1 Bread Choice'),
    ]
  ),
];
