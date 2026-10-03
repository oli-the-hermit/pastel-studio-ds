// Checks the token tiers. Run: npm run check:tokens
//   1. Every var(--ps-…) used in any package stylesheet is defined somewhere.
//   2. Every theme in packages/tokens/src/themes defines exactly the same roles as dark.css.
//   3. The reference palette is used only by themes, and every reference color is used.
//   4. Each reference color's name matches its tone (CIELAB L*, rounded): --ps-lime-85 is L* 85.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOKENS = path.join(ROOT, 'packages/tokens/src');
const THEMES = path.join(TOKENS, 'themes');
const REFERENCE = path.join(TOKENS, 'reference.css');

const rel = (file: string) => path.relative(ROOT, file).replaceAll('\\', '/');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function cssFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : cssFiles(full);
    return entry.name.endsWith('.css') ? [full] : [];
  });
}

/** Custom properties declared in a stylesheet, with their values. */
function declarations(css: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of stripComments(css).matchAll(/(--ps-[a-z0-9-]+)\s*:\s*([^;}]+)/g)) out.set(m[1], m[2].trim());
  return out;
}

/** Custom properties referenced through var(). */
function references(css: string): string[] {
  return [...stripComments(css).matchAll(/var\(\s*(--ps-[a-z0-9-]+)/g)].map((m) => m[1]);
}

/** CIELAB L* of a #RRGGBB color. */
function tone(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const y = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

const problems: string[] = [];
const files = cssFiles(path.join(ROOT, 'packages'));
const sources = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));

// 1. Every reference resolves.
const defined = new Set<string>();
for (const css of sources.values()) for (const name of declarations(css).keys()) defined.add(name);
for (const [file, css] of sources) {
  for (const name of new Set(references(css))) {
    if (!defined.has(name)) problems.push(`${rel(file)}: var(${name}) is not defined`);
  }
}

// 2. Theme parity.
const themeFiles = fs.readdirSync(THEMES).filter((f) => f.endsWith('.css')).map((f) => path.join(THEMES, f));
const roles = new Map(themeFiles.map((f) => [f, new Set(declarations(sources.get(f) ?? '').keys())]));
const baseline = roles.get(path.join(THEMES, 'dark.css'));
if (!baseline) problems.push('packages/tokens/src/themes/dark.css is missing');
else {
  for (const [file, set] of roles) {
    for (const name of baseline) if (!set.has(name)) problems.push(`${rel(file)}: missing role ${name}`);
    for (const name of set) if (!baseline.has(name)) problems.push(`${rel(file)}: ${name} is not a role in dark.css`);
  }
}

// 3. The reference palette is used only by themes, and fully.
const palette = declarations(sources.get(REFERENCE) ?? '');
const usedByThemes = new Set(themeFiles.flatMap((f) => references(sources.get(f) ?? '')));
for (const [file, css] of sources) {
  if (themeFiles.includes(file)) continue;
  for (const name of new Set(references(css))) {
    if (palette.has(name)) problems.push(`${rel(file)}: uses reference color ${name}; use a semantic role`);
  }
}
for (const name of palette.keys()) {
  if (!usedByThemes.has(name)) problems.push(`packages/tokens/src/reference.css: ${name} is not used by any theme`);
}

// 4. Names match tones.
for (const [name, value] of palette) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) { problems.push(`reference.css: ${name} must be a #RRGGBB color, got ${value}`); continue; }
  const named = name.match(/-(\d+)$/);
  if (!named) continue;   // --ps-white
  const actual = Math.round(tone(value));
  if (actual !== Number(named[1])) problems.push(`reference.css: ${name} (${value}) has tone ${actual}; rename it to …-${actual}`);
}

if (problems.length) {
  console.error(`Tokens: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Tokens: ${palette.size} reference colors, ${baseline?.size ?? 0} roles × ${themeFiles.length} themes, ${defined.size} tokens defined, ${files.length} stylesheets checked. No problems.`);
