// Writes the design system's data into the Figma plugin (code.js), between its generated markers:
// the reference palette, the dark theme's roles, the app's accent, the scales, the type ramp and
// every icon, read from the code. Run it after a token or icon changes, then run the plugin's
// "Update the tokens from the code" command in Figma.
//
//   node tools/figma-library/generate.ts              (accent: sky, Pastel Studio Pro's)
//   node tools/figma-library/generate.ts --accent=solar-lime
//   node tools/figma-library/generate.ts --check      (fails when code.js is out of date)
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const accentArg = process.argv.find(a => a.startsWith('--accent='));
const ACCENT = accentArg ? accentArg.slice('--accent='.length) : 'sky';
const CHECK = process.argv.includes('--check');

type Rgba = { r: number; g: number; b: number; a: number };
const hex = (h: string): Rgba => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255, a: 1 });
const toHex = (c: Rgba) => '#' + [c.r, c.g, c.b].map(x => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

// ── Primitives: reference.css ────────────────────────────
const primitives: Record<string, string> = {};
for (const m of read('packages/tokens/src/reference.css').matchAll(/--ps-([a-z]+)(?:-(\d+))?:\s*(#[0-9A-Fa-f]{6})/g)) {
  primitives[m[2] ? `${m[1]}/${m[2]}` : m[1]] = m[3].toUpperCase();
}

// ── The app's accent: palette.json, in the order presets.ts lists the tokens ──
const ACCENT_TOKENS = ['accent', 'accent-hover', 'on-accent', 'on-accent-2', 'accent-container', 'on-accent-container', 'accent-text', 'focus-ring'];
const ACCENT_NAMES: Record<string, string> = { accent: 'accent', 'accent-hover': 'accent-hover', 'on-accent': 'on-accent', 'on-accent-2': 'on-accent-2', 'accent-container': 'container', 'on-accent-container': 'on-container', 'accent-text': 'accent-text', 'focus-ring': 'focus-ring' };
const palette = JSON.parse(read('packages/react/src/theme/palette.json'));
if (!palette[ACCENT]) throw new Error(`No accent "${ACCENT}" in palette.json. Known: ${Object.keys(palette).join(', ')}`);
const accentRoles: Record<string, string> = {};   // css role -> primitive name
ACCENT_TOKENS.forEach((token, i) => {
  const value = String(palette[ACCENT].dark[i]).toUpperCase();
  const same = Object.entries(primitives).find(([n, v]) => n.startsWith(`${ACCENT}/`) && v === value);
  const name = same ? same[0] : `${ACCENT}/${ACCENT_NAMES[token]}`;
  primitives[name] = value; accentRoles[token] = name;
});

// ── Colour roles: themes/dark.css and aliases.css ─────────
// The Figma names group the roles; the CSS name rides along as each variable's code syntax.
const ROLE_NAMES: Record<string, string> = {
  bg: 'surface/bg', 'surface-1': 'surface/1', 'surface-2': 'surface/2', 'surface-3': 'surface/3', 'surface-4': 'surface/4',
  'drawer-bg': 'drawer/bg', 'drawer-hover': 'drawer/hover', 'text-1': 'text/1', 'text-2': 'text/2', 'text-3': 'text/3',
  accent: 'accent/accent', 'accent-hover': 'accent/hover', 'on-accent': 'accent/on-accent', 'on-accent-2': 'accent/on-accent-2',
  'accent-container': 'accent/container', 'on-accent-container': 'accent/on-container', 'accent-text': 'accent/text',
  danger: 'status/danger', 'danger-container': 'status/danger-container', 'on-danger': 'status/on-danger',
  warning: 'status/warning', 'warning-container': 'status/warning-container', success: 'status/success', 'success-container': 'status/success-container',
  live: 'status/live', 'on-live': 'status/on-live', 'grid-line': 'structure/grid-line', grip: 'structure/grip', 'focus-ring': 'structure/focus-ring',
  scrim: 'structure/scrim', 'field-bg': 'field/bg', 'field-hover': 'field/hover', 'row-bg': 'row/bg', 'row-hover': 'row/hover',
};
const SCOPES: Record<string, string[]> = {
  surface: ['FRAME_FILL', 'SHAPE_FILL'], drawer: ['FRAME_FILL', 'SHAPE_FILL'], field: ['FRAME_FILL', 'SHAPE_FILL'], row: ['FRAME_FILL', 'SHAPE_FILL'],
  text: ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'],
};
const scopesFor = (name: string, css: string) => {
  if (css === 'focus-ring') return ['STROKE_COLOR'];
  if (css === 'scrim') return ['FRAME_FILL'];
  if (css === 'grid-line') return ['STROKE_COLOR', 'FRAME_FILL', 'SHAPE_FILL'];
  if (/^on-|^accent-text$/.test(css) || css === 'on-accent-2') return ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  if (/container$|hover$|^grip$/.test(css)) return ['FRAME_FILL', 'SHAPE_FILL'];
  return SCOPES[name.split('/')[0]] ?? ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
};
const declarations = (css: string) => Object.fromEntries([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/--ps-([a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const dark = { ...declarations(read('packages/tokens/src/themes/dark.css')), ...declarations(read('packages/tokens/src/aliases.css')) };

// Resolve a role to a colour, for the computed ones
function resolve(css: string): Rgba {
  if (accentRoles[css]) return hex(primitives[accentRoles[css]]);
  const value = dark[css];
  const ref = value?.match(/^var\(--ps-([a-z0-9-]+)\)$/);
  if (ref) { const p = ref[1].replace(/-(\d+)$/, '/$1'); return primitives[p] ? hex(primitives[p]) : resolve(ref[1]); }
  throw new Error(`Can't resolve --ps-${css}`);
}
// color-mix in oklab, the way the browser mixes the row background
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function toOklab({ r, g, b }: Rgba) {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromOklab([L, A, B]: number[]): Rgba {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return { r: gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), g: gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), b: gam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s), a: 1 };
}
const roles: { name: string; css: string; alias?: string; value?: string; alpha?: number; scopes: string[] }[] = [];
for (const [css, name] of Object.entries(ROLE_NAMES)) {
  const scopes = scopesFor(name, css);
  if (accentRoles[css]) { roles.push({ name, css, alias: accentRoles[css], scopes }); continue; }
  const value = dark[css];
  if (!value) throw new Error(`--ps-${css} is not in dark.css or aliases.css`);
  const ref = value.match(/^var\(--ps-([a-z0-9-]+)\)$/);
  const mix = value.match(/^color-mix\(in oklab, var\(--ps-([a-z0-9-]+)\) (\d+)%, var\(--ps-([a-z0-9-]+)\)\)$/);
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+) \/ (\d+)%\)$/);
  if (ref) {
    const prim = ref[1].replace(/-(\d+)$/, '/$1');
    if (primitives[prim] || primitives[ref[1]]) roles.push({ name, css, alias: primitives[prim] ? prim : ref[1], scopes });
    else if (ROLE_NAMES[ref[1]]) roles.push({ name, css, alias: ROLE_NAMES[ref[1]], scopes });
    else throw new Error(`--ps-${css} points at an unknown --ps-${ref[1]}`);
  } else if (mix) {
    const a = toOklab(resolve(mix[1])), b = toOklab(resolve(mix[3])), t = Number(mix[2]) / 100;
    roles.push({ name, css, value: toHex(fromOklab(a.map((x, i) => x * t + b[i] * (1 - t)))), scopes });
  } else if (rgb) {
    roles.push({ name, css, value: toHex({ r: +rgb[1] / 255, g: +rgb[2] / 255, b: +rgb[3] / 255, a: 1 }), alpha: +rgb[4] / 100, scopes });
  } else throw new Error(`Don't know how to carry --ps-${css}: ${value}`);
}

// ── Scales: scales.css ────────────────────────────────────
const scales = declarations(read('packages/tokens/src/scales.css'));
const rootPx = parseFloat(scales['font-size-root']);
const px = (v: string) => (v.endsWith('rem') ? parseFloat(v) * rootPx : v.endsWith('px') ? parseFloat(v) : NaN);
const numbers: { collection: string; name: string; css: string; value: number; scopes: string[] }[] = [];
for (const [css, value] of Object.entries(scales)) {
  const n = px(value);
  if (!Number.isFinite(n)) continue;
  if (css.startsWith('space-')) numbers.push({ collection: 'Spacing', name: `space/${css.slice(6)}`, css, value: n, scopes: ['GAP'] });
  else if (css.startsWith('radius-')) numbers.push({ collection: 'Radius', name: `radius/${css.slice(7)}`, css, value: n, scopes: ['CORNER_RADIUS'] });
  else if (!css.startsWith('font-')) numbers.push({ collection: 'Size', name: `size/${css}`, css, value: n, scopes: ['WIDTH_HEIGHT'] });
}
const fontSizes = Object.fromEntries(Object.entries(scales).filter(([k]) => /^font-size-(?!root)/.test(k)).map(([k, v]) => [k.slice('font-size-'.length), px(v)]));
const TEXT_STYLES = [['xs', 'Medium'], ['xs', 'SemiBold'], ['xs', 'Bold'], ['sm', 'Regular'], ['sm', 'Medium'], ['sm', 'SemiBold'], ['sm', 'Bold'], ['md', 'Regular'], ['md', 'Medium'], ['md', 'SemiBold'], ['md', 'Bold'], ['lg', 'SemiBold'], ['lg', 'Bold'], ['xl', 'SemiBold'], ['xl', 'Bold'], ['2xl', 'Bold'], ['3xl', 'Bold'], ['4xl', 'Bold']];
const textStyles = TEXT_STYLES.map(([size, weight]) => ({ name: `${size}/${weight}`, size: fontSizes[size], weight, lineHeight: ['xl', '2xl', '3xl', '4xl'].includes(size) ? 120 : 140, tracking: ['2xl', '3xl', '4xl'].includes(size) ? -1.5 : 0, css: `--ps-font-size-${size}` }));
if (textStyles.some(s => !s.size)) throw new Error('A font size is missing from scales.css');

// ── Effects: the overlay elevation ────────────────────────
const elev = dark['elev-overlay'];
const shadows = [...(elev ?? '').matchAll(/(-?\d+)(?:px)? (-?\d+)px (\d+)px rgb\(0 0 0 \/ (\d+)%\)/g)].map(m => ({ x: +m[1], y: +m[2], blur: +m[3], alpha: +m[4] / 100 }));

// ── Icons: rendered by React from icons.tsx ───────────────
const tmp = mkdtempSync(join(tmpdir(), 'ps-figma-'));
const entry = join(tmp, 'render.tsx'), out = join(tmp, 'render.cjs');
writeFileSync(entry, `import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as Icons from ${JSON.stringify(join(root, 'packages/react/src/icons/icons.tsx').replace(/\\/g, '/'))};
const out = {};
for (const [name, C] of Object.entries(Icons)) {
  if (!name.startsWith('Icon') || typeof C !== 'function') continue;
  out[name.slice(4)] = renderToStaticMarkup(React.createElement(C, { size: 18 }))
    .replace(/ aria-hidden="true"/, '').replace(/ class=""/, '').replace(/currentColor/g, '#F1F2EC')
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
}
export default out;`);
let icons: Record<string, string>;
try {
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', outfile: out, jsx: 'automatic', logLevel: 'error', nodePaths: [join(root, 'node_modules')] });
  icons = createRequire(import.meta.url)(out).default;
} finally { rmSync(tmp, { recursive: true, force: true }); }

// ── Write ─────────────────────────────────────────────────
const data = { accent: ACCENT, primitives, roles, numbers, textStyles, shadows, icons };
const codePath = join(here, 'code.js');
const code = readFileSync(codePath, 'utf8');
const start = '/* <generated by generate.ts: do not edit> */', end = '/* </generated> */';
const i = code.indexOf(start), j = code.indexOf(end);
if (i < 0 || j < 0) throw new Error('code.js has no generated markers');
const next = code.slice(0, i + start.length) + '\nconst DATA = ' + JSON.stringify(data) + ';\n' + code.slice(j);
if (CHECK) {
  if (next !== code) { console.error('tools/figma-library/code.js is out of date: run node tools/figma-library/generate.ts'); process.exit(1); }
  console.log('Figma plugin data is up to date.');
} else {
  writeFileSync(codePath, next);
  console.log(`Wrote ${Object.keys(primitives).length} primitives, ${roles.length} colour roles (accent ${ACCENT}), ${numbers.length} numbers, ${textStyles.length} text styles, ${shadows.length} shadows, ${Object.keys(icons).length} icons.`);
}
