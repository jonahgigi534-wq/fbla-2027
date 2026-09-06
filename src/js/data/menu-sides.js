/**
 * A la carte sides: potatoes, breads, fruit, vegetables, and extra meat.
 *
 * These are the same sides the plates above include one of, sold on their own.
 * The restaurant lists close to ninety of them; this catalog carries the ones a
 * customer actually adds to a digital order, which keeps the side list scannable
 * on a phone instead of burying the useful choices.
 *
 * Assembled into the full catalog by menu.js. Sourcing is recorded in docs/CREDITS.md.
 */

import { createCategory, createItem } from './menuItem.js';

/** Side categories, in the order the restaurant lists them. */
export const SIDE_CATEGORIES = [
  createCategory('side-potatoes', 'Potatoes', 'Hash browns, fries, grits, and the rest of the griddle sides.', [
    createItem('side-hash-brown', 'Side Hash Brown', 395, 'A side of golden brown crispy hash brown', { tags: ['vegetarian'] }),
    createItem('side-french-fries', 'Side French Fries', 395, 'A side of perfectly fried French fries', { tags: ['vegetarian'] }),
    createItem('side-cottage-fries', 'Side Cottage Fries', 395, 'A side of perfectly fried tater circles', { tags: ['vegetarian'] }),
    createItem('side-obrien-potatoes', "Side O'Brien Potatoes", 395, 'Chopped potatoes, green bell peppers, and onions grilled with seasoning', { tags: ['vegetarian'] }),
    createItem('side-mashed-potatoes', 'Side Mashed Potatoes', 395, 'A side of creamy mashed potatoes', { tags: ['vegetarian'] }),
    createItem('side-loaded-mashed-potatoes', 'Side Loaded Mashed Potatoes', 595, 'Creamy mashed potatoes, cheddar cheese, bacon bits, chives'),
    createItem('side-onion-rings', 'Side Onion Rings', 695, 'A side of onion rings battered in panko', { tags: ['vegetarian'] }),
    createItem('side-mac-and-cheese', 'Side Macaroni & Cheese', 395, 'A side of creamy macaroni and cheese', { tags: ['vegetarian'] }),
    createItem('side-sweet-potato-fries', 'Side Sweet Potato Fries', 495, 'A side of perfectly fried sweet potato fries', { tags: ['vegetarian'] }),
    createItem('side-cup-grits', 'Side Cup Grits', 295, 'A cup of traditional grits, 8 oz', { tags: ['vegetarian'] }),
    createItem('side-bowl-grits', 'Side Bowl Grits', 395, 'A bowl of traditional grits, 12 oz', { tags: ['vegetarian'] }),
    createItem('side-bowl-oatmeal', 'Side Bowl Oatmeal', 495, 'A bowl of oatmeal with the fixings on the side, 12 oz', { tags: ['vegetarian'] }),
  ]),
  createCategory('side-meat', 'Extra Meat', 'Add bacon, sausage, steak, or shrimp to anything.', [
    createItem('side-4-bacon', 'Side 4 Bacon Strips', 395, 'Four strips of bacon'),
    createItem('side-2-bacon', 'Side 2 Bacon Strips', 245, 'Two strips of bacon'),
    createItem('side-2-sausage', 'Side 2 Sausage Patties', 395, 'Two sausage patties'),
    createItem('side-1-sausage', 'Side 1 Sausage Patty', 245, 'One sausage patty'),
    createItem('side-2-turkey-sausage', 'Side 2 Turkey Sausage Patties', 395, 'Two turkey sausage patties'),
    createItem('side-ham-steak', 'Side Ham Steak', 395, '4 oz ham steak'),
    createItem('side-smoked-sausage', 'Side Smoked Sausage', 395, '4 oz smoked sausage'),
    createItem('side-corned-beef-hash', 'Side Corned Beef Hash', 595, '8 oz corned beef hash'),
    createItem('side-beef-fajitas', 'Side Beef Fajitas', 995, '8 oz fajita meat, onions, green bell peppers', { soldOut: true }),
    createItem('side-chicken-fajitas', 'Side Chicken Fajitas', 995, '8 oz chicken breast, onions, green bell peppers', { soldOut: true }),
    createItem('side-chicken-fried-steak', 'Side Chicken Fried Steak', 695, '6 oz chicken fried steak'),
    createItem('side-philly-meat', 'Side Philly Meat', 695, 'Thinly sliced ribeye grilled with green bell peppers, onions, and mushrooms'),
    createItem('side-ribeye-steak', 'Side Ribeye Steak', 1295, '8 oz ribeye steak cooked to your liking'),
    createItem('side-chicken-breast', 'Side Chicken Breast', 595, '8 oz chicken breast'),
    createItem('side-chicken-tenders', 'Side Chicken Tenders', 795, 'Five chicken tender strips'),
    createItem('side-shrimp', 'Side Shrimp', 895, 'Marinated shrimp grilled or fried'),
    createItem('side-fish-fillet', 'Side Fish Fillet', 695, 'Fish fillet pieces grilled or fried'),
    createItem('side-meatloaf', 'Side Meatloaf', 895, '12 oz meatloaf served with a side of gravy'),
  ]),
  createCategory('side-fruit', 'Fruit & Yogurt', 'Fresh fruit, cottage cheese, and yogurt.', [
    createItem('side-peaches', 'Side Peaches', 295, 'A side of peaches', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-banana', 'Side Banana', 295, 'A side of sliced bananas', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-blueberries', 'Side Blueberries', 295, 'A side of blueberries', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-pineapples', 'Side Pineapples', 295, 'A side of diced pineapples', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-melon', 'Side Melon', 295, 'Three slices of cantaloupe', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-strawberries', 'Side Strawberries', 325, 'A side of sliced strawberries', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-avocado', 'Side Avocado', 295, 'A side of sliced avocado', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-fruit-cup', 'Side Fruit Cup', 295, 'Peaches, pineapples, cantaloupe, strawberries, and green apples', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-yogurt', 'Side Yogurt', 295, 'A side of vanilla yogurt', { tags: ['vegetarian'] }),
    createItem('side-cottage-cheese', 'Side Cottage Cheese', 325, 'A side of cottage cheese', { tags: ['vegetarian'] }),
  ]),
  createCategory('side-bread', 'Bread', 'Toast, biscuits, muffins, and tortillas.', [
    createItem('side-white-toast', 'Side White Toast', 195, 'Toasted white bread with butter', { tags: ['vegetarian'] }),
    createItem('side-wheat-toast', 'Side Wheat Toast', 195, 'Toasted wheat bread with butter', { tags: ['vegetarian'] }),
    createItem('side-raisin-toast', 'Side Raisin Toast', 195, 'Toasted raisin bread with butter', { tags: ['vegetarian'] }),
    createItem('side-herb-toast', 'Side Herb Toast', 195, 'Toasted herb bread with butter', { tags: ['vegetarian'] }),
    createItem('side-texas-toast', 'Side Texas Toast', 195, 'Toasted Texas bread with butter', { tags: ['vegetarian'] }),
    createItem('side-english-muffin', 'Side English Muffin', 195, 'Toasted English muffin with butter', { tags: ['vegetarian'] }),
    createItem('side-bagel', 'Side Bagel', 195, 'Toasted bagel, cream cheese on the side', { tags: ['vegetarian'] }),
    createItem('side-flour-tortillas', 'Side Flour Tortillas', 195, 'Toasted flour tortillas', { tags: ['vegetarian'] }),
    createItem('side-dinner-roll', 'Side Dinner Roll', 195, 'Oven baked dinner roll, butter on the side', { tags: ['vegetarian'] }),
    createItem('side-biscuits', 'Side Biscuits', 195, 'Freshly baked biscuits, butter on the side', { tags: ['vegetarian'] }),
    createItem('side-biscuits-gravy', 'Side Biscuits & Gravy', 195, 'Freshly baked biscuits, gravy on the side'),
  ]),
  createCategory('side-vegetables', 'Vegetables', 'Sauteed and fresh vegetable sides.', [
    createItem('side-mushrooms', 'Side Mushrooms', 295, 'A side of sauteed mushrooms', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-spinach', 'Side Spinach', 295, 'A side of sauteed spinach', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-jalapeno', 'Side Jalapeno', 155, 'A side of pickled sliced jalapenos', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-sliced-tomatoes', 'Side Sliced Tomatoes', 295, 'A side of sliced tomatoes', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-frijoles', 'Side Frijoles', 295, 'A side of piping hot beans cooked with seasoning', { tags: ['vegetarian'] }),
    createItem('side-vegetable-of-the-day', 'Side Vegetable of the Day', 295, 'A side of freshly sauteed vegetable mix', { tags: ['vegetarian', 'vegan'] }),
    createItem('side-pickles', 'Side Pickles', 95, 'A side of crinkle cut pickles', { tags: ['vegetarian', 'vegan'] }),
  ]),
];
