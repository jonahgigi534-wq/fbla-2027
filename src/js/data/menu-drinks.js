/**
 * Drinks: the espresso bar, tea and fountain sodas, and the juice and milk case.
 *
 * Names, descriptions, and prices follow the restaurant's own online menu.
 * Assembled into the full catalog by menu.js. Sourcing is recorded in docs/CREDITS.md.
 */

import { createCategory, createItem } from './menuItem.js';

/** Drink categories, in the order the restaurant lists them. */
export const DRINK_CATEGORIES = [
  createCategory('coffee', 'Coffee', 'Ground fresh for every pot, plus the espresso bar.', [
    createItem('bottled-water', 'Bottled Water', 195, 'Bottled still water', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem('sparkling-water', 'Sparkling Water', 395, 'Bottled sparkling water', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem(
      'coffee',
      'Coffee',
      295,
      'A cup of freshly brewed coffee, ground from whole beans for every pot',
      { tags: ['vegetarian', 'vegan'] }
    ),
    createItem(
      'decaf-coffee',
      'Decaf Coffee',
      295,
      'A cup of freshly brewed decaf coffee, ground from whole beans for every pot',
      { tags: ['vegetarian', 'vegan'] }
    ),
    createItem(
      'espresso',
      'Espresso',
      295,
      'A concentrated shot of coffee brewed with finely ground beans',
      { tags: ['vegetarian', 'vegan'] }
    ),
    createItem(
      'iced-black-coffee',
      'Iced Black Coffee',
      495,
      'A deep dark shot of espresso brewed over ice',
      { tags: ['vegetarian', 'vegan'] }
    ),
    createItem(
      'cappuccino',
      'Cappuccino',
      495,
      'A deep dark shot of espresso mixed with heated frothy milk',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'hot-latte',
      'Hot Latte',
      525,
      'A deep dark shot of espresso mixed with heated milk',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'iced-latte',
      'Iced Latte',
      525,
      'A deep dark shot of espresso mixed with milk over ice',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'hot-vanilla-latte',
      'Hot Vanilla Latte',
      525,
      'A deep dark shot of espresso mixed with heated milk and vanilla flavoring',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'iced-vanilla-latte',
      'Iced Vanilla Latte',
      525,
      'A deep dark shot of espresso mixed with milk and vanilla flavoring over ice',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'hot-mocha-latte',
      'Hot Mocha Latte',
      525,
      'A deep dark shot of espresso mixed with heated milk and cocoa',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'iced-mocha-latte',
      'Iced Mocha Latte',
      525,
      'A deep dark shot of espresso mixed with milk and cocoa over ice',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'hot-chocolate',
      'Hot Chocolate',
      395,
      'Hot cocoa in a cup, topped off with homemade whipped cream',
      { tags: ['vegetarian'] }
    ),
  ]),
  createCategory('tea-soda', 'Tea & Soda', 'Brewed tea and the fountain.', [
    createItem('hot-tea', 'Hot Tea', 295, 'A choice of variety tea, lemon, and honey', {
      tags: ['vegetarian'],
    }),
    createItem('unsweet-iced-tea', 'Unsweet Iced Tea', 295, 'Freshly brewed iced tea', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem(
      'sweet-iced-tea',
      'Sweet Iced Tea',
      295,
      'Freshly brewed iced tea with a generous helping of sugar',
      { tags: ['vegetarian', 'vegan'] }
    ),
    createItem('coke', 'Coke', 345, 'Classic cola', { tags: ['vegetarian', 'vegan'] }),
    createItem('diet-coke', 'Diet Coke', 345, 'Diet cola', { tags: ['vegetarian', 'vegan'] }),
    createItem('coke-zero', 'Coke Zero', 345, 'Zero sugar cola', {
      tags: ['vegetarian', 'vegan', 'sugar-free'],
    }),
    createItem('dr-pepper', 'Dr Pepper', 345, 'Dr Pepper', { tags: ['vegetarian', 'vegan'] }),
    createItem('lemonade', 'Lemonade', 345, 'Chilled lemonade', { tags: ['vegetarian', 'vegan'] }),
    createItem('sprite', 'Sprite', 345, 'Lemon lime soda', { tags: ['vegetarian', 'vegan'] }),
    createItem(
      'float',
      'Float',
      495,
      'Your choice of soda with a heaping scoop of vanilla ice cream',
      { tags: ['vegetarian'] }
    ),
  ]),
  createCategory('juice-milk', 'Juice & Milk', 'Chilled juice, milk, and the shake machine.', [
    createItem('apple-juice', 'Apple Juice', 325, 'Refreshing apple juice', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem('cranberry-juice', 'Cranberry Juice', 325, 'Refreshing cranberry juice', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem('orange-juice', 'Orange Juice', 325, 'Refreshing orange juice', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem('citrus-peach-juice', 'Citrus Peach Juice', 325, 'Refreshing citrus peach juice', {
      tags: ['vegetarian', 'vegan'],
    }),
    createItem('milk', 'Milk', 325, 'Whole milk', { tags: ['vegetarian'] }),
    createItem('chocolate-milk', 'Chocolate Milk', 375, 'Whole milk with chocolate syrup', {
      tags: ['vegetarian'],
    }),
    createItem(
      'milk-shake',
      'Milk Shake',
      595,
      'A thick and creamy concoction of ice cream, milk, your choice of flavors, and whipped cream',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'malted-shake',
      'Malted Shake',
      595,
      'A thick and creamy concoction of ice cream, milk, your choice of malted flavors, and whipped cream',
      { tags: ['vegetarian'] }
    ),
  ]),
];
