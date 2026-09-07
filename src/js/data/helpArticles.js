/**
 * The how-to articles in the help center.
 *
 * The rating sheet asks for an interactive help menu, and interactive means
 * searchable and navigable rather than a wall of text. Each article is short enough
 * to read standing up, and the search box in the help center matches on title, body,
 * and keywords so a customer can find one without knowing what it is called.
 */

/** Every article, grouped by the part of the program it covers. */
export const HELP_ARTICLES = [
  {
    id: 'place-an-order',
    group: 'Ordering',
    title: 'How to place an order',
    keywords: ['order', 'start', 'buy', 'checkout', 'begin'],
    body: 'Pick a restaurant on the home screen, since hours and delivery areas differ between the six. Open the menu, tap an item, choose a quantity, and add it. When you are ready, open your order from the header, choose pickup, delivery, or dine in, then go to checkout. You will be asked for a name, a phone number, an email for the receipt, and a collection time.',
  },
  {
    id: 'find-something',
    group: 'Ordering',
    title: 'Finding something on a menu of 426 items',
    keywords: ['search', 'filter', 'find', 'vegetarian', 'vegan', 'sort', 'browse'],
    body: 'The search box matches item names first and ingredients second, so searching pecan puts the pecan pies above a burger that happens to mention pecans. The section tabs narrow to Food, Bakery, Drinks, A la Carte, or Catering, and the chips below filter to vegetarian, vegan, sugar free, seasonal, or only what is available today. Sort by best match, price, or name.',
  },
  {
    id: 'spending-limit',
    group: 'Ordering',
    title: 'Setting a spending limit',
    keywords: ['budget', 'limit', 'cap', 'spend', 'afford', 'money'],
    body: 'In your order, enter the amount you want to stay under and press Set limit. The limit is checked against the full total including tax, not the subtotal, because that is the figure that leaves your account. As you approach it you get a warning, and if you go over, checkout is blocked and the program names the cheapest item to remove that would bring you back under.',
  },
  {
    id: 'sold-out',
    group: 'Ordering',
    title: 'When something is sold out',
    keywords: ['sold out', 'unavailable', 'stock', 'substitute', 'alternative'],
    body: 'Sold out items stay on the menu, grayed out and labelled, rather than disappearing. Hiding them would leave you hunting for something you were told the restaurant sells. Open one and the program offers three alternatives from the same part of the menu, closest in price first.',
  },
  {
    id: 'catering-notice',
    group: 'Ordering',
    title: 'Catering and custom orders',
    keywords: ['catering', 'tray', 'party', 'custom', 'cake', 'notice', 'event'],
    body: 'Catering trays and custom cakes need 48 hours notice, which is the restaurant own rule. If one is in your order, the collection times offered at checkout start two days out and nothing sooner can be chosen. You can write a message to go on top of a custom cake or pie in the special instructions.',
  },
  {
    id: 'change-order',
    group: 'After ordering',
    title: 'Changing or cancelling an order',
    keywords: ['cancel', 'change', 'edit', 'modify', 'refund', 'mistake'],
    body: 'While an order is still Received you can change the quantity of any item on it or cancel it outright, both from the order screen. Once it moves to Baking the kitchen has started and the ingredients are committed, so neither is offered any more. Cancelling puts the stock back on the shelf.',
  },
  {
    id: 'track-order',
    group: 'After ordering',
    title: 'Following an order',
    keywords: ['track', 'status', 'ready', 'progress', 'where'],
    body: 'Every order moves through Received, Baking, Ready, and Complete. The order screen shows where yours has got to, and the Orders screen lists everything placed on this device. You can reorder anything from there in one tap.',
  },
  {
    id: 'receipt',
    group: 'After ordering',
    title: 'Getting a receipt',
    keywords: ['receipt', 'print', 'invoice', 'proof', 'itemised'],
    body: 'Every order has an itemised receipt showing the restaurant, the collection time, every line, and the full breakdown of subtotal, discount, delivery, and tax. Press Print receipt and the navigation and buttons are stripped out, leaving the document on its own.',
  },
  {
    id: 'assistant',
    group: 'Using this program',
    title: 'Asking the Pie Assistant',
    keywords: ['assistant', 'ask', 'question', 'help', 'chat'],
    body: 'Press Ask in the header to open the assistant. It answers from this device with no internet, reading the live menu, stock, cart, and orders, so what it tells you matches what the screens show. It copes with typos, and if it does not understand a question it offers the nearest things it can help with rather than giving up. The buttons under the box are questions that are guaranteed to work.',
  },
  {
    id: 'allergens',
    group: 'Using this program',
    title: 'How allergen information works',
    keywords: ['allergy', 'allergen', 'nuts', 'dairy', 'safe', 'ingredients'],
    body: 'Allergens are read from each item ingredient list by matching words, so they stay correct when a description changes. That is useful but it is not a lab test and it is not a promise. Tell the restaurant about any allergy when you order.',
  },
  {
    id: 'privacy',
    group: 'Using this program',
    title: 'What this program stores',
    keywords: ['privacy', 'data', 'card', 'payment', 'saved', 'security'],
    body: 'Everything stays on this device in your browser. Nothing is sent anywhere, because there is no server to send it to. No payment is processed and no card number is kept: only the last four digits reach the saved order, so a receipt can identify which card was used. Some browsers block saving on a page opened directly from a file, and the program says so at the top if that happens.',
  },
  {
    id: 'staff',
    group: 'Using this program',
    title: 'The staff area',
    keywords: ['staff', 'manager', 'pin', 'admin', 'reports', 'inventory'],
    body: 'Staff opens the order queue, the stock screen, and the sales reports. The PIN is printed on the screen that asks for it, because this is a demonstration and a hidden PIN would lock you out of half the program. It is not security and does not pretend to be. Real access control needs a server, which a program with no server does not have.',
  },
];
