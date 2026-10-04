/**
 * The Pie Assistant panel.
 *
 * A slide over that any screen can open. It holds the conversation, the input, a row
 * of suggested questions, and the folded control that switches AI answers on.
 *
 * Two things can answer. With a key saved, questions go to Llama 3.3 through
 * OpenRouter, told the live menu, stock, hours, and cart; app/aiConversation.js does
 * that. Without a key, or whenever the model cannot answer for any reason, the built
 * in matcher in domain/assistant.js answers from this device, and says so when it is
 * standing in. The customer always gets an answer.
 *
 * The suggested questions are not decoration. They are what makes the feature
 * demonstrable: someone meeting the program for the first time has no idea what it
 * can be asked, and a blank box invites a question it cannot answer.
 *
 * This file owns the panel and the conversation. What goes inside each message is
 * built in ui/components/assistantReplies.js.
 */

import { el, render } from '../dom.js';
import { aiSettings } from './aiSettings.js';
import { aiReply, matcherReply, suggestionChips } from './assistantReplies.js';
import { INTENTS } from '../../data/assistantKnowledge.js';
import { navigate, registerDialog, clearDialog } from '../../app/router.js';
import { AI_MODEL_LABEL, describeFailure, hasApiKey } from '../../app/aiClient.js';
import { answerWithAi, forgetConversation } from '../../app/aiConversation.js';
import { trapFocus } from '../focusTrap.js';

/** The panel element, built once and reused. */
let panel = null;

/** Where the conversation is appended. */
let transcript = null;

/** The line under the title that says who is answering. */
let subtitle = null;

/** The question box, and the button that sends it. */
let inputField = null;
let askButton = null;

/** Whether the panel is currently on screen. */
let isOpen = false;

/** Whether an AI answer is on its way, so a second question waits for it. */
let isBusy = false;

/** Releases the focus trap, set while the panel is open. */
let releaseFocus = null;

/**
 * Says who is answering, so nobody mistakes the matcher for the model or the other
 * way round.
 *
 * @returns {string} The subtitle.
 */
function subtitleText() {
  return hasApiKey()
    ? `Built with ${AI_MODEL_LABEL}, through OpenRouter. It reads this menu and your cart.`
    : `Answers from this device. Add a key under AI settings to use ${AI_MODEL_LABEL}.`;
}

/**
 * Adds one message to the conversation.
 *
 * @param {string} role 'you' or 'assistant'.
 * @param {Array<Node|string|null>} content What the message contains.
 * @returns {HTMLElement} The message body, so a placeholder can be filled in later.
 */
function addMessage(role, content) {
  const body = el('div', { class: 'chat__body' }, content);
  transcript.append(
    el('div', { class: `chat chat--${role}` }, [
      el('p', { class: 'chat__who', text: role === 'you' ? 'You' : 'Pie Assistant' }),
      body,
    ])
  );
  transcript.scrollTop = transcript.scrollHeight;
  return body;
}

/**
 * Closes the panel and goes to a screen the conversation pointed at.
 *
 * @param {string} path Where to go.
 * @returns {void}
 */
function goTo(path) {
  close();
  navigate(path);
}

/**
 * Locks the question box while an answer is on its way.
 *
 * @param {boolean} busy Whether an answer is pending.
 * @returns {void}
 */
function setBusy(busy) {
  isBusy = busy;
  inputField.disabled = busy;
  askButton.disabled = busy;
  askButton.textContent = busy ? 'Asking' : 'Ask';
  if (!busy && isOpen) {
    inputField.focus();
  }
}

/**
 * Answers one question, from the model when a key is saved, otherwise from the
 * matcher, and from the matcher anyway whenever the model cannot.
 *
 * @param {string} question Whatever the customer typed or tapped.
 * @returns {Promise<void>} Resolves once the answer is on screen.
 */
async function ask(question) {
  const trimmed = question.trim();
  if (trimmed === '' || isBusy) {
    return;
  }
  addMessage('you', [el('p', { text: trimmed })]);

  if (!hasApiKey()) {
    addMessage('assistant', matcherReply(trimmed, { onAsk: ask, onGo: goTo }));
    return;
  }

  setBusy(true);
  const pending = addMessage('assistant', [el('p', { class: 'muted', text: 'Thinking...' })]);
  try {
    const text = await answerWithAi(trimmed);
    render(pending, aiReply(trimmed, text, goTo));
  } catch (error) {
    pending.parentElement.remove();
    addMessage(
      'assistant',
      matcherReply(trimmed, { note: describeFailure(error), onAsk: ask, onGo: goTo })
    );
  } finally {
    setBusy(false);
    transcript.scrollTop = transcript.scrollHeight;
  }
}

/**
 * Reacts to AI answers being switched on or off.
 *
 * The conversation so far is forgotten, so the model never inherits turns the matcher
 * answered, and the subtitle changes so it is always clear who is answering.
 *
 * @param {string} setting 'on' or 'off'.
 * @returns {void}
 */
function onAiChange(setting) {
  forgetConversation();
  subtitle.textContent = subtitleText();
  addMessage('assistant', [
    el('p', {
      text:
        setting === 'on'
          ? `AI answers are on. Questions now go to ${AI_MODEL_LABEL}, along with this menu and your cart.`
          : 'AI answers are off. I will answer from this device.',
    }),
  ]);
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
  releaseFocus?.();
  releaseFocus = null;
  clearDialog();
  document.querySelector('#assistant-toggle')?.focus();
}

/**
 * Builds the question box and the button that sends it.
 *
 * @returns {void}
 */
function buildInput() {
  const send = () => {
    ask(inputField.value);
    inputField.value = '';
  };
  inputField = el('input', {
    class: 'field__control',
    id: 'assistant-input',
    type: 'text',
    placeholder: 'Ask about the menu, hours, or your order',
    autocomplete: 'off',
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        send();
      }
    },
  });
  askButton = el('button', { class: 'button button--block', type: 'button', onClick: send }, 'Ask');
}

/**
 * Builds the panel on first use.
 *
 * @returns {HTMLElement} The panel.
 */
function buildPanel() {
  transcript = el('div', { class: 'assistant__transcript', role: 'log', 'aria-live': 'polite' });
  subtitle = el('p', { class: 'assistant__subtitle', text: subtitleText() });
  buildInput();

  /*
   * A dialog rather than a bare aside. It covers the screen, takes focus when it
   * opens, gives it back when it closes, and shuts on Escape or Back. aria-modal is
   * what tells a screen reader the rest of the page is out of play while it is there,
   * and focusTrap makes that true for the keyboard as well.
   */
  panel = el(
    'aside',
    {
      class: 'assistant',
      hidden: true,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Pie Assistant',
    },
    [
      el('div', { class: 'assistant__head' }, [
        el('div', {}, [el('h2', { class: 'assistant__title', text: 'Pie Assistant' }), subtitle]),
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
        suggestionChips(
          INTENTS.filter((intent) => intent.isSuggested),
          ask
        ),
        el('label', { class: 'field', for: 'assistant-input' }, [
          el('span', { class: 'visually-hidden', text: 'Ask a question' }),
          inputField,
        ]),
        askButton,
        aiSettings({ onChange: onAiChange }),
      ]),
    ]
  );

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
  // Back closes the panel rather than leaving the screen behind it.
  registerDialog(close);
  // And Tab stays inside it, rather than walking out into the page underneath.
  releaseFocus = trapFocus(panel);
  inputField.focus();
}
