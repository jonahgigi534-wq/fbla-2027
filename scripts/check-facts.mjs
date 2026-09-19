/**
 * Checks that the figures the documentation quotes are still true.
 *
 * This exists because twice they were not. At one point the repository claimed 225
 * tests in the testing notes, 234 in the rating sheet map, and 237 in the readme,
 * none of which was the real number. A judge reading the fact sheet and then watching
 * `npm run check` print a different figure on screen is a worse outcome than any of
 * the drift itself.
 *
 * Correcting them by hand did not hold either. A later pass found "40 phrasings" in
 * three files for a list holding 32 entries, missed the first time because the hand
 * search had been looking for different words.
 *
 * So the numbers are derived here and compared against every place that states one.
 * Anything cheap to count is counted. The test total is not, because counting it means
 * running the suite, which `npm run check` does immediately before this anyway.
 *
 * Adding a fact means adding one entry to collectFacts below. Each says how to work
 * the number out and which wordings in the documentation are quoting it.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

import { ALL_ITEMS, SECTIONS } from '../src/js/data/menu.js';
import { LOCATIONS } from '../src/js/data/locations.js';

/** Everything is resolved from the project root. */
const ROOT = join(import.meta.dirname, '..');

/** Files whose prose is checked for stale figures. */
const PROSE = ['README.md', 'docs', 'presentation', 'src/js/data/projectFacts.js'];

/**
 * Lists every file under a path, or just the file when it is one.
 *
 * @param {string} target Absolute path to a file or folder.
 * @returns {Promise<string[]>} Absolute paths.
 */
async function listFiles(target) {
  let entries;
  try {
    entries = await readdir(target, { withFileTypes: true });
  } catch {
    return [target];
  }
  const files = [];
  for (const entry of entries) {
    files.push(...(await listFiles(join(target, entry.name))));
  }
  return files;
}

/**
 * Counts the lines in a file, the way anyone checking would count them.
 *
 * The final newline is dropped first. Splitting on it without doing so leaves an
 * empty string on the end and reports one line more than an editor or `wc -l` does,
 * which would make this check fail over a file that is fine.
 *
 * @param {string} relativePath Path from the project root.
 * @returns {Promise<number>} How many lines it has.
 */
async function lineCount(relativePath) {
  const source = await readFile(join(ROOT, relativePath), 'utf8');
  return source.replace(/\n$/, '').split('\n').length;
}

/**
 * Counts the entries in a named array literal inside a file.
 *
 * Entries are counted by their opening bracket at one level of indentation, which is
 * what Prettier guarantees for the arrays this is pointed at.
 *
 * @param {string} relativePath Path from the project root.
 * @param {string} name The array's variable name.
 * @returns {Promise<number>} How many entries it holds.
 */
async function arrayEntryCount(relativePath, name) {
  const source = await readFile(join(ROOT, relativePath), 'utf8');
  const start = source.indexOf(`const ${name} = [`);
  if (start === -1) {
    throw new Error(`check-facts: could not find ${name} in ${relativePath}`);
  }
  const body = source.slice(start, source.indexOf('\n];', start));
  return body.split('\n').filter((line) => /^ {2}\[/.test(line)).length;
}

/**
 * Counts JavaScript modules under src/js.
 *
 * @returns {Promise<number>} How many there are.
 */
async function moduleCount() {
  const files = await listFiles(join(ROOT, 'src', 'js'));
  return files.filter((file) => file.endsWith('.js')).length;
}

/**
 * Counts the function declarations under src/js.
 *
 * Deliberately the same shape check-jsdoc.mjs looks for, so the figure quoted in the
 * documentation is the one that check reports rather than a second opinion.
 *
 * @returns {Promise<number>} How many there are.
 */
async function functionCount() {
  const files = (await listFiles(join(ROOT, 'src', 'js'))).filter((file) => file.endsWith('.js'));
  let total = 0;
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    total += (source.match(/^\s*(?:export\s+)?(?:async\s+)?function\s/gm) ?? []).length;
  }
  return total;
}

