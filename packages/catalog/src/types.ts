// The design system as data: the shapes of 'virtual:ps-tokens' and 'virtual:ps-components' (built by
// the Vite plugins in ./vite from packages/tokens/src and packages/react/src/components), and of a
// component once its meta.ts is joined to it. Shared by the docs and Pastel Studio Pochade.
import type { ComponentMeta } from '@pastel-studio/react';

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

export interface PropDoc {
  name: string;
  /** The type as written, or a union's values: '"primary" | "tonal"'. */
  type: string;
  required: boolean;
  /** The default as text: "md", "false". */
  defaultValue?: string;
  /** The prop's doc comment. */
  description: string;
}

/** One exported component of a folder: most folders have one, a few add parts (Card, CardHeader). */
export interface ExportDoc {
  name: string;
  /** The component's doc comment. */
  description: string;
  /** Its own props, in source order. Attributes inherited from the DOM are left out. */
  props: PropDoc[];
  /** The DOM attributes it also accepts, by their React type: "ButtonHTMLAttributes". */
  htmlAttributes?: string;
}

export interface ComponentData {
  /** The folder and the main component: "IconButton". */
  name: string;
  /** Its address in the docs: "icon-button". */
  slug: string;
  exports: ExportDoc[];
  /** Tokens from @pastel-studio/tokens that its stylesheet reads, in name order. */
  tokens: string[];
  /** Tokens its stylesheet declares: the component's own knobs, with their defaults. */
  ownTokens: { name: string; value: string }[];
}

/** A component as the docs show it: what its code says, plus what its meta.ts says. */
export interface ComponentDoc extends ComponentData {
  meta: ComponentMeta;
}
