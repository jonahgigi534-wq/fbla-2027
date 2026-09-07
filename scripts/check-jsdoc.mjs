/**
 * Checks that every exported function carries a documentation block.
 *
 * The rating sheet scores comments that are logical, useful, and complete. Complete
 * is the word that is hard to argue about, so this turns it into a number rather
 * than an opinion: if a function is part of a module's public surface, the next
 * person to call it can read what it takes and what it gives back.
 *
 * It checks that a block exists and describes the parameters, not that the prose is
 * any good. No script can judge that. What it does catch is the function added in a
 * hurry with nothing above it, which is the one that actually happens.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

/** Everything is resolved from the project root. */
const ROOT = join(import.meta.dirname, '..');

/** Folders to check. Data files export arrays, not behavior worth documenting per entry. */
const FOLDERS = ['src/js/domain', 'src/js/app', 'src/js/ui'];

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
 * Finds exported functions in a file that have no documentation block above them.
 *
 * @param {string} source The file's source.
 * @returns {Array<{name: string, line: number, reason: string}>} What is missing.
 */
export function findUndocumented(source) {
  const lines = source.split('\n');
  const missing = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(
      /^export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)/
    );
    if (!match) {
      continue;
    }
    const [, name, parameters] = match;

    // Walk back to find the comment block that should sit above it.
    let cursor = index - 1;
    while (cursor >= 0 && lines[cursor].trim() === '') {
      cursor -= 1;
    }
    if (cursor < 0 || lines[cursor].trim() !== '*/') {
      missing.push({ name, line: index + 1, reason: 'has no documentation block' });
      continue;
    }

    let start = cursor;
    while (start >= 0 && !lines[start].trim().startsWith('/**')) {
      start -= 1;
    }
    const block = lines.slice(start, cursor + 1).join('\n');

    const declared = parameters
      .split(',')
      .map((parameter) => parameter.trim().split(/[=\s]/)[0].replace(/[{}]/g, ''))
      .filter((parameter) => parameter.length > 0);

    if (declared.length > 0 && !block.includes('@param')) {
      missing.push({ name, line: index + 1, reason: 'takes arguments but documents no @param' });
    }
    if (!block.includes('@returns')) {
      missing.push({ name, line: index + 1, reason: 'documents no @returns' });
    }
  }
  return missing;
}

/**
 * Runs the check across the source tree.
 *
 * @returns {Promise<void>} Exits non zero when anything is undocumented.
 */
async function check() {
  const problems = [];
  let functionsChecked = 0;

  for (const folder of FOLDERS) {
    const files = await listJsFiles(join(ROOT, folder));
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const id = relative(ROOT, file).split(sep).join('/');
      functionsChecked += (source.match(/^export\s+(?:async\s+)?function\s/gm) ?? []).length;
      for (const problem of findUndocumented(source)) {
        problems.push(`${id}:${problem.line}  ${problem.name} ${problem.reason}`);
      }
    }
  }

  if (problems.length > 0) {
    console.error(
      `Documentation check failed. ${problems.length} exported function(s) need work:\n`
    );
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  console.log(
    `Documentation check passed: ${functionsChecked} exported functions, all documented.`
  );
}

check();
