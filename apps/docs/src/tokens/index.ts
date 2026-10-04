import { tokens as data } from 'virtual:ps-tokens';
import type { Token, TokenGroup, TokensData } from './types';

/** Every token, group and contrast result, read from packages/tokens/src at build time. */
export const tokens = data as TokensData;

/** A group of scales.css by the start of its title, e.g. scaleGroup('Type'). */
export function scaleGroup(title: string): TokenGroup {
  const group = tokens.scales.find((g) => g.title.toLowerCase().startsWith(title.toLowerCase()));
  if (!group) throw new Error(`No scales group "${title}" in packages/tokens/src/scales.css`);
  return group;
}

/** The tokens of a group whose name starts with a prefix, e.g. tokensWith(type, '--ps-font-size-'). */
export function tokensWith(group: TokenGroup, prefix: string): Token[] {
  return group.tokens.filter((t) => t.name.startsWith(prefix));
}

const root = scaleGroup('Type').tokens.find((t) => t.name === '--ps-font-size-root');
/** The root font size in px (1rem). */
export const ROOT_PX = parseFloat(root?.value ?? '15');

/** "0.95rem" → 14.25, "12px" → 12. */
export function toPx(value: string): number {
  return value.trim().endsWith('rem') ? parseFloat(value) * ROOT_PX : parseFloat(value);
}

/** Rounds to at most two decimals for display: 14.25, 16.5, 30. */
export const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** A token's note shown on its own (a table cell, a caption): first letter capitalized. */
export const sentence = (text?: string) => (text ? text[0].toUpperCase() + text.slice(1) : '');
