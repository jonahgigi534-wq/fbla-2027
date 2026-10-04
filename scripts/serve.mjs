/**
 * Development static file server.
 *
 * Module imports are blocked on file:// pages, so development runs over localhost.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number(process.env.PORT) || 4173;
const PROJECT_ROOT = resolve(import.meta.dirname, '..');

/** Maps a file extension to the Content-Type header the browser needs to see. */
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/**
 * Turns a request URL into an absolute path inside the project directory.
 * Returns null when the path escapes the project root, which blocks `../` traversal.
 *
 * @param {string} requestUrl Raw url from the incoming request.
 * @returns {string|null} Absolute file path, or null if the request is unsafe.
 */
function resolveRequestPath(requestUrl) {
  const withoutQuery = decodeURIComponent(requestUrl.split('?')[0]);
  const relativePath = withoutQuery === '/' ? '/index.html' : withoutQuery;
  const absolutePath = normalize(join(PROJECT_ROOT, relativePath));
  return absolutePath.startsWith(PROJECT_ROOT) ? absolutePath : null;
}

const server = createServer(async (request, response) => {
  const filePath = resolveRequestPath(request.url);

  if (filePath === null) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    response.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`House of Pies ordering system running at http://localhost:${PORT}`);
});
