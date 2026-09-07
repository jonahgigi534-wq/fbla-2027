/**
 * The Pie Assistant panel.
 *
 * A slide over that any screen can open. It holds the conversation, the input, and a
 * row of suggested questions.
 *
 * The suggested questions are not decoration. They are what makes the feature
 * demonstrable: someone meeting the program for the first time has no idea what it
 * can be asked, and a blank box invites a question it cannot answer. One tap on a
 * chip produces a real answer built from real data.
 *
 * Matching lives in domain/assistant.js and the knowledge in
 * data/assistantKnowledge.js. This file is only the conversation on screen.
 */

import { el, render } from '../dom.js';
import { itemCard } from './itemCard.js';
import { findAnswer } from '../../domain/assistant.js';
import { INTENTS } from '../../data/assistantKnowledge.js';
import { getState } from '../../app/store.js';
import { navigate } from '../../app/router.js';
import { ALL_ITEMS } from '../../data/menu.js';
import { findLocation } from '../../data/locations.js';
import { stockFor } from '../../domain/inventory.js';
import { calculateOrderTotals } from '../../domain/pricing.js';
import { findPromo } from '../../data/promos.js';

/** The panel element, built once and reused. */
let panel = null;

/** Where the conversation is appended. */
let transcript = null;

/** Whether the panel is currently on screen. */
let isOpen = false;

/**
 * Assembles everything the answer functions read.
 *
 * Built fresh on every question so an answer about stock or a cart total is never
 * one the customer already changed.
 *
 * @returns {object} The live context.
 */
function buildContext() {
  const state = getState();
  const promo = state.promoCode ? findPromo(state.promoCode) : null;
  const totals = calculateOrderTotals(state.cart, { orderTypeId: state.orderTypeId, promo });

  return {
    items: ALL_ITEMS,
    state,
    cart: state.cart,
    cartTotalCents: totals.total,
    orders: state.orders,
    stockOverrides: state.stockOverrides,
    stockFor,
    budgetCapCents: state.budgetCapCents,
    location: findLocation(state.locationId),
    now: new Date(),
  };
}

/**
 * Adds one message to the conversation.
 *
 * @param {string} role 'you' or 'assistant'.
 * @param {Array<Node|string>} content What the message contains.
 * @returns {void}
 */
function addMessage(role, content) {
  transcript.append(
    el('div', { class: `chat chat--${role}` }, [
      el('p', { class: 'chat__who', text: role === 'you' ? 'You' : 'Pie Assistant' }),
      el('div', { class: 'chat__body' }, content),
    ])
  );
  transcript.scrollTop = transcript.scrollHeight;
}

/**
 * Answers one question and shows the result.
 *
 * @param {string} question Whatever the customer typed or tapped.
 * @returns {void}
 */
function ask(question) {
  const trimmed = question.trim();
  if (trimmed === '') {
    return;
  }
  addMessage('you', [el('p', { text: trimmed })]);

  const result = findAnswer(INTENTS, trimmed);
  const context = buildContext();

  if (!result.matched) {
    addMessage('assistant', [
      el('p', { text: 'I did not follow that one. These are the closest things I can help with:' }),
      suggestionChips(result.suggestions),
    ]);
    return;
  }

  const answer = result.intent.answer(context);
  addMessage('assistant', [
    el('p', { text: answer.text }),
    answer.items.length > 0
      ? el(
          'div',
          { class: 'chat__items' },
          answer.items.map((item) =>
            itemCard(item, (chosen) => {
              close();
              navigate(`/item/${chosen.id}`);
            })
          )
        )
      : null,
    answer.links.length > 0
      ? el(
          'div',
          { class: 'chat__links' },
          answer.links.map((link) =>
            el(
              'button',
              {
                class: 'button button--secondary button--small',
                type: 'button',
                onClick: () => {
                  close();
                  navigate(link.path);
                },
              },
              link.label
            )
          )
        )
      : null,
    result.suggestions.length > 0
      ? el('div', {}, [
          el('p', { class: 'chat__followup', text: 'You could also ask:' }),
          suggestionChips(result.suggestions),
        ])
      : null,
  ]);
}

/**
 * Builds a row of question buttons.
 *
 * @param {object[]} intents Intents to offer.
 * @returns {HTMLElement} The chips.
 */
function suggestionChips(intents) {
  return el(
    'div',
    { class: 'chat__chips' },
    intents.map((intent) =>
      el(
        'button',
        { class: 'chip', type: 'button', onClick: () => ask(intent.label) },
        intent.label
      )
    )
  );
}

/**
 * Closes the panel and returns focus to the button that opened it.
 *
 * @returns {void}
 */
export function close() {
  if (!isOpen) {
    return;
  }
  isOpen = false;
  panel.hidden = true;
  document.querySelector('#assistant-toggle')?.focus();
}

/**
 * Builds the panel on first use.
 *
 * @returns {HTMLElement} The panel.
 */
function buildPanel() {
  transcript = el('div', { class: 'assistant__transcript', role: 'log', 'aria-live': 'polite' });

  const input = el('input', {
    class: 'field__control',
    id: 'assistant-input',
    type: 'text',
    placeholder: 'Ask about the menu, hours, or your order',
    autocomplete: 'off',
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        ask(input.value);
        input.value = '';
      }
    },
  });

  panel = el('aside', { class: 'assistant', hidden: true, 'aria-label': 'Pie Assistant' }, [
    el('div', { class: 'assistant__head' }, [
      el('div', {}, [
        el('h2', { class: 'assistant__title', text: 'Pie Assistant' }),
        el('p', {
          class: 'assistant__subtitle',
          text: 'Answers from this device. No internet needed.',
        }),
      ]),
      el(
        'button',
        {
          class: 'assistant__close',
          type: 'button',
          'aria-label': 'Close the assistant',
          onClick: close,
        },
        '×'
      ),
    ]),
    transcript,
    el('div', { class: 'assistant__foot' }, [
      suggestionChips(INTENTS.filter((intent) => intent.isSuggested)),
      el('label', { class: 'field', for: 'assistant-input' }, [
        el('span', { class: 'visually-hidden', text: 'Ask a question' }),
        input,
      ]),
      el(
        'button',
        {
          class: 'button button--block',
          type: 'button',
          onClick: () => {
            ask(input.value);
            input.value = '';
          },
        },
        'Ask'
      ),
    ]),
  ]);

  document.body.append(panel);

  // Escape closes it, which is what anyone who has met a dialog expects.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      close();
    }
  });

  addMessage('assistant', [
    el('p', {
      text: 'Ask me about the menu, what is vegetarian, what is sold out, opening hours, or where your order has got to. Tap one below to start.',
    }),
  ]);

  return panel;
}

/**
 * Opens the panel, building it the first time.
 *
 * @returns {void}
 */
export function openAssistant() {
  if (panel === null) {
    buildPanel();
  }
  isOpen = true;
  panel.hidden = false;
  panel.querySelector('#assistant-input').focus();
}
