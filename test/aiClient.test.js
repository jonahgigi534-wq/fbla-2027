/**
 * Tests for the one network call, with the network replaced.
 *
 * What matters is what gets sent and what happens when it goes wrong. Every failure
 * has to come back as a reason the assistant can explain, because the assistant's
 * promise is that the customer always gets an answer, from the built in matcher when
 * the model cannot give one.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_ENDPOINT,
  AI_MODEL,
  AiError,
  askModel,
  describeFailure,
} from '../src/js/app/aiClient.js';

/** A key of the right shape. Not a real one. */
const KEY = 'sk-or-v1-0000000000000000';

/** What every request in these tests asks. */
const MESSAGES = [{ role: 'user', content: 'how much is pecan pie?' }];

/**
 * Builds a stand in for fetch that answers with one response.
 *
 * @param {number} status The HTTP status to answer with.
 * @param {unknown} body What the response body parses to.
 * @returns {Function} The stand in.
 */
function answering(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

/**
 * Checks that a request fails with a particular reason.
 *
 * @param {Function} fetchImpl The stand in for fetch.
 * @param {string} reason The reason expected.
 * @param {number} [timeoutMs] How long the request may take.
 * @returns {Promise<void>} Resolves once checked.
 */
async function failsWith(fetchImpl, reason, timeoutMs) {
  await assert.rejects(
    askModel({ apiKey: KEY, messages: MESSAGES, fetchImpl, timeoutMs }),
    (error) => error instanceof AiError && error.reason === reason
  );
}

test('sends the model, the messages, the key, and fastest host routing', async () => {
  let sent = null;
  const fetchImpl = async (url, init) => {
    sent = { url, init };
    return answering(200, { choices: [{ message: { content: 'Pecan pie is $5.50.' } }] })();
  };

  const answer = await askModel({ apiKey: KEY, messages: MESSAGES, fetchImpl });

  assert.equal(answer, 'Pecan pie is $5.50.');
  assert.equal(sent.url, AI_ENDPOINT);
  assert.equal(sent.init.method, 'POST');
  assert.equal(sent.init.headers.Authorization, `Bearer ${KEY}`);
  const body = JSON.parse(sent.init.body);
  assert.equal(body.model, AI_MODEL);
  assert.deepEqual(body.messages, MESSAGES);
  assert.deepEqual(body.provider, { sort: 'throughput' });
});

test('a rejected key, no credit, and a busy service each get their own reason', async () => {
  await failsWith(answering(401, {}), 'key');
  await failsWith(answering(402, {}), 'credits');
  await failsWith(answering(429, {}), 'busy');
  await failsWith(answering(500, {}), 'service');
});

test('no connection at all is reported as a network failure', async () => {
  await failsWith(async () => {
    throw new TypeError('Failed to fetch');
  }, 'network');
});

test('a reply that never comes is abandoned rather than waited on forever', async () => {
  const hangs = (url, init) =>
    new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        reject(error);
      });
    });
  await failsWith(hangs, 'timeout', 10);
});

test('an empty or unreadable answer is a failure, not a blank message', async () => {
  await failsWith(answering(200, { choices: [{ message: { content: '   ' } }] }), 'empty');
  await failsWith(answering(200, { choices: [] }), 'empty');
  await failsWith(answering(200, null), 'empty');
});

test('every failure explains itself, and says who answered instead', () => {
  for (const reason of ['key', 'credits', 'busy', 'timeout', 'network', 'service', 'empty']) {
    assert.match(describeFailure(new AiError(reason)), /built in assistant/);
  }
  assert.match(describeFailure(new Error('something unexpected')), /built in assistant/);
});
