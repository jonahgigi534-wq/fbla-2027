/**
 * Checks the spelling of every word the program puts on screen.
 *
 * "Interface contains no spelling errors" is scored directly on the rating sheet, so
 * this is not a nicety. Reading the screens by eye does not scale to 426 menu items,
 * 15 validation messages, and a help center.
 *
 * It pulls the strings out of the source rather than the rendered page, which means
 * it also covers the text nobody looks at: aria-labels, alt text, placeholders,
 * validation messages that only appear when something goes wrong, and the toast that
 * fires once in fifty runs.
 *
 * The dictionary is committed alongside it. A checker whose word list depends on the
 * machine it runs on is not a check, and half the vocabulary here is proper nouns
 * the restaurant chose.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

/** Everything is resolved from the project root. */
const ROOT = join(import.meta.dirname, '..');

/** Where user-facing strings live. */
const SOURCE_FOLDERS = ['src/js'];

/** Prose folders. Documentation with typos in it costs the same points as the interface. */
const PROSE_FOLDERS = ['docs', 'presentation'];

/** Documents that judges read, so they are checked too. */
const EXTRA_FILES = ['README.md', 'index.html'];

/** Words shorter than this are too generic to be worth flagging. */
const MIN_WORD_LENGTH = 3;

/**
 * Lists every JavaScript file under a folder.
 *
 * @param {string} folder Absolute path to search.
 * @returns {Promise<string[]>} Absolute paths.
 */
async function listJsFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(folder, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listJsFiles(full)));
    } else if (entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Pulls the quoted strings out of a source file.
 *
 * Anything that looks like code rather than prose is dropped: import paths, class
 * names, ids, and single tokens with no spaces. What is left is the text a person
 * would actually read.
 *
 * @param {string} source A JavaScript or HTML file's contents.
 * @returns {string[]} The strings worth checking.
 */
export function extractStrings(source) {
  const found = [];
  for (const match of source.matchAll(/'([^'\n]{4,})'|"([^"\n]{4,})"/g)) {
    const text = match[1] ?? match[2];
    const looksLikeCode =
      // An escape sequence is not prose. Without this, the flatbread emoji in
      // foodPlaceholder.js offers up 'fad' as a word to check.
      text.includes('\\') ||
      text.startsWith('.') ||
      text.startsWith('/') ||
      text.startsWith(':') ||
      text.includes('/') ||
      text.includes('--') ||
      text.includes('===') ||
      text.includes('=>') ||
      text.includes('${') ||
      text.includes('&&') ||
      text.includes('||') ||
      text.includes('(') ||
      /^[a-z0-9-]+$/.test(text) ||
      /^[A-Z0-9_]+$/.test(text) ||
      // A camelCase token with no spaces is an identifier, not a sentence.
      (!text.includes(' ') && /[a-z][A-Z]/.test(text));
    if (!looksLikeCode && /[a-zA-Z]/.test(text)) {
      found.push(text);
    }
  }
  return found;
}

/**
 * Pulls the readable prose out of a markdown document.
 *
 * Fenced code blocks, inline code, link targets, and table pipes are dropped, since
 * none of those are words anyone reads for meaning. What is left is the sentences.
 *
 * @param {string} source A markdown file's contents.
 * @returns {string[]} Lines of prose worth checking.
 */
export function extractProse(source) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, '] ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .split(String.fromCharCode(10))
    .filter((line) => !line.startsWith('    '));
}

/**
 * Splits display text into words to check.
 *
 * Possessives and hyphenated pairs are broken apart so 'restaurant’s' is checked
 * as 'restaurant', and numbers and prices are dropped entirely.
 *
 * @param {string} text A display string.
 * @returns {string[]} Lowercase words worth checking.
 */
export function toCheckableWords(text) {
  return text
    .toLowerCase()
    .replace(/[’']s\b/g, '')
    .split(/[^a-z]+/)
    .filter((word) => word.length >= MIN_WORD_LENGTH);
}

/**
 * Runs the check.
 *
 * @returns {Promise<void>} Exits non zero when an unknown word is found.
 */
async function check() {
  const dictionary = new Set(
    (await readFile(join(ROOT, 'scripts', 'dictionary.txt'), 'utf8'))
      .split('\n')
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0 && !word.startsWith('#'))
  );

  const files = [];
  for (const folder of SOURCE_FOLDERS) {
    files.push(...(await listJsFiles(join(ROOT, folder))));
  }
  for (const folder of PROSE_FOLDERS) {
    const entries = await readdir(join(ROOT, folder), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.endsWith('.md')) {
        files.push(join(ROOT, folder, entry.name));
      }
    }
  }
  for (const extra of EXTRA_FILES) {
    files.push(join(ROOT, extra));
  }

  const unknown = new Map();
  let wordsChecked = 0;

  for (const file of files) {
    let source;
    try {
      source = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    const id = relative(ROOT, file).split(sep).join('/');

    const texts = file.endsWith('.md') ? extractProse(source) : extractStrings(source);
    for (const text of texts) {
      for (const word of toCheckableWords(text)) {
        wordsChecked += 1;
        if (!dictionary.has(word)) {
          if (!unknown.has(word)) {
            unknown.set(word, { count: 0, where: id, sample: text.slice(0, 60) });
          }
          unknown.get(word).count += 1;
        }
      }
    }
  }

  if (unknown.size > 0) {
    console.error(`Spell check failed. ${unknown.size} unknown word(s):\n`);
    for (const [word, detail] of [...unknown].sort()) {
      console.error(`  ${word.padEnd(20)} x${detail.count}  ${detail.where}  "${detail.sample}"`);
    }
    console.error('\nIf a word is correct, add it to scripts/dictionary.txt.');
    process.exit(1);
  }

  console.log(`Spell check passed: ${wordsChecked} words across ${files.length} files, all known.`);
}

check();
