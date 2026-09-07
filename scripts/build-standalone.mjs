/**
 * Builds dist/standalone.html: the whole program in one file, no server needed.
 *
 * This is the copy that gets presented. The competition provides no electricity and
 * warns that the venue wifi may not work, so the demonstration cannot depend on a
 * dev server, an internet connection, or anything being installed. Opening this file
 * by double clicking it has to work on a laptop that has been in a bag all morning.
 *
 * The problem it solves is narrow. Browsers refuse ES module imports on a page opened
 * from a file:// address, so the source, which is split across fifty modules on
 * purpose, cannot run that way as it stands. This script inlines those modules into
 * one script while keeping them in separate scopes.
 *
 * Images stay as separate files next to the HTML. Unlike modules, images load fine
 * from file://, and inlining four megabytes of photographs as base64 would triple
 * the file size for no gain.
 *
 * What the build guarantees, and checks before writing:
 *   - no surviving import statements, which would fail on file://
 *   - no fetch calls, which would fail the same way
 *   - no http or https URL anywhere, so nothing can hang waiting for a network
 */

import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

/** Everything is resolved relative to the project root. */
const ROOT = resolve(import.meta.dirname, '..');

/** Where the finished file goes. */
const OUTPUT = join(ROOT, 'dist', 'standalone.html');

/** The module every other module is reached from. */
const ENTRY = join(ROOT, 'src', 'js', 'main.js');

/** Matches a static import of named bindings. */
const IMPORT_PATTERN = /^import\s+\{([^}]+)\}\s+from\s+'([^']+)';?\s*$/gm;

/** Matches an export on a declaration. */
const EXPORT_DECLARATION = /^export\s+(async\s+)?(function|const|let|class)\s+([A-Za-z0-9_$]+)/gm;

/**
 * Turns an absolute path into the short id used in the bundle.
 *
 * @param {string} absolutePath Path to a module.
 * @returns {string} A project relative id such as 'src/js/domain/money.js'.
 */
function moduleId(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join('/');
}

/**
 * Rewrites one module so it can live in the bundle.
 *
 * Imports become lookups in the registry and exports become assignments onto an
 * exports object. Each module keeps its own scope, which matters because several of
 * them independently define helpers with the same names: two modules export
 * normalize, two export describeStatus, and several declare a local fail. Flattening
 * them into one scope would silently pick a winner.
 *
 * @param {string} source The module's source.
 * @param {string} absolutePath Where it came from, for resolving its imports.
 * @returns {{code: string, dependencies: string[]}} The rewritten source and what it needs.
 */
function transformModule(source, absolutePath) {
  const dependencies = [];
  const folder = dirname(absolutePath);

  const withImports = source.replace(IMPORT_PATTERN, (whole, bindings, specifier) => {
    const dependencyPath = resolve(folder, specifier);
    const id = moduleId(dependencyPath);
    dependencies.push(dependencyPath);
    return `const {${bindings}} = __require(${JSON.stringify(id)});`;
  });

  const exported = [];
  for (const match of withImports.matchAll(EXPORT_DECLARATION)) {
    exported.push(match[3]);
  }

  const withoutExportKeyword = withImports.replace(/^export\s+/gm, '');
  const exportBlock =
    exported.length > 0
      ? `\n\nObject.assign(__exports, { ${exported.join(', ')} });\n`
      : '\n';

  return { code: withoutExportKeyword + exportBlock, dependencies };
}

/**
 * Walks the import graph from the entry module and collects every file it reaches.
 *
 * @param {string} entryPath Where to start.
 * @returns {Promise<Map<string, string>>} Module id to rewritten source, in the order
 *   they were discovered.
 */
async function collectModules(entryPath) {
  const modules = new Map();
  const queue = [entryPath];

  while (queue.length > 0) {
    const current = queue.shift();
    const id = moduleId(current);
    if (modules.has(id)) {
      continue;
    }
    const source = await readFile(current, 'utf8');
    const { code, dependencies } = transformModule(source, current);
    modules.set(id, code);
    queue.push(...dependencies);
  }
  return modules;
}

/**
 * Wraps the collected modules in a registry and starts the entry module.
 *
 * Each module keeps a banner naming the file it came from. Someone reading the built
 * file should still be able to see that the program is fifty separate modules rather
 * than one long script, because that structure is the point.
 *
 * @param {Map<string, string>} modules Module id to rewritten source.
 * @param {string} entryId The module to run.
 * @returns {string} The bundled script.
 */
