/**
 * What goes inside an assistant message: the built in matcher's answers, the buttons
 * under an AI answer, and the rows of suggested questions.
 *
 * Kept apart from ui/components/assistant.js, which owns the panel and the
 * conversation. Nothing here appends to the screen or decides who answers. Each
 * function builds the contents of one message and hands it back, and anything that
 * has to act on the panel, asking a question or leaving for another screen, arrives
 * as a function passed in.
 */

import { el } from '../dom.js';
import { itemCard } from './itemCard.js';
import { findAnswer } from '../../domain/assistant.js';
import { INTENTS } from '../../data/assistantKnowledge.js';
import { getState } from '../../app/store.js';
import { ALL_ITEMS } from '../../data/menu.js';
import { findLocation } from '../../data/locations.js';
import { stockFor } from '../../domain/inventory.js';
import { calculateOrderTotals } from '../../domain/pricing.js';
import { findPromo } from '../../data/promos.js';

/**
 * Assembles everything the matcher's answer functions read.
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
 * Builds a row of question buttons.
 *
 * @param {object[]} intents Intents to offer.
 * @param {Function} onAsk Called with a question when one is tapped.
 * @returns {HTMLElement} The chips.
 */
export function suggestionChips(intents, onAsk) {
  return el(
    'div',
    { class: 'chat__chips' },
    intents.map((intent) =>
      el(
        'button',
        { class: 'chip', type: 'button', onClick: () => onAsk(intent.label) },
        intent.label
      )
    )
  );
}

/**
 * Builds the buttons that take the customer to a screen.
 *
 * @param {Array<{label: string, path: string}>} links Where to offer.
 * @param {Function} onGo Called with a path; closes the panel and goes there.
 * @returns {HTMLElement|null} The buttons, or null when there are none.
 */
function linkButtons(links, onGo) {
  if (links.length === 0) {
    return null;
  }
  return el(
    'div',
    { class: 'chat__links' },
    links.map((link) =>
      el(
        'button',
        {
          class: 'button button--secondary button--small',
          type: 'button',
          onClick: () => onGo(link.path),
        },
        link.label
      )
    )
  );
}

/**
 * Builds the built in matcher's answer, with a note first when it is standing in.
 *
 * @param {string} question The question, already trimmed.
 * @param {object} options How the message behaves.
 * @param {string|null} [options.note] Why the model did not answer, if it was asked.
 * @param {Function} options.onAsk Called with a follow up question when one is tapped.
 * @param {Function} options.onGo Called with a path when the customer chooses a screen.
 * @returns {Array<Node|null>} The message contents.
 */
export function matcherReply(question, { note = null, onAsk, onGo }) {
  const result = findAnswer(INTENTS, question);
  const noteLine = note ? el('p', { class: 'chat__followup', text: note }) : null;

  if (!result.matched) {
    return [
      noteLine,
      el('p', { text: 'I did not follow that one. These are the closest things I can help with:' }),
      suggestionChips(result.suggestions, onAsk),
    ];
  }

  const answer = result.intent.answer(buildContext());
  return [
    noteLine,
    el('p', { text: answer.text }),
    answer.items.length > 0
      ? el(
          'div',
          { class: 'chat__items' },
          answer.items.map((item) => itemCard(item, (chosen) => onGo(`/item/${chosen.id}`)))
        )
      : null,
    linkButtons(answer.links, onGo),
    result.suggestions.length > 0
      ? el('div', {}, [
          el('p', { class: 'chat__followup', text: 'You could also ask:' }),
          suggestionChips(result.suggestions, onAsk),
        ])
      : null,
  ];
}

/**
 * Builds an AI answer, with buttons to the screens it relates to.
 *
 * The model writes the answer, and the matcher, which knows where everything lives,
 * supplies the buttons that go there. Nothing is offered when the matcher is unsure
 * what the question was about. The answer is set as text, never as HTML, so nothing
 * the model returns can run as code.
 *
 * @param {string} question The question, already trimmed.
 * @param {string} text The model's answer.
 * @param {Function} onGo Called with a path when the customer chooses a screen.
 * @returns {Array<Node|null>} The message contents.
 */
export function aiReply(question, text, onGo) {
  const result = findAnswer(INTENTS, question);
  const links = result.matched ? result.intent.answer(buildContext()).links : [];
  return [el('p', { text }), linkButtons(links, onGo)];
}
