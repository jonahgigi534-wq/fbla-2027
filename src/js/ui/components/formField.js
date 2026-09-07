/**
 * One labeled input with its own error message.
 *
 * Each field knows how to check itself, so the checkout form does not carry a
 * separate list of which validator belongs to which input. That pairing is the thing
 * that goes stale when a form grows.
 *
 * A field checks itself when the customer leaves it, not while they are typing.
 * Telling someone their email is invalid after they have typed two characters is
 * technically true and completely unhelpful.
 *
 * Errors are tied to the input with aria-describedby and marked aria-invalid, so a
 * screen reader announces the reason rather than just the label.
 */

import { el } from '../dom.js';

/**
 * Builds a self checking form field.
 *
 * @param {object} options How this field behaves.
 * @param {string} options.id Input id, also used for the error element.
 * @param {string} options.label Visible label.
 * @param {Function} options.validate Called with the value, returns { valid, message }.
 * @param {string} [options.type] Input type, defaulting to text.
 * @param {string} [options.placeholder] Placeholder text.
 * @param {string} [options.hint] Help text shown under the input.
 * @param {string} [options.value] Starting value.
 * @param {string} [options.autocomplete] Autocomplete hint for the browser.
 * @returns {{node: HTMLElement, input: HTMLElement, check: Function, value: Function}}
 *   The wrapper, the input, a function that validates and shows the result, and a
 *   function that reads the current value.
 */
export function formField({
  id,
  label,
  validate,
  type = 'text',
  placeholder = '',
  hint = '',
  value = '',
  autocomplete,
}) {
  const errorId = `${id}-error`;
  const error = el('span', { class: 'field__error', id: errorId, role: 'alert' });

  const input = el('input', {
    class: 'field__control',
    id,
    type,
    placeholder,
    value,
    autocomplete,
    onBlur: () => check(),
  });

  const wrapper = el('label', { class: 'field', for: id }, [
    el('span', { class: 'field__label', text: label }),
    input,
    hint ? el('span', { class: 'field__hint', text: hint }) : null,
    error,
  ]);

  /**
   * Validates the field and shows the result.
   *
   * @returns {boolean} True when the value passes.
   */
  function check() {
    const result = validate(input.value);
    error.textContent = result.valid ? '' : result.message;
    wrapper.classList.toggle('field--invalid', !result.valid);
    input.setAttribute('aria-invalid', result.valid ? 'false' : 'true');
    input.setAttribute('aria-describedby', result.valid ? '' : errorId);
    return result.valid;
  }

  /**
   * Shows an error the field could not have worked out on its own.
   *
   * Used for the semantic rules in domain/orderRules.js, which need the whole order
   * to reach a verdict. A ZIP code is well formed on its own; whether this location
   * delivers to it is something only the form knows.
   *
   * @param {string} message What is wrong.
   * @returns {void}
   */
  function showError(message) {
    error.textContent = message;
    wrapper.classList.add('field--invalid');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
  }

  return { node: wrapper, input, check, showError, value: () => input.value };
}
