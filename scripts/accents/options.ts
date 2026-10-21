// The library's own palette options, shared by the generator and its tests.
import { ACCENT_PRESETS, ACCENT_TOKENS, BASE_ACCENT } from '../../packages/react/src/theme/presets.ts';
import type { PaletteOptions } from './palette.ts';

/** The eight accent roles, no partner set: the library has no partner color of its own. */
export const OPTIONS: PaletteOptions = {
  presets: ACCENT_PRESETS,
  baseAccent: BASE_ACCENT,
  accentTokens: ACCENT_TOKENS,
  surfaces: ['--ps-bg', '--ps-surface-1', '--ps-surface-2', '--ps-surface-3'],
};

/** The file's exact text, so a stale palette can be told from a current one. */
export const render = (palette: object) => `${JSON.stringify(palette, null, 1)}\n`;
