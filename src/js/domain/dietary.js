/**
 * Reads allergens and dietary tags out of an item's own words.
 */

/**
 * Splits text into lowercase words, dropping punctuation.
 *
 * Whole words only, so "graham" is never read as "ham".
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
 * Meat in the description removes the vegetarian tag, because a wrong vegetarian badge
 * is the mistake that matters. The one exception is a word that also names a meatless
 * dish, such as wings on cauliflower wings or hash on hash browns. There a vegetarian
 * tag set by hand wins, since the person who tagged the item knows which it is.
 *
 * @param {string[]} words Output of toWords for the item's name plus description.
 * @param {string[]} explicitTags Tags set by hand in the catalog file.
 * @param {string[]} meatKeywords Words that mean the item is not vegetarian.
 * @param {string[]} [meatlessUses] Meat words that a hand set vegetarian tag overrules.
 * @returns {string[]} Dietary tags, sorted and free of duplicates.
 */
export function buildDietaryTags(words, explicitTags, meatKeywords, meatlessUses = []) {
  const tags = new Set(explicitTags);
  const isTaggedVegetarian = tags.has('vegetarian') || tags.has('vegan');
  const clearMeatWords = isTaggedVegetarian
    ? meatKeywords.filter((keyword) => !meatlessUses.includes(keyword))
    : meatKeywords;
  if (containsMeat(words, clearMeatWords)) {
    tags.delete('vegetarian');
    tags.delete('vegan');
  }
  if (tags.has('vegan')) {
    tags.add('vegetarian');
  }
  return [...tags].sort();
}