/**
 * Every derived figure, and the wordings that quote it.
 *
 * A pattern has one capturing group holding the number. Every match anywhere in the
 * checked prose has to equal the derived value.
 *
 * @returns {Promise<Array<{name: string, value: number, patterns: RegExp[]}>>} The facts.
 */
async function collectFacts() {
  const knowledge = await readFile(join(ROOT, 'src/js/data/assistantKnowledge.js'), 'utf8');

  return [
    {
      name: 'menu items',
      value: ALL_ITEMS.length,
      patterns: [/(\d[\d,]*) (?:real )?menu items/gi, /menu of ([\d,]+) items/gi],
    },
    {
      name: 'menu categories',
      value: SECTIONS.flatMap((section) => section.categories).length,
      patterns: [/across (\d+) categories/gi],
    },
    {
      name: 'restaurants',
      value: LOCATIONS.length,
      patterns: [/(\d+) locations across Houston/gi],
    },
    {
      name: 'JavaScript modules',
      value: await moduleCount(),
      patterns: [/JavaScript modules\s*\|\s*(\d+)/gi],
    },
    {
      name: 'documented functions',
      value: await functionCount(),
      patterns: [
        /(\d+) of \d+,?\s*\n?\s*checked by/gi,
        /Functions documented\s*\|\s*(\d+) of \d+/gi,
        /Functions, all documented\s*\|\s*(\d+)/gi,
      ],
    },
    {
      name: 'lines in ui/dom.js',
      value: await lineCount('src/js/ui/dom.js'),
      patterns: [/ui\/dom\.js`?, (\d+) lines/gi],
    },
    {
      name: 'assistant phrasings pinned in the tests',
      value: await arrayEntryCount('test/assistant.test.js', 'PHRASINGS'),
      patterns: [/(\d+) phrasings and/gi, /(\d+) real phrasings/gi],
    },
    {
      name: 'assistant misspellings pinned in the tests',
      value: await arrayEntryCount('test/assistant.test.js', 'MISSPELLINGS'),
      patterns: [/and (\d+) misspellings/gi, /(\d+) of them misspelled/gi],
    },
    {
      name: 'assistant intents',
      value: knowledge.split('\n  {').length - 1,
      patterns: [/knowledge base of (\d+) intents/gi],
    },
    {
      name: 'items sold out',
      value: ALL_ITEMS.filter((item) => item.stock === 0).length,
      patterns: [/(\d+) items are (?:genuinely )?sold out/gi],
    },
  ];
}

/**
 * Reads every file whose prose is checked.
 *
 * @returns {Promise<Array<{id: string, text: string}>>} Path and contents.
 */
async function readProse() {
  const documents = [];
  for (const entry of PROSE) {
    for (const file of await listFiles(join(ROOT, entry))) {
      if (!file.endsWith('.md') && !file.endsWith('.js')) {
        continue;
      }
      documents.push({
        id: relative(ROOT, file).split(sep).join('/'),
        text: await readFile(file, 'utf8'),
      });
    }
  }
  return documents;
}

/**
 * Compares every quoted figure against the derived one.
 *
 * @returns {Promise<void>} Exits non zero when any of them disagree.
 */
async function check() {
  const facts = await collectFacts();
  const documents = await readProse();
  const problems = [];
  let checked = 0;

  for (const fact of facts) {
    for (const pattern of fact.patterns) {
      for (const document of documents) {
        for (const match of document.text.matchAll(pattern)) {
          if (match[1] === undefined) {
            continue;
          }
          checked += 1;
          if (Number(match[1].replace(/,/g, '')) !== fact.value) {
            problems.push(
              `${document.id} says "${match[0].trim()}", but there are ${fact.value} ${fact.name}.`
            );
          }
        }
      }
    }
  }

  if (problems.length > 0) {
    console.error('Fact check failed. The documentation quotes figures that are not true:\n');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    console.error('\nCorrect the prose, or the fact in scripts/check-facts.mjs if it moved.');
    process.exit(1);
  }

  console.log(
    `Fact check passed: ${checked} quoted figures across ${documents.length} files, all matching the code.`
  );
}

check();
