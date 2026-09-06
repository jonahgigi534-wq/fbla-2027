/**
 * The cart: what has been chosen, what it costs, and what is standing in the way.
 *
 * This screen carries three of the situations the assigned topic asks the program to
 * handle, so each one is shown here rather than saved for an error at checkout:
 *
 *   - inventory limits, as a stepper that stops at what is left
 *   - customer budget constraints, as a cap with a warning and a suggestion
 *   - invalid entries, as a promo field that says why a code was refused
 */

import { el, banner, emptyState, render } from '../dom.js';
import { showResult } from '../components/toast.js';
import { getState, ORDER_TYPES } from '../../app/store.js';
import {
  applyPromoCode,
  changeLineQuantity,
  clearPromoCode,
  removeCartLine,
  setBudgetCap,
  setOrderType,
} from '../../app/actions.js';
import { calculateOrderTotals } from '../../domain/pricing.js';
import { BUDGET_STATUS, evaluateBudget, suggestRemovals } from '../../domain/budget.js';
import { countItems } from '../../domain/cart.js';
import { formatUSD } from '../../domain/money.js';
import { findItem } from '../../data/menu.js';
import { findPromo } from '../../data/promos.js';
import { navigate } from '../../app/router.js';

/**
 * Builds one editable cart line.
 *
 * @param {object} line A cart line.
 * @returns {HTMLElement} The row.
 */
function cartRow(line) {
  const item = findItem(line.itemId);
  return el('div', { class: 'cart-row' }, [
    el('div', { class: 'cart-row__media' }, [
      item && item.photo ? el('img', { src: item.photo.src, alt: '', loading: 'lazy' }) : null,
    ]),
    el('div', { class: 'cart-row__info' }, [
      el('p', { class: 'cart-row__name', text: line.name }),
      el('p', { class: 'cart-row__unit', text: `${formatUSD(line.priceCents)} each` }),
      line.note ? el('p', { class: 'cart-row__note', text: `Note: ${line.note}` }) : null,
    ]),
    el('div', { class: 'stepper', role: 'group', 'aria-label': `Quantity of ${line.name}` }, [
      el(
        'button',
        {
          class: 'stepper__button',
          type: 'button',
          'aria-label': `One fewer ${line.name}`,
          onClick: () => showResult(changeLineQuantity(line.lineId, line.quantity - 1, item)),
        },
        '−'
      ),
      el('output', { class: 'stepper__value', text: String(line.quantity) }),
      el(
        'button',
        {
          class: 'stepper__button',
          type: 'button',
          'aria-label': `One more ${line.name}`,
          onClick: () => showResult(changeLineQuantity(line.lineId, line.quantity + 1, item)),
        },
        '+'
      ),
    ]),
    el('p', { class: 'cart-row__total price', text: formatUSD(line.priceCents * line.quantity) }),
    el(
      'button',
      {
        class: 'button button--quiet button--small',
        type: 'button',
        'aria-label': `Remove ${line.name}`,
        onClick: () => showResult(removeCartLine(line.lineId)),
      },
      'Remove'
    ),
  ]);
}

/**
 * Builds the budget cap control and whatever warning the current total earns.
 *
 * @param {object} state Current application state.
 * @param {object} totals The price breakdown from calculateOrderTotals.
 * @returns {HTMLElement} The budget panel.
 */
function budgetPanel(state, totals) {
  const verdict = evaluateBudget(totals.total, state.budgetCapCents);
  const capField = el('input', {
    class: 'field__control',
    id: 'budget-cap',
    type: 'text',
    inputmode: 'decimal',
    placeholder: 'e.g. 40',
    value: state.budgetCapCents === null ? '' : (state.budgetCapCents / 100).toFixed(2),
  });

  let warning = null;
  if (verdict.status === BUDGET_STATUS.over) {
    const removals = suggestRemovals(state.cart, verdict.overByCents);
    warning = banner(
      'danger',
      `Over your limit by ${formatUSD(verdict.overByCents)}`,
      removals.length > 0
        ? `Removing ${removals.map((line) => line.name).join(' and ')} would bring you back under.`
        : 'Try removing an item or raising the limit.'
    );
  } else if (verdict.status === BUDGET_STATUS.close) {
    warning = banner(
      'warning',
      `${formatUSD(verdict.remainingCents)} left of your limit`,
      'You are close to the amount you set.'
    );
  } else if (verdict.capCents !== null) {
    warning = banner(
      'success',
      `${formatUSD(verdict.remainingCents)} left of your limit`,
      'Your order is comfortably inside the amount you set.'
    );
  }

  return el('section', { class: 'card cart-panel' }, [
    el('div', { class: 'card__body' }, [
      el('h3', { text: 'Spending limit' }),
      el('p', {
        class: 'field__hint',
        text: 'Set what you want to stay under and we will warn you before you go over.',
      }),
      el('div', { class: 'cart-panel__row' }, [
        capField,
        el(
          'button',
          {
            class: 'button button--secondary',
            type: 'button',
            onClick: () => showResult(setBudgetCap(capField.value, totals.total)),
          },
          state.budgetCapCents === null ? 'Set limit' : 'Update'
        ),
      ]),
      warning,
    ]),
  ]);
}

