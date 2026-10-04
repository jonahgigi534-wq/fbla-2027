/**
 * The matching engine behind the Pie Assistant.
 *
 * It answers whenever the AI cannot: no key, no credit, or no wifi. A word one typo
 * away still matches, and a question that matches nothing is offered the nearest
 * topics.
 */

/** Words too common to tell intents apart. */
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'do',
  'does',
  'did',
  'can',
  'could',
  'would',
  'i',
  'you',
  'me',
  'my',
  'we',
  'us',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'and',
  'or',
  'it',
  'be',
  'have',
  'has',
  'get',
  'got',
  'any',
  'some',
  'there',
  'what',
  'whats',
  'please',
  'thanks',
]);

/** Score for an exact keyword match. */
const EXACT_MATCH_SCORE = 10;

/**
 * Score for a keyword matched through a single typo.
 *
 * High enough to clear CONFIDENCE_FLOOR alone, so a question whose only clue is a
 * misspelled word still gets answered.
 */
const FUZZY_MATCH_SCORE = 8;

/** Score for a whole phrase appearing in the question. */
const PHRASE_MATCH_SCORE = 18;

/** Shortest word worth checking for typos. Below this, edits are just other words. */
const MIN_FUZZY_LENGTH = 5;

/** Below this score, nothing is confidently the answer. */
const CONFIDENCE_FLOOR = 8;

/**
 * Reduces text to comparable lowercase words.
 *
 * @param {string} text Anything the customer typed.
 * @returns {string} Lowercase, punctuation stripped, single spaced.
 */
export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9$\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits normalized text into meaningful words.
 *
 * @param {string} text Normalized text.
 * @returns {string[]} Words worth matching on.
 */
export function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word));
}

/**
 * Reports whether two words are within one edit of each other.
 *
 * Stops at the second difference, since one typo is the only question being asked.
 *
 * @param {string} first One word.
 * @param {string} second The other.
 * @returns {boolean} True when they differ by at most one edit.
 */
export function isWithinOneEdit(first, second) {
  if (first === second) {
    return true;
  }
  const lengthGap = Math.abs(first.length - second.length);
  if (lengthGap > 1) {
    return false;
  }

  const shorter = first.length <= second.length ? first : second;
  const longer = first.length <= second.length ? second : first;

  let shortIndex = 0;
  let longIndex = 0;
  let editsUsed = 0;

  while (shortIndex < shorter.length && longIndex < longer.length) {
    if (shorter[shortIndex] === longer[longIndex]) {
      shortIndex += 1;
      longIndex += 1;
      continue;
    }
    editsUsed += 1;
    if (editsUsed > 1) {
      return false;
    }
    // Same length means a substitution, so step both. Different means the extra
    // letter is in the longer word, so step only that one.
    if (shorter.length === longer.length) {
      shortIndex += 1;
    }
    longIndex += 1;
  }
  return true;
}

/**
 * Scores how well one intent answers a question.
 *
 * A whole phrase counts for more than a single keyword.
 *
 * @param {object} intent An intent from data/assistantKnowledge.js.
 * @param {string} normalizedQuestion The question, normalized.
 * @param {string[]} words The question's meaningful words.
 * @returns {number} A score. Zero means no match at all.
 */
function scoreIntent(intent, normalizedQuestion, words) {
  let score = 0;

  for (const phrase of intent.phrases ?? []) {
    if (normalizedQuestion.includes(phrase)) {
      score += PHRASE_MATCH_SCORE;
    }
  }

  for (const keyword of intent.keywords) {
    if (words.includes(keyword)) {
      score += EXACT_MATCH_SCORE;
      continue;
    }
    if (keyword.length >= MIN_FUZZY_LENGTH) {
      const nearMiss = words.some(
        (word) => word.length >= MIN_FUZZY_LENGTH && isWithinOneEdit(word, keyword)
      );
      if (nearMiss) {
        score += FUZZY_MATCH_SCORE;
      }
    }
  }
  return score;
}

/**
 * Ranks every intent against a question.
 *
 * @param {object[]} intents The knowledge base.
 * @param {string} question Whatever the customer typed.
 * @returns {Array<{intent: object, score: number}>} Every intent that scored above
 *   zero, best first.
 */
function rankIntents(intents, question) {
  const normalized = normalize(question);
  const words = tokenize(question);

  return intents
    .map((intent) => ({ intent, score: scoreIntent(intent, normalized, words) }))
    .filter((ranked) => ranked.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Picks the best answer to a question, or offers the nearest topics instead.
 *
 * @param {object[]} intents The knowledge base.
 * @param {string} question Whatever the customer typed.
 * @returns {{matched: boolean, intent: object|null, suggestions: object[]}} The
 *   winning intent when one was confident, and topics to offer either way.
 */
export function findAnswer(intents, question) {
  if (normalize(question) === '') {
    return { matched: false, intent: null, suggestions: intents.slice(0, 3) };
  }

  const ranked = rankIntents(intents, question);
  const best = ranked[0];

  if (best && best.score >= CONFIDENCE_FLOOR) {
    // A greeting is worth answering but not worth offering: "Hello" as a follow up
    // to a delivery question is a button that goes nowhere useful.
    const followUps = ranked.slice(1).filter((ranking) => ranking.intent.isFollowUp !== false);
    return {
      matched: true,
      intent: best.intent,
      suggestions: followUps.slice(0, 3).map((ranking) => ranking.intent),
    };
  }

  // Nothing was confident. Offer whatever came closest, and if literally nothing
  // scored, offer the topics the assistant handles best. Either way the customer
  // gets somewhere to go next.
  const nearest = ranked.slice(0, 3).map((ranking) => ranking.intent);
  return {
    matched: false,
    intent: null,
    suggestions:
      nearest.length > 0 ? nearest : intents.filter((intent) => intent.isSuggested).slice(0, 3),
  };
}
