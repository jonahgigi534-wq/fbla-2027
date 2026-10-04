/**
 * One labeled input with its own error message.
 *
 * Each field checks itself when the customer leaves it, not while typing, and its error
 * is linked to the input for screen readers.
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