function buildScript(modules, entryId) {
  const registered = [...modules.entries()]
    .map(([id, code]) => {
      const banner = `/* ${'='.repeat(12)} ${id} ${'='.repeat(12)} */`;
      return `__modules[${JSON.stringify(id)}] = function (__exports, __require) {\n${banner}\n${code}};`;
    })
    .join('\n\n');

  return `(function () {
'use strict';

// Each module is registered as a function so it keeps its own scope. Several modules
// independently define helpers with the same names, and one shared scope would let
// them overwrite each other.
const __modules = {};
const __cache = {};

function __require(id) {
  if (__cache[id]) {
    return __cache[id];
  }
  const factory = __modules[id];
  if (!factory) {
    throw new Error('Module not found in bundle: ' + id);
  }
  const exports = {};
  // Cached before running so a circular import gets the partly filled object
  // rather than looping forever.
  __cache[id] = exports;
  factory(exports, __require);
  return exports;
}

${registered}

__require(${JSON.stringify(entryId)});
})();`;
}

/**
 * Refuses to write a build that cannot work offline.
 *
 * These three are not style preferences. An import or a fetch fails outright on a
 * file:// page, and a remote URL makes the page hang waiting for a network that will
 * not be there. Better to fail here than in front of judges.
 *
 * @param {string} html The finished document.
 * @returns {string[]} Everything wrong with it.
 */
function findOfflineProblems(html) {
  const problems = [];

  const leftoverImports = html.match(/^\s*import\s+.*from\s+'/gm);
  if (leftoverImports) {
    problems.push(`${leftoverImports.length} import statement(s) survived bundling`);
  }
  if (/\bfetch\s*\(/.test(html)) {
    problems.push('a fetch call survived, which fails on a file:// page');
  }
  const remote = html.match(/https?:\/\/[^\s"'<>)]+/g);
  if (remote) {
    const unique = [...new Set(remote)].filter((url) => !url.startsWith('http://www.w3.org/'));
    if (unique.length > 0) {
      problems.push(`remote URL(s) found: ${unique.slice(0, 3).join(', ')}`);
    }
  }
  return problems;
}

/**
 * Builds the file.
 *
 * @returns {Promise<void>} Resolves once dist/standalone.html is written.
 */
async function build() {
  const html = await readFile(join(ROOT, 'index.html'), 'utf8');

  // Inline every stylesheet the page links to, in the order it links to them.
  const stylesheetPaths = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
    (match) => match[1]
  );
  const styles = [];
  for (const path of stylesheetPaths) {
    const css = await readFile(join(ROOT, path), 'utf8');
    styles.push(`/* ${path} */\n${css}`);
  }

  const modules = await collectModules(ENTRY);
  const script = buildScript(modules, moduleId(ENTRY));

  const built = html
    .replace(/\s*<link rel="stylesheet"[^>]*>/g, '')
    .replace(
      '</head>',
      `  <style>\n${styles.join('\n')}\n  </style>\n  </head>`
    )
    .replace(
      /<script type="module" src="[^"]+"><\/script>/,
      `<script>\n${script}\n</script>`
    )
    .replace(
      '<title>House of Pies Ordering</title>',
      '<title>House of Pies Ordering (offline build)</title>'
    );

  const problems = findOfflineProblems(built);
  if (problems.length > 0) {
    console.error('Build refused. This file would not work offline:');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, built, 'utf8');

  // Photographs travel beside the file rather than inside it. Images load fine from
  // a file:// page, unlike modules, and inlining four megabytes of them as base64
  // would triple the size of the document for nothing. The dist folder is what gets
  // copied onto the presenting laptop, so the pictures have to be in it.
  await cp(join(ROOT, 'assets'), join(ROOT, 'dist', 'assets'), { recursive: true });

  const sizeKb = Math.round(Buffer.byteLength(built, 'utf8') / 1024);
  console.log(`Built dist/standalone.html`);
  console.log(`  ${modules.size} modules, ${stylesheetPaths.length} stylesheets, ${sizeKb} KB`);
  console.log(`  no imports, no fetch, no remote URLs`);
  console.log(`  images load from assets/img next to the file, so keep them together`);
}

build();
