// The shape of 'virtual:ps-tokens' (built by tokens-plugin.ts from packages/tokens/src).

export type ThemeName = 'dark' | 'light';

export interface Token {
  name: string;
  /** Declared value, e.g. "var(--ps-lime-85)" or "0.95rem". */
  value: string;
  comment?: string;
}

export interface TokenGroup<T extends Token = Token> {
  title: string;
  description?: string;
  tokens: T[];
}

/** A semantic role, with its value in each theme. */
export interface RoleToken extends Token {
  /** Declared value in the light theme. */
  lightValue: string;
  /** Final value (hex or raw) in each theme. */
  dark: string;
  light: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
  /** CIELAB L*, rounded. */
  tone: number;
  family: string;
}

export interface ContrastResult {
  theme: ThemeName;
  bg: string;
  ratio: number;
  pass: boolean;
}

export interface ContrastPair {
  fg: string;
  on: string[];
  rule: string;
  min: number;
  use: string;
  exception?: string;
  results: ContrastResult[];
}

export interface TokensData {
  roles: TokenGroup<RoleToken>[];
  palette: PaletteColor[];
  paletteGroups: { title: string; description?: string }[];
  aliases: TokenGroup[];
  scales: TokenGroup[];
  contrast: {
    rules: Record<string, { min: number; label: string; description: string }>;
    surfaces: string[];
    pairs: ContrastPair[];
  };
}
