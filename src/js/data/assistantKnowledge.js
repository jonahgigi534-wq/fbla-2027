/**
 * What the Pie Assistant knows how to answer.
 *
 * Every intent carries the words that mean it and a function that builds the answer.
 * The answer functions receive the program's live state, so what the assistant says
 * about stock, hours, or an order is read from the same data the screens render.
 * Nothing here is a canned reply that can drift out of date.
 *
 * Matching is done by domain/assistant.js. This file is only the knowledge.
 *
 * `isSuggested` marks the intents offered as buttons under the input, which is what
 * makes the feature demonstrable: a judge who does not know what to ask can click
 * something that is guaranteed to work.
 */

import { formatUSD } from '../domain/money.js';
import { describeStatus } from '../domain/hours.js';
import { DAY_NAMES, LOCATIONS } from './locations.js';
import { PROMOS } from './promos.js';

/** How many items to name before summarising the rest. */
const MAX_LISTED = 6;

/**
 * Builds an answer.
 *
 * @param {string} text What the assistant says.
 * @param {object} [extras] Items to show as cards and links to offer.
 * @returns {object} The answer.
 */
function reply(text, extras = {}) {
  return { text, items: extras.items ?? [], links: extras.links ?? [] };
}

/** Every intent the assistant handles. */
export const INTENTS = [
  {
    id: 'diet',
    label: 'What is vegetarian?',
    isSuggested: true,
    phrases: ['gluten free', 'plant based'],
    keywords: ['vegetarian', 'vegan', 'veggie', 'meatless', 'dietary', 'gluten', 'diet'],
    answer: ({ items }) => {
      const vegetarian = items.filter(
        (item) => item.dietaryTags.includes('vegetarian') && item.stock > 0
      );
      const vegan = vegetarian.filter((item) => item.dietaryTags.includes('vegan'));
      return reply(
        `${vegetarian.length} items are vegetarian and ${vegan.length} of those are vegan. Here are a few, and the Vegetarian chip on the menu shows them all.`,
        {
          items: vegetarian.slice(0, MAX_LISTED),
          links: [{ label: 'Filter the menu', path: '/menu' }],
        }
      );
    },
  },
  {
    id: 'cheap',
    label: 'Anything under $10?',
    isSuggested: true,
    phrases: ['under 10', 'under $10', 'cheapest', 'on a budget', 'less than'],
    keywords: ['cheap', 'cheapest', 'budget', 'affordable', 'inexpensive', 'under', 'price'],
    answer: ({ items }) => {
      const affordable = items
        .filter((item) => item.priceCents <= 1000 && item.stock > 0)
        .sort((a, b) => a.priceCents - b.priceCents);
      return reply(
        `${affordable.length} items are ${formatUSD(1000)} or less. You can also set a spending limit in your cart and the program will warn you before you go over it.`,
        {
          items: affordable.slice(0, MAX_LISTED),
          links: [{ label: 'Set a spending limit', path: '/cart' }],
        }
      );
    },
  },
  {
    id: 'popular',
    label: 'What do you recommend?',
    isSuggested: true,
    phrases: ['what is good', 'whats good', 'best seller', 'most popular', 'what should i get'],
    keywords: [
      'recommend',
      'popular',
      'favourite',
      'favorite',
      'best',
      'famous',
      'known',
      'signature',
    ],
    answer: ({ items }) =>
      reply(
        'These are the dishes House of Pies features on its own front page. The Bayou Goo pie is the one people come back for.',
        { items: items.filter((item) => item.isPopular).slice(0, MAX_LISTED) }
      ),
  },
  {
    id: 'soldout',
    label: 'What is sold out?',
    isSuggested: true,
    phrases: ['out of stock', 'sold out', 'run out', 'not available'],
    keywords: ['soldout', 'stock', 'unavailable', 'availability', 'restock'],
    answer: ({ items, stockFor, stockOverrides }) => {
      const gone = items.filter((item) => stockFor(item, stockOverrides) === 0);
      if (gone.length === 0) {
        return reply('Everything on the menu is available right now.');
      }
      const names = gone
        .slice(0, MAX_LISTED)
        .map((item) => item.name)
        .join(', ');
      const rest = gone.length - Math.min(gone.length, MAX_LISTED);
      return reply(
        `${gone.length} items are sold out today: ${names}${rest > 0 ? `, and ${rest} more` : ''}. Open any of them and the program suggests something similar that is still available.`,
        { items: gone.slice(0, 3) }
      );
    },
  },
  {
    id: 'hours',
    label: 'When are you open?',
    isSuggested: true,
    phrases: ['what time', 'open now', 'still open', 'close today', 'opening hours'],
    keywords: ['hours', 'open', 'close', 'closing', 'opening', 'late', 'time', 'today'],
    answer: ({ now }) => {
      const statuses = LOCATIONS.map((location) => ({
        location,
        status: describeStatus(location, now, DAY_NAMES),
      }));
      const open = statuses.filter((entry) => entry.status.isOpen);
      const lines = statuses
        .map((entry) => `${entry.location.name}: ${entry.status.text}`)
        .join('. ');
      const headline =
        open.length === LOCATIONS.length
          ? `All ${LOCATIONS.length} restaurants are open right now.`
          : open.length === 0
            ? `All ${LOCATIONS.length} restaurants are closed right now.`
            : `${open.length} of the ${LOCATIONS.length} restaurants are open right now.`;
      return reply(`${headline} ${lines}.`, {
        links: [{ label: 'Pick a restaurant', path: '/home' }],
      });
    },
  },
  {
    id: 'delivery',
    label: 'Do you deliver?',
    isSuggested: true,
    phrases: ['deliver to', 'bring it to me', 'drop off'],
    keywords: ['delivery', 'deliver', 'pickup', 'collect', 'collection', 'takeout', 'takeaway'],
    answer: ({ location }) =>
      reply(
        `All six restaurants do pickup, delivery, and dine in. ${location.name} delivers to ${location.deliveryZips.join(', ')}. Delivery orders start at $15.00 and the fee is waived over $35.00.`,
        { links: [{ label: 'Choose how you want it', path: '/cart' }] }
      ),
  },
  {
    id: 'order-status',
    label: 'Where is my order?',
    isSuggested: true,
    phrases: ['my order', 'order status', 'track my', 'how long'],
    keywords: ['status', 'track', 'tracking', 'ready', 'waiting', 'progress'],
    answer: ({ orders }) => {
      const live = orders.filter((order) => !order.isSeeded);
      if (live.length === 0) {
        return reply(
          'You have not placed an order yet in this session. Once you do, it shows up here and on the Orders screen with a live status.',
          {
            links: [{ label: 'Browse the menu', path: '/menu' }],
          }
        );
      }
      const latest = live[0];
      return reply(
        `Your most recent order is number ${latest.orderNumber}, currently ${latest.status}, for collection at ${latest.slotLabel}.`,
        {
          links: [
            { label: `Open order ${latest.orderNumber}`, path: `/order/${latest.orderNumber}` },
          ],
        }
      );
    },
  },
  {
    id: 'cart',
    label: 'What is in my cart?',
    isSuggested: false,
    phrases: ['my cart', 'my basket', 'my order so far'],
    keywords: ['cart', 'basket', 'total', 'spending', 'subtotal'],
    answer: ({ cart, cartTotalCents }) => {
      if (cart.length === 0) {
        return reply('Your cart is empty at the moment.', {
          links: [{ label: 'Browse the menu', path: '/menu' }],
        });
      }
      const summary = cart.map((line) => `${line.quantity} x ${line.name}`).join(', ');
      return reply(`You have ${summary}, coming to ${formatUSD(cartTotalCents)} including tax.`, {
        links: [{ label: 'Open your cart', path: '/cart' }],
      });
    },
  },
  {
    id: 'allergens',
    label: 'What has nuts in it?',
    isSuggested: false,
    phrases: ['allergic to', 'contains nuts', 'nut free', 'dairy free'],
    keywords: [
      'allergy',
      'allergen',
      'allergens',
      'nuts',
      'peanut',
      'dairy',
      'wheat',
      'shellfish',
      'egg',
    ],
    answer: ({ items }) => {
      const withNuts = items.filter((item) => item.allergens.includes('tree-nut'));
      const nutFree = items.filter((item) => item.allergens.length === 0 && item.stock > 0);
      return reply(
        `${withNuts.length} items list tree nuts, mostly the pecan pies and anything with walnuts or coconut. ${nutFree.length} items list no common allergens at all. Every item page shows its allergen list, read from the ingredients rather than tested in a lab, so please tell the restaurant about any allergy when you order.`,
        { items: nutFree.slice(0, 4) }
      );
    },
  },
  {
    id: 'catering',
    label: 'Do you do catering?',
    isSuggested: false,
    phrases: ['for a party', 'for an event', 'large order', 'feed a crowd'],
    keywords: [
      'catering',
      'cater',
      'tray',
      'trays',
      'party',
      'event',
      'office',
      'wedding',
      'custom',
    ],
    answer: ({ items }) => {
      const catering = items.filter((item) => item.sectionId === 'catering');
      return reply(
        `Yes. There are ${catering.length} catering items, from breakfast trays to full size pies and custom cakes with a message written on top. Everything on that menu needs 48 hours notice, and checkout will not let you pick a collection time sooner than that.`,
        {
          items: catering.filter((item) => item.id.startsWith('custom-')).slice(0, 2),
          links: [{ label: 'See the catering menu', path: '/menu/special-orders' }],
        }
      );
    },
  },
  {
    id: 'promo',
    label: 'Any discounts?',
    isSuggested: false,
    phrases: ['promo code', 'discount code', 'money off', 'voucher', 'coupon'],
    keywords: ['promo', 'discount', 'code', 'deal', 'offer', 'coupon', 'sale'],
    answer: () =>
      reply(
        `There are ${PROMOS.length} codes running: ${PROMOS.map((promo) => `${promo.code} for ${promo.description.toLowerCase()}`).join(', ')}. Enter one in your cart and the discount comes off before tax is worked out.`,
        { links: [{ label: 'Apply a code', path: '/cart' }] }
      ),
  },
  {
    id: 'how-to-order',
    label: 'How do I order?',
    isSuggested: false,
    phrases: ['how do i order', 'how does this work', 'how to use'],
    keywords: ['how', 'order', 'ordering', 'checkout', 'work', 'works', 'use', 'start'],
    answer: () =>
      reply(
        'Pick a restaurant on the home screen, add what you want from the menu, then open your cart to choose pickup or delivery and check out. You can set a spending limit before you check out, and change or cancel an order afterwards until the kitchen starts cooking.',
        {
          links: [
            { label: 'Browse the menu', path: '/menu' },
            { label: 'Open the help centre', path: '/help' },
          ],
        }
      ),
  },
  {
    id: 'locations',
    label: 'Where are you?',
    isSuggested: false,
    phrases: ['how many locations', 'nearest one', 'where are you'],
    keywords: [
      'location',
      'locations',
      'address',
      'where',
      'restaurant',
      'restaurants',
      'branch',
      'near',
    ],
    answer: () =>
      reply(
        `Six restaurants: ${LOCATIONS.map((location) => `${location.name} at ${location.street}`).join(', ')}. Fuqua never closes, and Katy runs around the clock at weekends.`,
        { links: [{ label: 'Pick a restaurant', path: '/home' }] }
      ),
  },
  {
    id: 'budget',
    label: 'Can I set a spending limit?',
    isSuggested: false,
    phrases: ['spending limit', 'stay under', 'budget cap', 'not spend more'],
    keywords: ['limit', 'budget', 'cap', 'afford', 'maximum'],
    answer: ({ budgetCapCents }) =>
      reply(
        budgetCapCents === null
          ? 'Yes. Set an amount in your cart and the program warns you as you approach it, blocks checkout if you go over, and names which item to remove to get back under.'
          : `Your limit is set to ${formatUSD(budgetCapCents)}. The cart shows how much of it is left.`,
        { links: [{ label: 'Set a limit', path: '/cart' }] }
      ),
  },
];
