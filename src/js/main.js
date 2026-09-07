/**
 * Program entry point: registers the routes, wires the header, and draws whichever
 * screen the address bar is asking for.
 *
 * Every screen is a function that takes the main element and fills it. This module
 * is the only thing that knows the full list, which is what keeps the screens from
 * having to know about each other.
 */

import { addRoute, currentPath, navigate, start } from './app/router.js';
import { getState, subscribe } from './app/store.js';
import { isUsingTemporaryStorage } from './app/storage.js';
import { findLocation } from './data/locations.js';
import { el, render } from './ui/dom.js';
import { clearToasts } from './ui/components/toast.js';
import { openAssistant } from './ui/components/assistant.js';
import { maybeStartTour } from './ui/components/tour.js';
import { renderHome } from './ui/screens/home.js';
import { renderMenu } from './ui/screens/menu.js';
import { renderLocations } from './ui/screens/locations.js';
import { renderItem } from './ui/screens/item.js';
import { renderNotFound } from './ui/screens/notFound.js';
import { renderCart } from './ui/screens/cart.js';
import { renderCheckout } from './ui/screens/checkout.js';
import { renderOrderDetail } from './ui/screens/orderDetail.js';
import { renderMyOrders } from './ui/screens/myOrders.js';
import { renderSpending } from './ui/screens/spending.js';
import { renderHelp } from './ui/screens/help.js';
import {
  renderHelpAbout,
  renderHelpConcepts,
  renderHelpTopic,
  renderHelpValidation,
} from './ui/screens/helpPages.js';
import { renderManagerQueue } from './ui/screens/manager/queue.js';
import { renderManagerInventory } from './ui/screens/manager/inventory.js';
import { renderManagerReports } from './ui/screens/manager/reports.js';
import { countItems } from './domain/cart.js';

/** Screen name to the function that renders it. */
const SCREENS = {
  home: renderHome,
  menu: renderMenu,
  locations: renderLocations,
  'menu-category': renderMenu,
  item: renderItem,
  cart: renderCart,
  checkout: renderCheckout,
  'order-detail': renderOrderDetail,
  orders: renderMyOrders,
  spending: renderSpending,
  help: renderHelp,
  'help-topic': renderHelpTopic,
  'help-concepts': renderHelpConcepts,
  'help-validation': renderHelpValidation,
  'help-about': renderHelpAbout,
  'manager-queue': renderManagerQueue,
  'manager-inventory': renderManagerInventory,
  'manager-reports': renderManagerReports,
  'not-found': renderNotFound,
};

/** Links shown in the header, in order. */
const NAV_LINKS = [
  { path: '/home', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/locations', label: 'Locations' },
  { path: '/orders', label: 'Orders' },
  { path: '/manager', label: 'Staff' },
  { path: '/help', label: 'Help' },
];

addRoute('/home', 'home');
addRoute('/menu', 'menu');
addRoute('/locations', 'locations');
addRoute('/menu/:categoryId', 'menu-category');
addRoute('/item/:itemId', 'item');
addRoute('/cart', 'cart');
addRoute('/checkout', 'checkout');
addRoute('/orders', 'orders');
addRoute('/spending', 'spending');
addRoute('/help', 'help');
addRoute('/help/topic', 'help-topic');
addRoute('/help/concepts', 'help-concepts');
addRoute('/help/validation', 'help-validation');
addRoute('/help/about', 'help-about');
addRoute('/order/:orderNumber', 'order-detail');
addRoute('/manager', 'manager-queue');
addRoute('/manager/queue', 'manager-queue');
addRoute('/manager/inventory', 'manager-inventory');
addRoute('/manager/reports', 'manager-reports');

const main = document.querySelector('#main');
const nav = document.querySelector('#app-nav');

/**
 * Redraws the header navigation, marking the current screen.
 *
 * @returns {void}
 */
function renderNav() {
  const path = currentPath();
  const location = findLocation(getState().locationId);
  const cartCount = countItems(getState().cart);
  render(nav, [
    ...NAV_LINKS.map((link) =>
      el('a', {
        class: 'app-nav__link',
        href: `#${link.path}`,
        text: link.label,
        'aria-current': path.startsWith(link.path) ? 'page' : null,
      })
    ),
    el(
      'button',
      {
        class: 'app-nav__link app-nav__assistant',
        id: 'assistant-toggle',
        type: 'button',
        onClick: openAssistant,
      },
      'Ask'
    ),
    el(
      'a',
      {
        class: 'app-nav__link app-nav__cart',
        href: '#/cart',
        'aria-current': path.startsWith('/cart') ? 'page' : null,
      },
      [
        'Order',
        cartCount > 0 ? el('span', { class: 'app-nav__badge', text: String(cartCount) }) : null,
      ]
    ),
    location
      ? el('span', { class: 'app-nav__location', text: `Ordering from ${location.name}` })
      : null,
  ]);
}

/** The screen currently on display, so a state change can redraw it in place. */
let activeScreen = { name: 'home', params: {} };

/**
 * Draws one screen into the main element and moves focus to it.
 *
 * Moving focus is what makes this usable from a keyboard: without it, activating a
 * link would leave the caret back in the header and force a customer to tab through
 * the whole navigation again to reach the content that just appeared.
 *
 * @param {string} name Screen name from the route table.
 * @param {object} params Route parameters.
 * @returns {void}
 */
function showScreen(name, params) {
  activeScreen = { name, params };
  clearToasts();
  const renderScreen = SCREENS[name] ?? renderNotFound;
  renderScreen(main, params);
  renderNav();
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/**
 * Warns once, in the page, when the browser refused to save anything.
 *
 * Opening the offline build straight off the disk is exactly when this happens, so
 * the customer is told their order history will not survive closing the tab rather
 * than finding out afterwards.
 *
 * @returns {void}
 */
function warnAboutTemporaryStorage() {
  if (!isUsingTemporaryStorage()) {
    return;
  }
  document
    .querySelector('.app-header')
    .after(
      el('div', { class: 'app-notice', role: 'status' }, [
        el('div', { class: 'app-notice__inner' }, [
          'This browser will not let the page save data, so your order history will be ',
          'cleared when you close the tab. Everything else works normally.',
        ]),
      ])
    );
}

subscribe(() => {
  showScreen(activeScreen.name, activeScreen.params);
});

start((name, params, path) => {
  showScreen(name, name === 'not-found' ? { ...params, path } : params);
});

warnAboutTemporaryStorage();

// Offered once, after the first screen is drawn so the header exists to point at.
maybeStartTour();

// A bare address should land somewhere real rather than an empty screen.
if (window.location.hash === '') {
  navigate('/home');
}
