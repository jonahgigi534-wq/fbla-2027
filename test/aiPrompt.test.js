/**
 * Tests for what the AI model is told.
 *
 * The model's answers cannot be tested here, because they come from someone else's
 * server and differ every time. What can be tested, and what decides whether those
 * answers are any good, is what the model is told before it answers: that every item
 * is there with its real price, that sold out means sold out, that the gluten rule is
 * always present, and that nothing personal about the customer is ever included.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_HISTORY_TURNS,
  buildMessages,
  buildSystemPrompt,
  cleanAnswer,
  describeMenu,
} from '../src/js/domain/aiPrompt.js';
import { ALL_ITEMS, SECTIONS, findItem } from '../src/js/data/menu.js';
import { DAY_NAMES, LOCATIONS } from '../src/js/data/locations.js';
import { PROMOS } from '../src/js/data/promos.js';
import { formatUSD } from '../src/js/domain/money.js';

/**
 * Builds the facts a prompt is made from, with anything overridden.
 *
 * @param {object} [overrides] Fields to replace.
 * @returns {object} What buildSystemPrompt takes.
 */
function facts(overrides = {}) {
  return {
    sections: SECTIONS,
    stockOf: (item) => item.stock,
    locations: LOCATIONS,
    selectedLocationId: 'kirby',
    now: new Date(2026, 9, 3, 14, 30),
    dayNames: DAY_NAMES,
    cart: {
      lines: [],
      totalCents: 0,
      orderTypeId: 'pickup',
      budgetCapCents: null,
      promoCode: null,
    },
    orders: [],
    policies: {
      deliveryFeeCents: 499,
      freeDeliveryCents: 3500,
      deliveryMinimumCents: 1500,
      promos: PROMOS,
    },
    ...overrides,
  };
}

test('every menu item is described, each with its real price', () => {
  const menu = describeMenu(SECTIONS, (item) => item.stock);
  const itemLines = menu.split('\n').filter((line) => line.startsWith('- '));
  assert.equal(itemLines.length, ALL_ITEMS.length);

  for (const id of ['banana-pecan-pancakes', 'chocolate-chip-cookie', 'tray-chicken-wings-large']) {
    const item = findItem(id);
    assert.ok(
      menu.includes(`- ${item.name} | ${formatUSD(item.priceCents)}`),
      `${item.name} is missing or has the wrong price`
    );
  }
});

test('a sold out item is marked, so the model cannot offer it', () => {
  const menu = describeMenu(SECTIONS, (item) => item.stock);
  const line = menu.split('\n').find((entry) => entry.startsWith('- Almond Cheesecake Slice |'));
  assert.match(line, /SOLD OUT/);
});

test('low stock is mentioned, and plentiful stock is not', () => {
  const menu = describeMenu(SECTIONS, (item) => (item.id === 'chocolate-chip-cookie' ? 2 : 40));
  const cookie = menu.split('\n').find((entry) => entry.startsWith('- Chocolate Chip Cookie |'));
  assert.match(cookie, /only 2 left/);
  assert.ok(!menu.includes('40 left'), 'ordinary stock levels should not pad every line');
});

test('the rules come first, and the gluten rule is always among them', () => {
  const prompt = buildSystemPrompt(facts());
  assert.match(prompt, /^You are the Pie Assistant/);
  assert.match(prompt, /Never call anything gluten free/);
  assert.match(prompt, /Answer only from the facts below/);
});

test('the restaurant the customer picked is marked as theirs', () => {
  assert.match(buildSystemPrompt(facts()), /Kirby \(the one the customer has picked\)/);
});

test('the cart, its total, and the spending limit are described', () => {
  const cookie = findItem('chocolate-chip-cookie');
  const prompt = buildSystemPrompt(
    facts({
      cart: {
        lines: [
          { itemId: cookie.id, name: cookie.name, priceCents: cookie.priceCents, quantity: 3 },
        ],
        totalCents: 487,
        orderTypeId: 'delivery',
        budgetCapCents: 2000,
        promoCode: 'PIE10',
      },
    })
  );
  assert.match(prompt, /3 x Chocolate Chip Cookie at \$1\.50 each/);
  assert.match(prompt, /The total, with tax, is \$4\.87/);
  assert.match(prompt, /spending limit of \$20\.00/);
  assert.match(prompt, /Promo code PIE10 is applied/);
});

test('nothing personal about the customer reaches the model', () => {
  const order = {
    orderNumber: 2301,
    placedAt: '2026-10-02T15:00:00.000Z',
    locationId: 'kirby',
    status: 'Baking',
    totals: { total: 1234 },
    customer: {
      name: 'Jordan Example',
      phone: '(713) 555-0100',
      email: 'jordan@example.com',
      street: '12 Example Lane',
      zip: '77005',
    },
    cardLastFour: '4242',
  };
  const prompt = buildSystemPrompt(facts({ orders: [order] }));

  assert.match(prompt, /Order 2301 at Kirby/, 'the order itself should be described');
  for (const secret of ['Jordan', '555-0100', 'jordan@example.com', 'Example Lane', '4242']) {
    assert.ok(!prompt.includes(secret), `"${secret}" should never be sent`);
  }
});

test('only recent history travels with a question, and the question comes last', () => {
  const history = Array.from({ length: 20 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: `turn ${index}`,
  }));
  const messages = buildMessages({ systemPrompt: 'rules', history, question: 'what is open?' });

  assert.equal(messages.length, 1 + MAX_HISTORY_TURNS * 2 + 1);
  assert.deepEqual(messages[0], { role: 'system', content: 'rules' });
  assert.deepEqual(messages.at(-1), { role: 'user', content: 'what is open?' });
  assert.equal(messages[1].content, `turn ${20 - MAX_HISTORY_TURNS * 2}`);
});

test('markdown the model adds anyway is stripped before it is shown', () => {
  const raw = '## Pies\n\n- **Pecan Pie Slice** is $5.50\n* __Key Lime__ too\n\n\n\nEnjoy.';
  assert.equal(cleanAnswer(raw), 'Pies\n\nPecan Pie Slice is $5.50\nKey Lime too\n\nEnjoy.');
});
