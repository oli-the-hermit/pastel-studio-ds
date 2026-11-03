// The tokens the pickers offer, read from packages/tokens/src at build time (the docs' tokens-plugin).
import { tokens as data } from 'virtual:ps-tokens';

interface Token {
  name: string;
  value: string;
  comment?: string;
}
interface RoleToken extends Token {
  dark: string;
  light: string;
}
interface TokensData {
  roles: { title: string; tokens: RoleToken[] }[];
  scales: { title: string; tokens: Token[] }[];
}

const tokens = data as TokensData;
const scaleTokens = tokens.scales.flatMap((g) => g.tokens);
const withPrefix = (prefix: string, skip: string[] = []) => scaleTokens.filter((t) => t.name.startsWith(prefix) && !skip.includes(t.name));

export interface ColorGroup {
  title: string;
  tokens: RoleToken[];
}

/** Theme colors, by their group in the theme file. Only plain colors: shadows and mixes are left out. */
export const COLOR_GROUPS: ColorGroup[] = tokens.roles
  .map((g) => ({ title: g.title, tokens: g.tokens.filter((t) => /^#[0-9a-f]{3,8}$/i.test(t.dark)) }))
  .filter((g) => g.tokens.length);

export const COLORS = COLOR_GROUPS.flatMap((g) => g.tokens);
export const colorToken = (name: string) => COLORS.find((t) => t.name === name);

export const SPACE = withPrefix('--ps-space-');
export const RADII = withPrefix('--ps-radius-');
export const FONT_SIZES = withPrefix('--ps-font-size-', ['--ps-font-size-root']);
export const FONT_WEIGHTS = withPrefix('--ps-font-weight-');
export const LEADINGS = withPrefix('--ps-leading-');

/** "--ps-space-16" → "space-16"; the short name the pickers show. */
export const shortName = (name: string) => name.replace(/^--ps-/, '');
