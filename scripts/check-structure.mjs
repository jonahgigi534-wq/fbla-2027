/**
 * Checks that the four layers stay in their lanes and that files stay readable.
 *
 * Two rules, both mechanical so neither depends on anyone remembering them.
 *
 * The first is the direction of dependency. Nothing in domain may import from ui or
 * app. That is the rule that keeps the business logic callable from a test with no
 * browser, and it is the single thing most likely to be broken by accident when a
 * screen needs one more helper.
 *
 * The second is file length. Data files are exempt: a catalog of 426 menu items is
 * long because the menu is long, and splitting it further would not make it easier
 * to read. Everything else has a ceiling.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

/** Everything is resolved from the project root. */
const ROOT = join(import.meta.dirname, '..');

/** Longest a logic or screen file may be before it should be split. */
const MAX_LINES = 400;

/** Folders whose length is set by how much data they hold, not how complex they are. */
const LENGTH_EXEMPT = ['src/js/data/'];

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
 * Turns an absolute path into a project relative id with forward slashes.
 *
 * @param {string} absolutePath Any path under the project.
 * @returns {string} A path such as 'src/js/domain/money.js'.
 */
function toId(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join('/');
}

/**
 * Runs both checks over the source tree.
 *
 * @returns {Promise<void>} Exits non zero when anything is wrong.
 */
async function check() {
  const files = await listJsFiles(join(ROOT, 'src', 'js'));
  const problems = [];

  for (const file of files) {
    const id = toId(file);
    const source = await readFile(file, 'utf8');

    if (id.startsWith('src/js/domain/')) {
      for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
        const specifier = match[1];
        if (specifier.includes('/ui/') || specifier.includes('/app/')) {
          problems.push(
            `${id} imports ${specifier}. Nothing in domain may depend on ui or app, or the logic stops being testable on its own.`
          );
        }
      }
    }

    const lineCount = source.split('\n').length;
    const isExempt = LENGTH_EXEMPT.some((folder) => id.startsWith(folder));
    if (!isExempt && lineCount > MAX_LINES) {
      problems.push(`${id} is ${lineCount} lines, over the ${MAX_LINES} line ceiling. Split it.`);
    }
  }

  if (problems.length > 0) {
    console.error('Structure check failed:\n');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  console.log(
    `Structure check passed: ${files.length} files, layers respected, none over ${MAX_LINES} lines.`
  );
}

check();