/**
 * Builds the promo code control.
 *
 * @param {object} state Current application state.
 * @returns {HTMLElement} The promo panel.
 */
function promoPanel(state) {
  const promo = state.promoCode ? findPromo(state.promoCode) : null;
  const codeField = el('input', {
    class: 'field__control',
    id: 'promo-code',
    type: 'text',
    placeholder: 'Enter a code',
    autocomplete: 'off',
  });

  if (promo) {
    return el('div', { class: 'cart-panel__applied' }, [
      el('p', {}, [el('strong', { text: promo.code }), ` applied. ${promo.description}.`]),
      el(
        'button',
        {
          class: 'button button--quiet button--small',
          type: 'button',
          onClick: () => showResult(clearPromoCode()),
        },
        'Remove'
      ),
    ]);
  }

  return el('div', { class: 'cart-panel__row' }, [
    codeField,
    el(
      'button',
      {
        class: 'button button--secondary',
        type: 'button',
        onClick: () => showResult(applyPromoCode(codeField.value)),
      },
      'Apply'
    ),
  ]);
}

/**
 * Builds one line of the price breakdown.
 *
 * @param {string} label What the amount is for.
 * @param {number} cents The amount.
 * @param {boolean} [isTotal] True for the grand total, which is styled larger.
 * @returns {HTMLElement} The row.
 */
function totalRow(label, cents, isTotal = false) {
  return el('div', { class: `total-row${isTotal ? ' total-row--grand' : ''}` }, [
    el('span', { text: label }),
    el('span', { class: 'price', text: formatUSD(cents) }),
  ]);
}

/**
 * Builds the order type selector.
 *
 * @param {object} state Current application state.
 * @returns {HTMLElement} The selector.
 */
function orderTypePicker(state) {
  return el(
    'div',
    { class: 'filter-row', role: 'group', 'aria-label': 'How would you like your order' },
    ORDER_TYPES.map((type) =>
      el(
        'button',
        {
          class: 'chip',
          type: 'button',
          'aria-pressed': state.orderTypeId === type.id ? 'true' : 'false',
          onClick: () => setOrderType(type.id),
        },
        type.label
      )
    )
  );
}

/**
 * Renders the cart screen.
 *
 * @param {HTMLElement} container The main element to render into.
 * @returns {void}
 */
export function renderCart(container) {
  const state = getState();

  if (state.cart.length === 0) {
    render(
      container,
      emptyState({
        icon: '\u{1F6D2}',
        title: 'Your order is empty',
        body: 'Add something from the menu and it will show up here with the running total.',
        action: { label: 'Browse the menu', onClick: () => navigate('/menu') },
      })
    );
    return;
  }

  const promo = state.promoCode ? findPromo(state.promoCode) : null;
  const totals = calculateOrderTotals(state.cart, {
    orderTypeId: state.orderTypeId,
    promo,
  });
  const budget = evaluateBudget(totals.total, state.budgetCapCents);
  const isOverBudget = budget.status === BUDGET_STATUS.over;

  render(container, [
    el('div', { class: 'page-head' }, [
      el('h1', { text: 'Your order' }),
      el('p', {
        class: 'page-head__lede',
        text: `${countItems(state.cart)} items. Change anything here before you check out.`,
      }),
    ]),

    el('div', { class: 'cart-layout' }, [
      el('div', { class: 'cart-lines' }, state.cart.map(cartRow)),

      el('aside', { class: 'cart-summary stack' }, [
        el('section', { class: 'card' }, [
          el('div', { class: 'card__body stack' }, [
            el('h3', { text: 'How would you like it' }),
            orderTypePicker(state),
            el('h3', { text: 'Promo code' }),
            promoPanel(state),
            el('div', { class: 'totals' }, [
              totalRow('Subtotal', totals.subtotal),
              totals.discount > 0 ? totalRow('Discount', -totals.discount) : null,
              totals.deliveryFee > 0 ? totalRow('Delivery', totals.deliveryFee) : null,
              totalRow('Sales tax, 8.25%', totals.tax),
              totalRow('Total', totals.total, true),
            ]),
            el(
              'button',
              {
                class: 'button button--block',
                type: 'button',
                disabled: isOverBudget,
                onClick: () => navigate('/checkout'),
              },
              isOverBudget ? 'Over your spending limit' : 'Go to checkout'
            ),
            isOverBudget
              ? el('p', {
                  class: 'field__hint',
                  text: 'Remove something or raise your limit to continue.',
                })
              : null,
          ]),
        ]),
        budgetPanel(state, totals),
      ]),
    ]),
  ]);
}
