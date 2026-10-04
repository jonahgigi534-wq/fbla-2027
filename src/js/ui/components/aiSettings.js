/**
 * The control under the assistant that switches AI answers on and off.
 *
 * Folded away by default. A customer opening the assistant has no use for it, and on
 * competition day it is used once, during setup, to paste the key in.
 *
 * The key field is a password field so it is not shown on screen across a table of
 * judges, and the hint says plainly where the key goes, because someone careful will
 * want to know before typing one in.
 *
 * Used by ui/components/assistant.js.
 */

import { el, render } from '../dom.js';
import { validateApiKey } from '../../domain/validation.js';
import { AI_MODEL_LABEL, clearApiKey, hasApiKey, saveApiKey } from '../../app/aiClient.js';

/**
 * Builds the form for pasting a key in.
 *
 * @param {Function} onSaved Called once a key that passed the shape check is saved.
 * @returns {HTMLElement[]} The field, its hint and error line, and the button.
 */
function keyForm(onSaved) {
  const error = el('span', { class: 'field__error', role: 'alert' });
  const field = el('input', {
    class: 'field__control',
    id: 'ai-key',
    type: 'password',
    autocomplete: 'off',
    spellcheck: 'false',
    placeholder: 'sk-or-',
  });

  /**
   * Checks the key's shape, and saves it if it passes.
   *
   * @returns {void}
   */
  function save() {
    const verdict = validateApiKey(field.value);
    if (!verdict.valid) {
      error.textContent = verdict.message;
      field.setAttribute('aria-invalid', 'true');
      field.focus();
      return;
    }
    saveApiKey(field.value.trim());
    onSaved();
  }

  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
  });

  return [
    el('label', { class: 'field', for: 'ai-key' }, [
      el('span', { class: 'field__label', text: 'OpenRouter key' }),
      field,
      el('span', {
        class: 'field__hint',
        text: 'Kept in this browser only, never in the code. Without a key the assistant answers from this device.',
      }),
      error,
    ]),
    el('button', { class: 'button button--small', type: 'button', onClick: save }, 'Save key'),
  ];
}

/**
 * Builds the folded AI settings control.
 *
 * @param {object} options What happens when the setting changes.
 * @param {Function} options.onChange Called with 'on' or 'off' after the key is saved
 *   or removed.
 * @returns {HTMLElement} The control.
 */
export function aiSettings({ onChange }) {
  const region = el('div', { class: 'ai-settings__panel', id: 'ai-settings-panel', hidden: true });

  /**
   * Draws whichever form fits: the key field, or the status and a remove button.
   *
   * @returns {void}
   */
  function draw() {
    if (!hasApiKey()) {
      render(
        region,
        keyForm(() => {
          onChange('on');
          draw();
        })
      );
      return;
    }
    render(region, [
      el('p', {
        class: 'field__hint',
        text: `AI answers are on, using ${AI_MODEL_LABEL}. The key is saved in this browser only.`,
      }),
      el(
        'button',
        {
          class: 'button button--secondary button--small',
          type: 'button',
          onClick: () => {
            clearApiKey();
            onChange('off');
            draw();
          },
        },
        'Remove key'
      ),
    ]);
  }

  const toggle = el(
    'button',
    {
      class: 'button button--quiet button--small',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'ai-settings-panel',
      onClick: () => {
        const isOpening = region.hidden;
        region.hidden = !isOpening;
        toggle.setAttribute('aria-expanded', String(isOpening));
        if (isOpening) {
          draw();
          region.querySelector('input, button')?.focus();
        }
      },
    },
    'AI settings'
  );

  return el('div', { class: 'ai-settings' }, [toggle, region]);
}
