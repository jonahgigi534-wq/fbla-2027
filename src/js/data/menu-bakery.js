/**
 * The bakery case: pie and cake by the slice, whole pies and cakes to take home,
 * sundaes and shakes, and the cookies and muffins by the piece or the dozen.
 *
 * The `soldOut` flags are not invented. They mirror the items House of Pies had
 * marked out of stock when this catalog was captured, which gives the inventory
 * rules real cases to handle instead of made up ones.
 *
 * Assembled into the full catalog by menu.js. Sourcing is recorded in docs/CREDITS.md.
 */

import { createCategory, createItem } from './menuItem.js';

/** Bakery categories, in the order the restaurant lists them. */
export const BAKERY_CATEGORIES = [
  createCategory(
    'specialty-dessert',
    'Specialty Dessert',
    'Sundaes, shakes, and warm desserts made to order.',
    [
      createItem(
        'deep-dish-fruit-pie',
        'Deep Dish Fruit Pie',
        695,
        'Choice of Pie, Ice Cream Scoop, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem('cookies-and-milk', 'Cookies & Milk', 595, 'Choice of 2 Cookies, Glass of Milk', {
        tags: ['vegetarian'],
      }),
      createItem('ice-cream-scoop', 'Ice Cream Scoop', 295, '1 Scoop of Ice Cream', {
        tags: ['vegetarian'],
      }),
      createItem(
        'whipped-cream-side',
        'Whipped Cream Side',
        295,
        'A side of homemade whipped cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-sundae',
        'Chocolate Ice Cream Sundae',
        595,
        'Layers of Vanilla Ice Cream and Chocolate, Whipped Cream, Cherry',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'strawberry-sundae',
        'Strawberry Ice Cream Sundae',
        595,
        'Layers of Vanilla Ice Cream and Strawberry, Whipped Cream, Cherry',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'cookie-sundae',
        'Cookie Sundae',
        695,
        'Ice Cream between 2 Cookies, Whipped Cream, Chocolate Drizzle, Pecan Pieces, Cherry',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'banana-split',
        'Banana Split',
        895,
        'Vanilla, Chocolate, and Strawberry Ice Cream, Banana, Strawberry Preserves, Whipped Cream, Pecan Pieces, Chocolate Sprinkles, Chocolate Drizzle, Cherries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'brownie-sundae',
        'Brownie Sundae',
        695,
        'Fudge Brownie, Ice Cream Scoop, Whipped Cream, Pecan Pieces, Chocolate Sprinkles, Chocolate Drizzle, Cherry',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'pie-shake',
        'Pie Shake',
        895,
        'Vanilla Ice Cream, Milk, and Choice of Pie Blended Together, Whipped Cream, Cherry',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'cake-shake',
        'Cake Shake',
        995,
        'Vanilla Ice Cream, Milk, and Choice of Cake Blended Together, Whipped Cream, Cherry',
        { tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory(
    'fruit-pies-slice',
    'Fruit Pies by the Slice',
    'Double crusted fruit pies, cut fresh from the case.',
    [
      createItem(
        'apple-pie-slice',
        'Apple Pie Slice',
        495,
        'Traditional Double Crusted Pie with Apple Filling',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'dutch-apple-pie-slice',
        'Dutch Apple Pie Slice',
        495,
        'Apple Pie Topped with Crunchy Butter Streusel Topping',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'blueberry-pie-slice',
        'Blueberry Pie Slice',
        495,
        'Traditional Double Crusted Pie with Blueberry Filling',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'cherry-pie-slice',
        'Cherry Pie Slice',
        495,
        'Traditional Double Crusted Pie with Cherry Filling',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'peach-pie-slice',
        'Peach Pie Slice',
        495,
        'Traditional Double Crusted Pie with Peach Filling',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'strawberry-rhubarb-pie-slice',
        'Strawberry Rhubarb Pie Slice',
        495,
        'Traditional Double Crusted Pie with Strawberry and Rhubarb Filling',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'sugar-free-apple-pie-slice',
        'Sugar Free Apple Pie Slice',
        495,
        'Traditional Double Crusted Pie with Apple Filling made with Sorbitol instead of sugar',
        { tags: ['vegetarian', 'sugar-free'] }
      ),
      createItem(
        'sugar-free-cherry-pie-slice',
        'Sugar Free Cherry Pie Slice',
        495,
        'Traditional Double Crusted Pie with Cherry Filling made with Sorbitol instead of sugar',
        { tags: ['vegetarian', 'sugar-free'] }
      ),
    ]
  ),
  createCategory(
    'cream-pies-slice',
    'Cream Pies by the Slice',
    'Custard and mousse fillings under whipped cream.',
    [
      createItem(
        'bayou-goo-pie-slice',
        'Bayou Goo Pie Slice',
        495,
        'Pie Crust, Sweet Cream Cheese, Pecan Pieces, Vanilla Custard Filling mixed with Chocolate, Whipped Cream, Chocolate Shavings, Powdered Sugar',
        { popular: true, imageId: 'bayou-goo-pie', tags: ['vegetarian'] }
      ),
      createItem(
        'banana-cream-pie-slice',
        'Banana Cream Pie Slice',
        495,
        'Pie Crust, Whole Bananas, Vanilla Custard Filling, Whipped Cream, Pecan Pieces, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'bavarian-banana-pie-slice',
        'Bavarian Banana Pie Slice',
        495,
        'Pie Crust, Whole Bananas, Chocolate Mousse Filling, Whipped Cream, Pecan Pieces, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-cream-pie-slice',
        'Chocolate Cream Pie Slice',
        495,
        'Pie Crust, Chocolate Custard Filling, Whipped Cream, Chocolate Sprinkles',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'coconut-cream-pie-slice',
        'Coconut Cream Pie Slice',
        495,
        'Pie Crust, Vanilla Custard Filling Infused with Coconut Flakes, Whipped Cream, Toasted Coconut Flakes',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'german-chocolate-pie-slice',
        'German Chocolate Pie Slice',
        495,
        'Pie Crust, Chocolate Custard Filling mixed with Pecan Pieces and Coconut Flakes, Whipped Cream, Pecan Pieces, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'bavarian-chocolate-pie-slice',
        'Bavarian Chocolate Pie Slice',
        495,
        'Pie Crust, Chocolate Mousse Filling, Whipped Cream, Chocolate Shavings',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'french-silk-pie-slice',
        'French Silk Pie Slice',
        495,
        'Pie Crust, Chocolate Custard Filling and Chocolate Mousse Filling, Whipped Cream, Chocolate Shavings, Cherry',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'fresh-strawberry-pie-slice',
        'Fresh Strawberry Pie Slice',
        495,
        'Pie Crust, Fresh Strawberries, Strawberry Glaze, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'strawberry-cream-cheese-pie-slice',
        'Strawberry Cream Cheese Pie Slice',
        495,
        'Graham Cracker Crust, Cream Cheese Filling, Whole Strawberries, Strawberry Glaze, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory(
    'meringue-specialty-slice',
    'Meringue & Specialty Pies by the Slice',
    'Meringue tops, custards, and the Texas pecan pies.',
    [
      createItem(
        'chocolate-meringue-pie-slice',
        'Chocolate Meringue Pie Slice',
        475,
        'Pie Crust, Chocolate Custard Filling, Meringue Topping, Chocolate Sprinkles',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'coconut-meringue-pie-slice',
        'Coconut Meringue Pie Slice',
        475,
        'Pie Crust, Vanilla Custard Filling Infused with Coconut Flakes, Meringue Topping, Toasted Coconut Flakes',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'lemon-meringue-pie-slice',
        'Lemon Meringue Pie Slice',
        475,
        'Pie Crust, Tart Lemon Filling made from Egg Yolks, Lemon Juice, Sugar and Butter, Meringue Topping, Yellow Sprinkles',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'egg-cream-custard-pie-slice',
        'Egg Cream Custard Pie Slice',
        475,
        'Pie Crust, Creamy Custard made from Eggs, Sugar, Cream, Milk, and Vanilla',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'coconut-custard-pie-slice',
        'Coconut Custard Pie Slice',
        475,
        'Pie Crust, Creamy Custard made from Eggs, Sugar, Cream, Milk, Coconut Flakes, and Vanilla',
        { soldOut: true, tags: ['vegetarian'] }
      ),
      createItem(
        'pumpkin-pie-slice',
        'Pumpkin Pie Slice',
        475,
        'Pie Crust, Pumpkin Filling, Brown Sugar, White Sugar, Cinnamon, Nutmeg, Eggs',
        { tags: ['vegetarian', 'seasonal'] }
      ),
      createItem(
        'sweet-potato-pie-slice',
        'Sweet Potato Pie Slice',
        475,
        'Pie Crust, Sweet Potato Filling, Brown Sugar, White Sugar, Cinnamon, Nutmeg, Eggs',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'texas-pecan-pie-slice',
        'Texas Pecan Pie Slice',
        495,
        'Pie Crust, Filling of Syrup, Sugar, Eggs, and Vanilla, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'texas-pecan-fudge-pie-slice',
        'Texas Pecan Fudge Pie Slice',
        495,
        'Pie Crust, Chocolate and Cream Filling, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'key-lime-pie-slice',
        'Key Lime Pie Slice',
        495,
        'Graham Cracker Crust, Filling of Condensed Milk, Egg Yolks, and Lime Juice, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'lemon-icebox-pie-slice',
        'Lemon Icebox Pie Slice',
        495,
        'Graham Cracker Crust, Filling of Condensed Milk, Egg Yolks, and Lemon Juice, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'buttermilk-pie-slice',
        'Buttermilk Pie Slice',
        475,
        'Pie Crust, Filling of Eggs, Butter, Sugar, Flour, and Buttermilk',
        { tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory(
    'cakes-cheesecakes-slice',
    'Cakes & Cheesecakes by the Slice',
    'Layer cakes and New York style cheesecakes.',
    [
      createItem(
        'turtle-cheesecake-slice',
        'Turtle Cheesecake Slice',
        595,
        'Vanilla Cheesecake with Chocolate Shavings, Caramel, Pecan Pieces, Chocolate Drizzle',
        { imageId: 'cake-1', tags: ['vegetarian'] }
      ),
      createItem(
        'almond-cheesecake-slice',
        'Almond Cheesecake Slice',
        595,
        'Vanilla Cheesecake, Sweet Cream Cheese, Almond Slices, Whipped Cream, Cherry',
        { soldOut: true, tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-fudge-cheesecake-slice',
        'Chocolate Fudge Cheesecake Slice',
        595,
        'Chocolate Cheesecake, Sweet Cream Cheese, Melted Chocolate, Chocolate Shavings',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'plain-cheesecake-slice',
        'Plain Cheesecake Slice',
        595,
        'Traditional Vanilla Cheesecake',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'ny-strawberry-cheesecake-slice',
        'New York Strawberry Cheesecake Slice',
        595,
        'Vanilla Cheesecake, Graham Cracker Crumbs, Whole Strawberries, Strawberry Glaze, Whipped Cream',
        { popular: true, imageId: 'strawberry-cheesecake', tags: ['vegetarian'] }
      ),
      createItem(
        'cookies-n-cream-cheesecake-slice',
        'Cookies N Cream Cheesecake Slice',
        595,
        'Vanilla Cheesecake Infused with Cookie Pieces',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'key-lime-cheesecake-slice',
        'Key Lime Cheesecake Slice',
        595,
        'Rich Vanilla Cheesecake with Key Lime Juice, Graham Cracker Crust, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'carrot-pecan-cake-slice',
        'Carrot Pecan Cake Slice',
        550,
        'Carrot Bread with Raisin and Pecan, Cream Cheese Icing with Pineapple and Pecan Pieces, Pecan Halves',
        { imageId: 'cake-2', tags: ['vegetarian'] }
      ),
      createItem(
        'italian-dream-cake-slice',
        'Italian Dream Cake Slice',
        550,
        'Vanilla Cake Infused with Pecan Pieces, Cream Cheese Filling, Toasted Coconut Flakes, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'boston-cream-cake-slice',
        'Boston Cream Cake Slice',
        550,
        'Vanilla Cake, Vanilla Custard, Whipped Cream, Melted Chocolate, Chocolate Shavings, Cherries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'banana-pudding-cake-slice',
        'Banana Pudding Cake Slice',
        550,
        'Banana Cake Infused with Pecan Pieces, Vanilla Custard, Sliced Bananas, Sweet Cream Cheese, Whipped Cream, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-fudge-cake-slice',
        'Chocolate Fudge Cake Slice',
        550,
        'Chocolate Cake, Chocolate Fudge Filling, Whipped Chocolate Icing, Chocolate Flakes, Cherries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'german-chocolate-cake-slice',
        'German Chocolate Cake Slice',
        550,
        'Chocolate Cake, Chocolate Fudge Filling, Caramelized German Topping with Pecan Pieces and Coconut Flakes, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'tres-leches-cake-slice',
        'Tres Leches Cake Slice',
        550,
        'Vanilla Cake, Tres Leches Filling, Chocolate Shavings, Whipped Cream, Glazed Strawberries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'red-velvet-cake-slice',
        'Red Velvet Cake Slice',
        550,
        'Red Velvet Cake with Infused Chocolate Chunks, Sweet Cream Cheese, Red Velvet Crumbs',
        { tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory('whole-fruit-pies', 'Whole Fruit Pies', 'Nine inch fruit pies to take home.', [
    createItem(
      'apple-pie-whole',
      'Apple Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Apple Filling',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'dutch-apple-pie-whole',
      'Dutch Apple Pie Whole',
      1795,
      'Apple Pie Topped with Crunchy Butter Streusel Topping',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'blueberry-pie-whole',
      'Blueberry Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Blueberry Filling',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'cherry-pie-whole',
      'Cherry Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Cherry Filling',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'peach-pie-whole',
      'Peach Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Peach Filling',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'strawberry-rhubarb-pie-whole',
      'Strawberry Rhubarb Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Strawberry and Rhubarb Filling',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'sugar-free-apple-pie-whole',
      'Sugar Free Apple Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Apple Filling made with Sorbitol instead of sugar',
      { tags: ['vegetarian', 'sugar-free'] }
    ),
    createItem(
      'sugar-free-cherry-pie-whole',
      'Sugar Free Cherry Pie Whole',
      1795,
      'Traditional Double Crusted Pie with Cherry Filling made with Sorbitol instead of sugar',
      { tags: ['vegetarian', 'sugar-free'] }
    ),
  ]),
  createCategory('whole-cream-pies', 'Whole Cream Pies', 'Nine inch cream pies to take home.', [
    createItem(
      'bayou-goo-pie-whole',
      'Bayou Goo Pie Whole',
      1795,
      'Pie Crust, Sweet Cream Cheese, Pecan Pieces, Vanilla Custard Filling mixed with Chocolate, Whipped Cream, Chocolate Shavings, Powdered Sugar',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'banana-cream-pie-whole',
      'Banana Cream Pie Whole',
      1795,
      'Pie Crust, Whole Bananas, Vanilla Custard Filling, Whipped Cream, Pecan Pieces, Walnuts',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'bavarian-banana-pie-whole',
      'Bavarian Banana Pie Whole',
      1795,
      'Pie Crust, Whole Bananas, Chocolate Mousse Filling, Whipped Cream, Pecan Pieces, Walnuts',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'chocolate-cream-pie-whole',
      'Chocolate Cream Pie Whole',
      1795,
      'Pie Crust, Chocolate Custard Filling, Whipped Cream, Chocolate Sprinkles',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'coconut-cream-pie-whole',
      'Coconut Cream Pie Whole',
      1795,
      'Pie Crust, Vanilla Custard Filling Infused with Coconut Flakes, Whipped Cream, Toasted Coconut Flakes',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'german-chocolate-pie-whole',
      'German Chocolate Pie Whole',
      1795,
      'Pie Crust, Chocolate Custard Filling mixed with Pecan Pieces and Coconut Flakes, Whipped Cream, Walnuts',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'bavarian-chocolate-pie-whole',
      'Bavarian Chocolate Pie Whole',
      1795,
      'Pie Crust, Chocolate Mousse Filling, Whipped Cream, Chocolate Shavings',
      { soldOut: true, tags: ['vegetarian'] }
    ),
    createItem(
      'french-silk-pie-whole',
      'French Silk Pie Whole',
      1795,
      'Pie Crust, Chocolate Custard Filling and Chocolate Mousse Filling, Whipped Cream, Chocolate Shavings, Cherry',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'fresh-strawberry-pie-whole',
      'Fresh Strawberry Pie Whole',
      1795,
      'Pie Crust, Fresh Strawberries, Strawberry Glaze, Whipped Cream',
      { tags: ['vegetarian'] }
    ),
    createItem(
      'strawberry-cream-cheese-pie-whole',
      'Strawberry Cream Cheese Pie Whole',
      1795,
      'Graham Cracker Crust, Cream Cheese Filling, Whole Strawberries, Strawberry Glaze, Whipped Cream',
      { tags: ['vegetarian'] }
    ),
  ]),
  createCategory(
    'whole-meringue-specialty',
    'Whole Meringue & Specialty Pies',
    'Nine inch meringue, custard, and pecan pies to take home.',
    [
      createItem(
        'chocolate-meringue-pie-whole',
        'Chocolate Meringue Pie Whole',
        1695,
        'Pie Crust, Chocolate Custard Filling, Meringue Topping, Chocolate Sprinkles',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'coconut-meringue-pie-whole',
        'Coconut Meringue Pie Whole',
        1695,
        'Pie Crust, Vanilla Custard Filling Infused with Coconut Flakes, Meringue Topping, Toasted Coconut Flakes',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'lemon-meringue-pie-whole',
        'Lemon Meringue Pie Whole',
        1695,
        'Pie Crust, Tart Lemon Filling made from Egg Yolks, Lemon Juice, Sugar and Butter, Meringue Topping, Yellow Sprinkles',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'egg-cream-custard-pie-whole',
        'Egg Cream Custard Pie Whole',
        1695,
        'Pie Crust, Creamy Custard made from Eggs, Sugar, Cream, Milk, and Vanilla',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'coconut-custard-pie-whole',
        'Coconut Custard Pie Whole',
        1695,
        'Pie Crust, Creamy Custard made from Eggs, Sugar, Cream, Milk, Coconut Flakes, and Vanilla',
        { soldOut: true, tags: ['vegetarian'] }
      ),
      createItem(
        'pumpkin-pie-whole',
        'Pumpkin Pie Whole',
        1695,
        'Pie Crust, Pumpkin Filling, Brown Sugar, White Sugar, Cinnamon, Nutmeg, Eggs',
        { soldOut: true, tags: ['vegetarian', 'seasonal'] }
      ),
      createItem(
        'sweet-potato-pie-whole',
        'Sweet Potato Pie Whole',
        1695,
        'Pie Crust, Sweet Potato Filling, Brown Sugar, White Sugar, Cinnamon, Nutmeg, Eggs',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'texas-pecan-pie-whole',
        'Texas Pecan Pie Whole',
        1795,
        'Pie Crust, Filling of Syrup, Sugar, Eggs, and Vanilla, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'texas-pecan-fudge-pie-whole',
        'Texas Pecan Fudge Pie Whole',
        1795,
        'Pie Crust, Chocolate and Cream Filling, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'key-lime-pie-whole',
        'Key Lime Pie Whole',
        1795,
        'Graham Cracker Crust, Filling of Condensed Milk, Egg Yolks, and Lime Juice, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'lemon-icebox-pie-whole',
        'Lemon Icebox Pie Whole',
        1795,
        'Graham Cracker Crust, Filling of Condensed Milk, Egg Yolks, and Lemon Juice, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'buttermilk-pie-whole',
        'Buttermilk Pie Whole',
        1695,
        'Pie Crust, Filling of Eggs, Butter, Sugar, Flour, and Buttermilk',
        { tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory(
    'whole-cakes-cheesecakes',
    'Whole Cakes & Cheesecakes',
    'Full cakes and cheesecakes to take home.',
    [
      createItem(
        'turtle-cheesecake-whole',
        'Turtle Cheesecake Whole',
        2695,
        'Vanilla Cheesecake with Chocolate Shavings, Caramel, Pecan Pieces, Chocolate Drizzle',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'almond-cheesecake-whole',
        'Almond Cheesecake Whole',
        2695,
        'Vanilla Cheesecake, Sweet Cream Cheese, Almond Slices, Whipped Cream, Cherry',
        { soldOut: true, tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-fudge-cheesecake-whole',
        'Chocolate Fudge Cheesecake Whole',
        2695,
        'Chocolate Cheesecake, Sweet Cream Cheese, Melted Chocolate, Chocolate Shavings',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'plain-cheesecake-whole',
        'Plain Cheesecake Whole',
        2695,
        'Traditional Vanilla Cheesecake',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'ny-strawberry-cheesecake-whole',
        'New York Strawberry Cheesecake Whole',
        2695,
        'Vanilla Cheesecake, Graham Cracker Crumbs, Whole Strawberries, Strawberry Glaze, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'cookies-n-cream-cheesecake-whole',
        'Cookies N Cream Cheesecake Whole',
        2695,
        'Vanilla Cheesecake Infused with Cookie Pieces',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'key-lime-cheesecake-whole',
        'Key Lime Cheesecake Whole',
        2695,
        'Rich Vanilla Cheesecake with Key Lime Juice, Graham Cracker Crust, Whipped Cream',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'pumpkin-cheesecake-whole',
        'Pumpkin Cheesecake Whole',
        2695,
        'Pumpkin Cheesecake, Whipped Cream, Pecan Pieces',
        { soldOut: true, tags: ['vegetarian', 'seasonal'] }
      ),
      createItem(
        'carrot-pecan-cake-whole',
        'Carrot Pecan Cake Whole',
        2495,
        'Carrot Bread with Raisin and Pecan, Cream Cheese Icing with Pineapple and Pecan Pieces, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'italian-dream-cake-whole',
        'Italian Dream Cake Whole',
        2495,
        'Vanilla Cake Infused with Pecan Pieces, Cream Cheese Filling, Toasted Coconut Flakes, Pecan Halves',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'boston-cream-cake-whole',
        'Boston Cream Cake Whole',
        2495,
        'Vanilla Cake, Vanilla Custard, Whipped Cream, Melted Chocolate, Chocolate Shavings, Cherries',
        { soldOut: true, tags: ['vegetarian'] }
      ),
      createItem(
        'banana-pudding-cake-whole',
        'Banana Pudding Cake Whole',
        2495,
        'Banana Cake Infused with Pecan Pieces, Vanilla Custard, Sliced Bananas, Sweet Cream Cheese, Whipped Cream, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-fudge-cake-whole',
        'Chocolate Fudge Cake Whole',
        2495,
        'Chocolate Cake, Chocolate Fudge Filling, Whipped Chocolate Icing, Chocolate Flakes, Cherries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'german-chocolate-cake-whole',
        'German Chocolate Cake Whole',
        2495,
        'Chocolate Cake, Chocolate Fudge Filling, Caramelized German Topping with Pecan Pieces and Coconut Flakes, Walnuts',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'tres-leches-cake-whole',
        'Tres Leches Cake Whole',
        2495,
        'Vanilla Cake, Tres Leches Filling, Chocolate Shavings, Whipped Cream, Glazed Strawberries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'red-velvet-cake-whole',
        'Red Velvet Cake Whole',
        2495,
        'Red Velvet Cake with Infused Chocolate Chunks, Sweet Cream Cheese, Red Velvet Crumbs',
        { soldOut: true, tags: ['vegetarian'] }
      ),
    ]
  ),
  createCategory(
    'other-goodies',
    'Other Goodies',
    'Cookies, muffins, brownies, and mini pies, by the piece or the dozen.',
    [
      createItem(
        'blueberry-muffin',
        'Blueberry Muffin',
        195,
        'Fluffy Muffin with Infused Blueberries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'carrot-muffin',
        'Carrot Muffin',
        195,
        'Fluffy Muffin with Infused Carrot and Pecans',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'fudge-brownie',
        'Fudge Brownie',
        295,
        'Chocolate Brownie Infused with Pecan Pieces, Chocolate Fudge Icing',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-chip-cookie',
        'Chocolate Chip Cookie',
        150,
        'Traditional Cookie with Chocolate Chips',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'mexican-rock-cookie',
        'Mexican Rock Cookie',
        150,
        'Sugar Cookie with Pecan Pieces and Powdered Sugar',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'oatmeal-raisin-cookie',
        'Oatmeal Raisin Cookie',
        150,
        'Oatmeal Cookie Infused with Raisins',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'coconut-macaroon-cookie',
        'Coconut Macaroon Cookie',
        150,
        'Sweetened Egg Whites mixed with Coconut Flakes, Baked to Perfection',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'cream-puff',
        'Cream Puff',
        595,
        'Large Pastry Shell Filled with Vanilla Custard, Melted Chocolate Topping, Powdered Sugar',
        { tags: ['vegetarian'] }
      ),
      createItem('mini-pie', 'Mini Pie', 595, 'Five inch pie, choice of flavor', {
        imageId: 'mini-pies',
        tags: ['vegetarian'],
      }),
      createItem('mini-pies-3', 'Mini Pies, 3 Deal', 1595, 'Three five inch pies, mixed flavors', {
        tags: ['vegetarian'],
      }),
      createItem('mini-pies-6', 'Mini Pies, 6 Deal', 2995, 'Six five inch pies, mixed flavors', {
        tags: ['vegetarian'],
      }),
      createItem(
        'blueberry-muffin-dozen',
        'Blueberry Muffin Dozen',
        1950,
        'Twelve fluffy muffins with infused blueberries',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'carrot-muffin-dozen',
        'Carrot Muffin Dozen',
        1950,
        'Twelve fluffy muffins with infused carrot and pecans',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'fudge-brownie-dozen',
        'Fudge Brownie Dozen',
        2950,
        'Twelve chocolate brownies with pecan pieces and fudge icing',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'chocolate-chip-cookie-dozen',
        'Chocolate Chip Cookie Dozen',
        1500,
        'Twelve traditional cookies with chocolate chips',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'mexican-rock-cookie-dozen',
        'Mexican Rock Cookie Dozen',
        1500,
        'Twelve sugar cookies with pecan pieces and powdered sugar',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'oatmeal-raisin-cookie-dozen',
        'Oatmeal Raisin Cookie Dozen',
        1500,
        'Twelve oatmeal cookies infused with raisins',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'mixed-cookie-dozen',
        'Mixed Cookie Dozen',
        1500,
        'Twelve cookies, mixed flavors',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'cream-puff-dozen',
        'Cream Puff Dozen',
        5950,
        'Twelve pastry shells filled with vanilla custard, chocolate topping, powdered sugar',
        { tags: ['vegetarian'] }
      ),
      createItem(
        'dozen-dinner-rolls',
        'Dozen Dinner Rolls',
        1950,
        'Twelve oven baked dinner rolls, butter on the side',
        { tags: ['vegetarian'] }
      ),
    ]
  ),
];
