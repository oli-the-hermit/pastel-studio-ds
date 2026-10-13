// Reads the token stylesheets into data. Used by check.ts and by the docs site (apps/docs),
// so the CSS files stay the single source of truth: names, values, groups and comments.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOKENS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages/tokens/src');

export interface Token {
  name: string;
  /** The declared value, e.g. "var(--ps-lime-85)" or "14px". */
  value: string;
  /** The trailing comment on the same line, if any. */
  comment?: string;
}

export interface TokenGroup {
  /** From a "── Title ──" comment. */
  title: string;
  /** The rest of that comment, joined into one paragraph. */
  description?: string;
  tokens: Token[];
}

const TOKEN_LINE = /^\s*(--ps-[a-z0-9-]+)\s*:\s*(.+?);\s*(?:\/\*\s*(.*?)\s*\*\/)?\s*$/;
const GROUP_START = /\/\*\s*──\s*(.+?)\s*──\s*(.*)$/;

/** Splits one token stylesheet into its "── Title ──" groups, in file order. */
export function parseTokenGroups(css: string): TokenGroup[] {
  const groups: TokenGroup[] = [];
  const lines = css.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const start = lines[i].match(GROUP_START);
    if (start) {
      // Collect the comment's remaining lines as the description.
      const parts: string[] = [];
      let rest = start[2];
      while (!rest.includes('*/') && i + 1 < lines.length) {
        if (rest.trim()) parts.push(rest.trim());
        rest = lines[++i];
      }
      const last = rest.split('*/')[0].trim();
      if (last) parts.push(last);
      groups.push({ title: start[1], description: parts.join(' ') || undefined, tokens: [] });
      continue;
    }
    const token = lines[i].match(TOKEN_LINE);
    if (token) {
      if (!groups.length) groups.push({ title: '', tokens: [] });
      groups[groups.length - 1].tokens.push({ name: token[1], value: token[2].trim(), comment: token[3] || undefined });
    }
  }
  return groups;
}

/** Every token in one stylesheet, as name → declared value. */
export function tokenMap(css: string): Map<string, string> {
  return new Map(parseTokenGroups(css).flatMap((g) => g.tokens.map((t) => [t.name, t.value] as const)));
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every custom property declaration in a stylesheet, in order: [name, value]. */
export function declarationList(css: string): [string, string][] {
  return [...stripComments(css).matchAll(/(--ps-[a-z0-9-]+)\s*:\s*([^;}]+)/g)].map((m) => [m[1], m[2].trim()]);
}

/** Custom properties declared in any stylesheet, with their values (the last one, if repeated). */
export function declarations(css: string): Map<string, string> {
  return new Map(declarationList(css));
}

/** Custom properties a stylesheet reads through var(), repeats included. */
export function references(css: string): string[] {
  return [...stripComments(css).matchAll(/var\(\s*(--ps-[a-z0-9-]+)/g)].map((m) => m[1]);
}

export const THEME_NAMES = ['dark', 'light'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

/** Each theme's roles resolved to final values (through the reference palette). */
export function resolveThemes(dir = TOKENS_DIR): Record<ThemeName, Map<string, string>> {
  const read = (file: string) => tokenMap(fs.readFileSync(path.join(dir, file), 'utf8'));
  const reference = read('reference.css');
  const out = {} as Record<ThemeName, Map<string, string>>;
  for (const theme of THEME_NAMES) {
    const roles = read(`themes/${theme}.css`);
    const resolve = (value: string, depth = 0): string =>
      value.replace(/var\(\s*(--ps-[a-z0-9-]+)\s*\)/g, (_, name: string) =>
        depth > 8 ? value : resolve(roles.get(name) ?? reference.get(name) ?? `var(${name})`, depth + 1));
    out[theme] = new Map([...roles].map(([name, value]) => [name, resolve(value)]));
  }
  return out;
}

/** WCAG 2.x contrast ratio between two #RRGGBB colors. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const lin = (c: number) => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
