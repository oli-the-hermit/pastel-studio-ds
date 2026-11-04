// The file access the desktop app gets from Rust (src-tauri/src/main.rs), for the canvas in a
// browser during development: a few endpoints under /__canvas/, limited to the projects folder.
// Paths are absolute, as in the desktop app; anything outside the folder is refused.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

/** Where projects live: CANVAS_ROOT, or "Pastel Canvas" in the Documents folder. */
export const PROJECTS_ROOT = path.resolve(process.env.CANVAS_ROOT ?? path.join(os.homedir(), 'Documents', 'Pastel Canvas'));

function inside(p: string): string {
  const full = path.resolve(p);
  const rel = path.relative(PROJECTS_ROOT, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Outside the projects folder: ${p}`);
  return full;
}

const body = (req: IncomingMessage) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

function json(res: ServerResponse, value: unknown) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(value));
}

export function fsPlugin(): Plugin {
  return {
    name: 'pastel-canvas-fs',
    configureServer(server) {
      fs.mkdirSync(PROJECTS_ROOT, { recursive: true });
      server.middlewares.use('/__canvas/', async (req, res) => {
        try {
          const url = new URL(req.url ?? '', 'http://x');
          const op = url.pathname.replace(/^\//, '');
          const p = url.searchParams.get('path') ?? '';
          if (op === 'root') return json(res, PROJECTS_ROOT);
          const full = inside(p);
          if (op === 'list') {
            if (!fs.existsSync(full)) return json(res, []);
            return json(res, fs.readdirSync(full, { withFileTypes: true }).map((e) => ({ name: e.name, dir: e.isDirectory() })));
          }
          if (op === 'exists') return json(res, fs.existsSync(full));
          if (op === 'read') {
            if (!fs.existsSync(full)) { res.statusCode = 404; return res.end(); }
            return res.end(fs.readFileSync(full));
          }
          if (op === 'write' && req.method === 'POST') {
            fs.mkdirSync(path.dirname(full), { recursive: true });
            fs.writeFileSync(full, await body(req));
            return json(res, true);
          }
          if (op === 'mkdir' && req.method === 'POST') {
            fs.mkdirSync(full, { recursive: true });
            return json(res, true);
          }
          if (op === 'remove' && req.method === 'POST') {
            fs.rmSync(full, { force: true });
            return json(res, true);
          }
          res.statusCode = 404;
          res.end();
        } catch (e) {
          res.statusCode = 400;
          res.end(String(e instanceof Error ? e.message : e));
        }
      });
    },
  };
}
