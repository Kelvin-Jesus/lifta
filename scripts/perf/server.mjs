import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.gif': 'image/gif',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg']);

/**
 * Serves the production build the way a real host would: gzip for text
 * assets, SPA fallback to index.html. Transfer sizes measured against this
 * server therefore match what a phone downloads.
 */
export const startStaticServer = async (root, port = 4173) => {
  if (!existsSync(path.join(root, 'index.html'))) {
    throw new Error(`No production build at ${root}. Run \`pnpm build\` first.`);
  }

  const cache = new Map();

  const load = async (filePath) => {
    if (cache.has(filePath)) return cache.get(filePath);
    const ext = path.extname(filePath);
    const raw = await readFile(filePath);
    const entry = {
      raw,
      gzipped: COMPRESSIBLE.has(ext) ? await gzip(raw, { level: 9 }) : null,
      type: MIME[ext] ?? 'application/octet-stream',
    };
    cache.set(filePath, entry);
    return entry;
  };

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const decoded = decodeURIComponent(url.pathname);
      let filePath = path.join(root, decoded);
      if (!filePath.startsWith(root)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      if (!existsSync(filePath) || decoded.endsWith('/')) {
        filePath = path.join(root, 'index.html');
      }

      const entry = await load(filePath);
      const acceptsGzip = (req.headers['accept-encoding'] ?? '').includes('gzip');
      const body = entry.gzipped && acceptsGzip ? entry.gzipped : entry.raw;
      const headers = {
        'content-type': entry.type,
        'content-length': String(body.length),
        'cache-control': filePath.includes(`${path.sep}assets${path.sep}`)
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      };
      if (entry.gzipped && acceptsGzip) headers['content-encoding'] = 'gzip';
      res.writeHead(200, headers).end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      res.writeHead(500).end(String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
};
