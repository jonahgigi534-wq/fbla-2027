/**
 * The Pie Assistant: a chat window that opens from the round button in the bottom right
 * corner of every page.
 *
 * With a key it answers through Llama 3.3; otherwise, or when that fails, the built in
 * matcher answers. The subtitle always says which.
 *
 * On a wide screen it floats over the corner and the page behind it keeps working, the
 * way a shop's chat does. On a phone it fills the screen, so there it acts as a dialog:
 * Tab stays inside it and Back closes it.
 */

import { el, render } from '../dom.js';
import { aiSettings } from './aiSettings.js';
import { aiReply, matcherReply, suggestionChips } from './assistantReplies.js';
import { INTENTS } from '../../data/assistantKnowledge.js';
import { navigate, registerDialog, clearDialog } from '../../app/router.js';
import { AI_MODEL_LABEL, describeFailure, hasApiKey } from '../../app/aiClient.js';
import { answerWithAi, forgetConversation } from '../../app/aiConversation.js';
import { trapFocus } from '../focusTrap.js';
import { createLauncher, showLauncherOpen } from './assistantLauncher.js';

/** The chat window's id, which the corner button points at. */
const PANEL_ID = 'assistant-panel';

/** Screens this narrow get the chat full screen rather than floating. */
const FULL_SCREEN_QUERY = '(max-width: 520px)';

/** How long the window takes to shrink away, matched in components.css. */
const CLOSE_MS = 160;

/** The pie shown beside the assistant's name. */
const AVATAR_SRC = 'assets/img/bayou-goo-pie.webp';

/** The panel element, built once and reused. */
let panel = null;

/** The corner button that opens and closes it. */
let launcher = null;

/** Hides the panel once its closing animation has run. */
let closeTimer = null;

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
 * Closes the panel. Focus goes back to the corner button if it was inside the chat.
 *
 * @returns {void}
 */
export function close() {
  if (!isOpen) {
    return;
  }
  const hadFocus = panel.contains(document.activeElement);
  isOpen = false;
  showLauncherOpen(launcher, false);
  releaseFocus?.();
  releaseFocus = null;
  clearDialog();
  panel.classList.add('assistant--closing');
  closeTimer = window.setTimeout(() => {
    panel.hidden = true;
    panel.classList.remove('assistant--closing');
  }, CLOSE_MS);
  if (hadFocus) {
    launcher?.focus();
  }
}

/**
 * Builds the question box and the button that sends it.
 *
 * @returns {HTMLElement} The row holding both.
 */
function buildCompose() {
  const send = () => {
    ask(inputField.value);
    inputField.value = '';
  };
  inputField = el('input', {
    class: 'field__control',
    id: 'assistant-input',
    type: 'text',
    placeholder: 'Ask about pies, hours, or your order',
    autocomplete: 'off',
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        send();
      }
    },
  });
  askButton = el('button', { class: 'button', type: 'button', onClick: send }, 'Ask');
  return el('div', { class: 'assistant__compose' }, [
    el('label', { class: 'field', for: 'assistant-input' }, [
      el('span', { class: 'visually-hidden', text: 'Ask a question' }),
      inputField,
    ]),
    askButton,
  ]);
}

/**
 * Builds the dark strip across the top: the pie, the name, who is answering, and close.
 *
 * @returns {HTMLElement} The header.
 */
function buildHead() {
  subtitle = el('p', { class: 'assistant__subtitle', text: subtitleText() });
  return el('div', { class: 'assistant__head' }, [
    el('img', { class: 'assistant__avatar', src: AVATAR_SRC, alt: '' }),
    el('div', { class: 'assistant__heading' }, [
      el('h2', { class: 'assistant__title', id: 'assistant-title', text: 'Pie Assistant' }),
      subtitle,
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
  ]);
}

/**
 * Builds the row of suggested questions, which scrolls sideways.
 *
 * @returns {HTMLElement} The row.
 */
function buildSuggestions() {
  const row = suggestionChips(
    INTENTS.filter((intent) => intent.isSuggested),
    ask
  );
  // A mouse wheel only scrolls up and down, so it moves the row along instead.
  row.addEventListener(
    'wheel',
    (event) => {
      if (event.deltaX === 0 && event.deltaY !== 0) {
        row.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    },
    { passive: false }
  );
  return row;
}

/**
 * Builds the panel, hidden until the corner button is pressed.
 *
 * @returns {HTMLElement} The panel.
 */
function buildPanel() {
  transcript = el('div', { class: 'assistant__transcript', role: 'log', 'aria-live': 'polite' });
  panel = el(
    'aside',
    {
      class: 'assistant',
      id: PANEL_ID,
      hidden: true,
      role: 'dialog',
      'aria-labelledby': 'assistant-title',
    },
    [
      buildHead(),
      transcript,
      el('div', { class: 'assistant__foot' }, [
        buildSuggestions(),
        buildCompose(),
        aiSettings({ onChange: onAiChange }),
      ]),
    ]
  );

  // Escape closes it while you are in it, and leaves it alone while you use the page.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen && panel.contains(document.activeElement)) {
      close();
    }
  });

  addMessage('assistant', [
    el('p', {
      text: 'Hi! Ask me about the menu, what is vegetarian, what is sold out, opening hours, or where your order has got to. Tap a question below to start.',
    }),
  ]);
  return panel;
}

/**
 * Opens the panel, or puts the cursor back in it if it is already open.
 *
 * @returns {void}
 */
export function openAssistant() {
  if (panel === null) {
    document.body.append(buildPanel());
  }
  if (!isOpen) {
    window.clearTimeout(closeTimer);
    panel.classList.remove('assistant--closing');
    panel.hidden = false;
    isOpen = true;
    showLauncherOpen(launcher, true);
    if (window.matchMedia?.(FULL_SCREEN_QUERY).matches) {
      // Full screen, so the page behind is out of reach: hold Tab, and let Back close it.
      panel.setAttribute('aria-modal', 'true');
      registerDialog(close);
      releaseFocus = trapFocus(panel);
    } else {
      panel.removeAttribute('aria-modal');
    }
  }
  inputField.focus();
}

/**
 * Puts the corner button and the closed chat on the page. Called once at start up.
 *
 * @returns {void}
 */
export function mountAssistant() {
  if (launcher !== null) {
    return;
  }
  launcher = createLauncher(PANEL_ID, () => (isOpen ? close() : openAssistant()));
  document.body.append(buildPanel(), launcher);
}
