/**
 * The one network call in the program: asking the AI model a question.
 *
 * OpenRouter is asked for the fastest host, usually Groq. Any failure becomes a reason
 * the panel can explain, and the built in assistant answers instead. The key is never
 * in the code; it is pasted into AI settings and kept in this browser.
 */

/** Where questions are sent. The build allows this address and no other. */
export const AI_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/** The model that answers. Changing models means changing this one line. */
export const AI_MODEL = 'meta-llama/llama-3.3-70b-instruct';

/** How the model is named on screen and in the documentation. */
export const AI_MODEL_LABEL = 'Llama 3.3';

/** Longest the panel waits before giving up and answering from the matcher. */
const TIMEOUT_MS = 15000;

/** A ceiling on answer length, well above the 80 words the model is asked for. */
const MAX_ANSWER_TOKENS = 300;

/** Low, because answers should be factual rather than inventive. */
const TEMPERATURE = 0.3;

/** Where the key is kept, apart from the rest of the saved state on purpose. */
const KEY_STORAGE = 'houseofpies.openrouterKey';

/** Holds the key when the browser refuses to store anything. */
let keyInMemory = null;

/**
 * A failed request, with a reason the panel can turn into a sentence.
 */
export class AiError extends Error {
  /**
   * @param {string} reason One of 'key', 'credits', 'busy', 'timeout', 'network',
   *   'service', or 'empty'.
   */
  constructor(reason) {
    super(`AI request failed: ${reason}`);
    this.reason = reason;
  }
}

/**
 * Reads the saved key.
 *
 * Kept apart from the saved orders, so Reset all data does not clear it.
 *
 * @returns {string|null} The key, or null when none has been saved.
 */
export function getApiKey() {
  try {
    return window.localStorage.getItem(KEY_STORAGE) ?? keyInMemory;
  } catch {
    return keyInMemory;
  }
}

/**
 * Whether a key has been saved, which is what decides who answers.
 *
 * @returns {boolean} True when questions should go to the model.
 */
export function hasApiKey() {
  const key = getApiKey();
  return key !== null && key !== '';
}

/**
 * Saves a key. Validation happens before this is called.
 *
 * @param {string} key The key, already checked for shape.
 * @returns {void}
 */
export function saveApiKey(key) {
  keyInMemory = key;
  try {
    window.localStorage.setItem(KEY_STORAGE, key);
  } catch {
    // The browser will not store it, so it lives in memory until the tab closes.
  }
}

/**
 * Forgets the saved key, which puts the assistant back on the matcher.
 *
 * @returns {void}
 */
export function clearApiKey() {
  keyInMemory = null;
  try {
    window.localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Nothing was stored, so there is nothing to remove.
  }
}

/**
 * Turns a response status into a failure reason.
 *
 * @param {number} status The HTTP status OpenRouter replied with.
 * @returns {string} The reason.
 */
function reasonForStatus(status) {
  if (status === 401 || status === 403) {
    return 'key';
  }
  if (status === 402) {
    return 'credits';
  }
  if (status === 429) {
    return 'busy';
  }
  return 'service';
}

/**
 * Asks the model one question and returns its answer.
 *
 * @param {object} request What to send.
 * @param {string} request.apiKey The OpenRouter key.
 * @param {Array<{role: string, content: string}>} request.messages From
 *   domain/aiPrompt.js buildMessages.
 * @param {Function} [request.fetchImpl] Stands in for fetch, so the tests can answer
 *   without a network.
 * @param {number} [request.timeoutMs] How long to wait.
 * @returns {Promise<string>} The model's answer.
 * @throws {AiError} With a reason, whenever no usable answer came back.
 */
export async function askModel({
  apiKey,
  messages,
  fetchImpl = (...args) => globalThis.fetch(...args),
  timeoutMs = TIMEOUT_MS,
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchImpl(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'House of Pies Ordering',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: MAX_ANSWER_TOKENS,
        temperature: TEMPERATURE,
        provider: { sort: 'throughput' },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    throw new AiError(error?.name === 'AbortError' ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new AiError(reasonForStatus(response.status));
  }
  const body = await response.json().catch(() => null);
  const answer = body?.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || answer.trim() === '') {
    throw new AiError('empty');
  }
  return answer;
}

/** What the panel says when the model could not answer, by reason. */
const FAILURE_NOTES = {
  key: 'OpenRouter did not accept the AI key, so this answer comes from the built in assistant. Check the key under AI settings.',
  credits:
    'The OpenRouter account has run out of credit, so this answer comes from the built in assistant.',
  busy: 'The AI is busy right now, so this answer comes from the built in assistant.',
  timeout: 'The AI took too long to reply, so this answer comes from the built in assistant.',
  network: 'The AI could not be reached, so this answer comes from the built in assistant.',
  service: 'The AI had a problem answering, so this answer comes from the built in assistant.',
  empty: 'The AI sent back an empty answer, so this one comes from the built in assistant.',
};

/**
 * Explains a failure in a sentence the customer can read.
 *
 * @param {unknown} error Whatever askModel threw.
 * @returns {string} The sentence.
 */
export function describeFailure(error) {
  return FAILURE_NOTES[error?.reason] ?? FAILURE_NOTES.service;
}
