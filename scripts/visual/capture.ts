/**
 * Visual capture of the documentation site.
 *
 * Starts the docs (Vite), drives the installed Chrome through every page in the navigation
 * with reduced motion, and writes one full-page PNG per page and theme. Component pages are in
 * the navigation, so every state and variant gallery is captured with them. Compare two runs
 * with `npm run visual:diff`.
 *
 *   npm run visual:capture                 → documentation/visual/current
 *   npm run visual:capture -- --out <dir>  → any folder (e.g. the baseline)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOCS = path.join(ROOT, 'apps/docs');
const PORT = 5311;
const BASE = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1440, height: 900 };
const THEMES = ['dark', 'light'] as const;

const outArg = process.argv.indexOf('--out');
const OUT_DIR = path.resolve(ROOT, outArg > -1 ? process.argv[outArg + 1] : 'documentation/visual/current');

/** "/" → "overview", "/components/icon-button" → "components-icon-button". */
const fileName = (route: string) => route.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'overview';

async function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const vite = await createServer({ root: DOCS, logLevel: 'error', server: { port: PORT, strictPort: true, open: false } });
  await vite.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures: string[] = [];
  let count = 0;

  try {
    for (const theme of THEMES) {
      const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      context.setDefaultTimeout(5000);
      // The docs remember their theme per browser; start each run from a known choice.
      await context.addInitScript((choice) => {
        window.localStorage.setItem('ps-docs-theme', choice);
        window.localStorage.setItem('ps-docs-compare', 'false');
      }, theme);
      const page = await context.newPage();

      // The first load waits for Vite to transform the site, which can take a while after edits.
      await page.goto(BASE, { timeout: 60_000 });
      await page.locator('.docs-nav-link').first().waitFor({ timeout: 60_000 });
      const routes = await page.locator('.docs-nav-link').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));

      for (const route of routes) {
        const name = fileName(route);
        try {
          await page.goto(BASE + route);
          await page.locator('.docs-page-title').waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(300);
          const dir = path.join(OUT_DIR, theme);
          fs.mkdirSync(dir, { recursive: true });
          // Looping animations (a pulse that runs even with reduced motion) are stopped, so every run matches.
          await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true, animations: 'disabled' });
          count++;
        } catch (err) {
          failures.push(`${theme}/${name}: ${(err as Error).message.split('\n')[0]}`);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await vite.close();
  }

  console.log(`Captured ${count} views (${THEMES.join(', ')}) into ${path.relative(ROOT, OUT_DIR)}.`);
  if (failures.length) {
    console.error(`${failures.length} view(s) failed:\n  ${failures.join('\n  ')}`);
    process.exitCode = 1;
  }
}

await main();
