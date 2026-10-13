// Finds the component folders and reads what their stylesheets use. Shared by check.ts and
// by the docs site (apps/docs/components-plugin.ts), so the folders stay the single source.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { declarationList, references } from '../tokens/parse.ts';

export const REACT_SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages/react/src');
export const COMPONENTS_DIR = path.join(REACT_SRC, 'components');

/** IconButton → icon-button: a component's stylesheet name and its docs address. */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** The component folders, in name order. None before the first component is promoted. */
export function componentNames(): string[] {
  if (!fs.existsSync(COMPONENTS_DIR)) return [];
  return fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export interface StylesheetTokens {
  /** Tokens from @pastel-studio/tokens that the stylesheet reads, in name order. */
  used: string[];
  /** Tokens the stylesheet declares itself: the component's own knobs, with their defaults. */
  own: { name: string; value: string }[];
}

/** What a component's stylesheet reads from the tokens, and which tokens it adds. */
export function stylesheetTokens(css: string): StylesheetTokens {
  // A token's first declaration is its default; later ones (a variant, a surface) override it.
  const own = new Map<string, string>();
  for (const [name, value] of declarationList(css)) if (!own.has(name)) own.set(name, value);
  return {
    used: [...new Set(references(css))].filter((name) => !own.has(name)).sort(),
    own: [...own].map(([name, value]) => ({ name, value })),
  };
}
