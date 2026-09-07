/**
 * How this program answers the assigned topic, clause by clause.
 *
 * The FBLA rating sheet gives full marks for Functionality when the program fully
 * addresses the topic AND the correlation is explained in the instructions. The
 * instructions a judge reads are the ones inside the program, not a README on a
 * laptop, so the explanation lives here and is rendered in the help center with a
 * link that jumps straight to each feature.
 *
 * Each entry quotes the assigned topic exactly as written, names what answers it,
 * and points at the screen where it can be seen working.
 */

/** The assigned topic, quoted in full so the mapping can be checked against it. */
export const TOPIC_TITLE = 'Local Business Digital Ordering System';

/** Every clause of the topic, and what answers it. */
export const TOPIC_COVERAGE = [
  {
    clause: 'Develop a digital ordering system for a local business of your choice',
    answer:
      'House of Pies, a family owned Houston restaurant and bakery trading since 1967 across six locations. The menu, prices, addresses, phone numbers, opening hours, and the items currently sold out are taken from the restaurant\u2019s own ordering system rather than invented.',
    path: '/home',
    linkLabel: 'See the six restaurants',
  },
  {
    clause: 'provides customers with a convenient and user-friendly ordering experience',
    answer:
      'Browse or search 426 items, filter by section, category, or dietary need, and sort four ways. Every screen has an empty state that says what happened and what to do next, and the assistant answers questions in plain English.',
    path: '/menu',
    linkLabel: 'Open the menu',
  },
  {
    clause: 'allow customers to browse products or services',
    answer:
      'Products are the everyday menu. Services are the 71 catering items, including custom cakes and pies with a message written on top, each carrying the restaurant\u2019s real 48 hour notice which checkout enforces.',
    path: '/menu/special-orders',
    linkLabel: 'See the special orders',
  },
  {
    clause: 'place and manage orders',
    answer:
      'Orders can be placed, tracked through four stages, edited item by item while the kitchen has not started, cancelled in that same window, reordered later, and printed as a receipt. Cancelling returns the stock to the shelf.',
    path: '/orders',
    linkLabel: 'Open your orders',
  },
  {
    clause: 'calculate purchase totals',
    answer:
      'Subtotal, promo discount, delivery fee, 8.25 percent Houston sales tax, and tip, every figure in whole cents. The discount comes off before tax is worked out, because taxing the full price and discounting afterwards overcharges the customer.',
    path: '/cart',
    linkLabel: 'See a breakdown',
  },
  {
    clause: 'review order information',
    answer:
      'Every order keeps an itemised receipt that prints. A separate spending screen sums what has been spent over 30, 90, or 365 days and names what gets ordered most.',
    path: '/spending',
    linkLabel: 'Review your spending',
  },
  {
    clause: 'account for real-world situations, such as unavailable items',
    answer:
      'Eleven items are sold out, copied from what the restaurant actually had out of stock. A sold out item stays on the menu grayed out rather than disappearing, and its page offers three in stock alternatives from the same category at a similar price.',
    path: '/item/almond-cheesecake-slice',
    linkLabel: 'See a sold out item',
  },
  {
    clause: 'inventory limits',
    answer:
      'Stock is checked against what is already in the cart, so a customer holding the last four slices cannot add a fifth. The quantity stepper stops at what is left and says how many that is. Placing an order takes stock off the shelf; cancelling puts it back.',
    path: '/manager/inventory',
    linkLabel: 'Open the stock screen',
  },
  {
    clause: 'invalid entries',
    answer:
      'Every field is checked twice: once for shape, once for whether it makes sense for this order. A ZIP code can be a real ZIP and still not be one this restaurant delivers to, and the two get different messages.',
    path: '/help/validation',
    linkLabel: 'See every rule',
  },
  {
    clause: 'customer budget constraints',
    answer:
      'Set a spending limit and the cart warns as you approach it, blocks checkout if the order goes over, and names the cheapest item to remove that would bring it back under.',
    path: '/cart',
    linkLabel: 'Set a limit',
  },
  {
    clause:
      'demonstrates your understanding of variables, conditionals, loops, functions, lists or arrays, user input, and basic program organization',
    answer:
      'Each of those is mapped to a named file and function on the Programming Concepts page, so none of it has to be taken on trust.',
    path: '/help/concepts',
    linkLabel: 'See the mapping',
  },
  {
    clause:
      'How can your system improve the customer experience while helping a local business operate more efficiently?',
    answer:
      'For the customer: no queue, no phone call, allergens on every item, and a spending limit that holds. For the restaurant: collection slots are capped at four orders per fifteen minutes so the counter does not back up, stock stays accurate without anyone updating a board, and ninety days of sales can be grouped seven ways with the previous period alongside it.',
    path: '/manager/reports',
    linkLabel: 'Open the reports',
  },
];
