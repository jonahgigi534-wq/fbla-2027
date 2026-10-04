/**
 * The AI side of the Pie Assistant: what it is told, and what it remembers.
 *
 * The facts are read fresh for every question, so an answer never describes a cart the
 * customer has already changed. The conversation lives in memory only.
 *
 * Used by ui/components/assistant.js, which decides whether to ask the model at all
 * and falls back to the matcher when this throws.
 */

import { getState } from './store.js';
import { askModel, getApiKey } from './aiClient.js';
import {
  MAX_HISTORY_TURNS,
  buildMessages,
  buildSystemPrompt,
  cleanAnswer,
} from '../domain/aiPrompt.js';
import {
  DELIVERY_FEE_CENTS,
  DELIVERY_MINIMUM_CENTS,
  FREE_DELIVERY_THRESHOLD_CENTS,
  calculateOrderTotals,
} from '../domain/pricing.js';
import { stockFor } from '../domain/inventory.js';
import { SECTIONS } from '../data/menu.js';
import { DAY_NAMES, LOCATIONS } from '../data/locations.js';
import { PROMOS, findPromo } from '../data/promos.js';
import { HELP_ARTICLES } from '../data/helpArticles.js';

/** Earlier questions and answers, oldest first. Replaced, never edited in place. */
let history = [];

/**
 * Reads everything the model is allowed to answer from, as it stands right now.
 *
 * @param {Date} now The moment the question is asked.
 * @returns {object} What domain/aiPrompt.js buildSystemPrompt takes.
 */
function gatherFacts(now) {
  const state = getState();
  const promo = state.promoCode ? findPromo(state.promoCode) : null;
  const totals = calculateOrderTotals(state.cart, { orderTypeId: state.orderTypeId, promo });

  return {
    sections: SECTIONS,
    stockOf: (item) => stockFor(item, state.stockOverrides),
    locations: LOCATIONS,
    selectedLocationId: state.locationId,
    now,
    dayNames: DAY_NAMES,
    cart: {
      lines: state.cart,
      totalCents: totals.total,
      orderTypeId: state.orderTypeId,
      budgetCapCents: state.budgetCapCents,
      promoCode: state.promoCode,
    },
    orders: state.orders.filter((order) => !order.isSeeded || order.isDemoCustomer),
    policies: {
      deliveryFeeCents: DELIVERY_FEE_CENTS,
      freeDeliveryCents: FREE_DELIVERY_THRESHOLD_CENTS,
      deliveryMinimumCents: DELIVERY_MINIMUM_CENTS,
      promos: PROMOS,
    },
    howTo: HELP_ARTICLES,
  };
}

/**
 * Asks the model a question about the live program and remembers the exchange.
 *
 * Only answers the model gave are remembered, so its history never includes turns the
 * built in assistant answered.
 *
 * @param {string} question What the customer asked.
 * @returns {Promise<string>} The model's answer, with stray formatting removed.
 * @throws {AiError} From app/aiClient.js, whenever the model could not answer.
 */
export async function answerWithAi(question) {
  const messages = buildMessages({
    systemPrompt: buildSystemPrompt(gatherFacts(new Date())),
    history,
    question,
  });
  const answer = cleanAnswer(await askModel({ apiKey: getApiKey(), messages }));
  history = [
    ...history,
    { role: 'user', content: question },
    { role: 'assistant', content: answer },
  ].slice(-MAX_HISTORY_TURNS * 2);
  return answer;
}

/**
 * Forgets the conversation, for when the key changes and a new one starts.
 *
 * @returns {void}
 */
export function forgetConversation() {
  history = [];
}
