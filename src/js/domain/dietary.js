/**
 * Reads allergens and dietary tags out of an item's own words.
 *
 * Pure functions. No DOM, no storage, no imports at all, which is what lets
 * test/dietary.test.js exercise every rule directly.
 *
 * Called once per item by data/menu.js while the catalog is being assembled, so the
 * cost is paid at startup and every screen afterwards reads a plain array.
 */

/**
 * Splits text into lowercase words, dropping punctuation.
 *
 * Matching whole words rather than substrings matters here: a substring search for
 * "ham" would flag every item containing the word "graham".
 *
 * @param {string} text Any item name or description.
 * @returns {string[]} Lowercase words with punctuation removed.
 */
export function toWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Finds which allergens an item's words imply.
 *
 * @param {string[]} words Output of toWords for the item's name plus description.
 * @param {Object<string, string[]>} allergenKeywords Allergen name to trigger words.
 * @returns {string[]} Allergen names, sorted so two items with the same allergens
 *   always produce the same list.
 */
export function detectAllergens(words, allergenKeywords) {
  const found = [];
  for (const [allergen, triggers] of Object.entries(allergenKeywords)) {
    const isPresent = triggers.some((trigger) => words.includes(trigger));
    if (isPresent) {
      found.push(allergen);
    }
  }
  return found.sort();
}

/**
 * Decides whether an item's words mention meat or seafood.
 *
 * @param {string[]} words Output of toWords for the item's name plus description.
 * @param {string[]} meatKeywords Words that mean the item is not vegetarian.
 * @returns {boolean} True when at least one meat word appears.
 */
export function containsMeat(words, meatKeywords) {
  return meatKeywords.some((keyword) => words.includes(keyword));
}

/**
 * Builds the final dietary tag list for one item.
 *
 * A tag written in the catalog file always wins unless the description mentions
 * meat, because a wrong vegetarian badge is the one error here that actually
 * matters to a customer.
 *
 * @param {string[]} words Output of toWords for the item's name plus description.
 * @param {string[]} explicitTags Tags set by hand in the catalog file.
 * @param {string[]} meatKeywords Words that mean the item is not vegetarian.
 * @returns {string[]} Dietary tags, sorted and free of duplicates.
 */
export function buildDietaryTags(words, explicitTags, meatKeywords) {
  const tags = new Set(explicitTags);
  if (containsMeat(words, meatKeywords)) {
    tags.delete('vegetarian');
    tags.delete('vegan');
  }
  if (tags.has('vegan')) {
    tags.add('vegetarian');
  }
  return [...tags].sort();
}
