// Serves the token stylesheets to the docs as data: import { tokens } from 'virtual:ps-tokens'.
// Everything comes from packages/tokens/src, so the Foundations pages can never drift from
// the CSS. Editing a token file reloads the docs.
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { contrastRatio, parseTokenGroups, resolveThemes, THEME_NAMES, TOKENS_DIR } from '../../scripts/tokens/parse.ts';
import type { ContrastPair, PaletteColor, RoleToken, TokensData } from './src/tokens/types.ts';

const ID = 'virtual:ps-tokens';
const RESOLVED = `\0${ID}`;

function tone(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const y = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return Math.round(y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y);
}

function build(): TokensData {
  const read = (file: string) => fs.readFileSync(path.join(TOKENS_DIR, file), 'utf8');
  const themes = resolveThemes(TOKENS_DIR);
  const light = new Map(parseTokenGroups(read('themes/light.css')).flatMap((g) => g.tokens.map((t) => [t.name, t.value] as const)));

  const roles = parseTokenGroups(read('themes/dark.css')).map((group) => ({
    ...group,
    tokens: group.tokens.map((t): RoleToken => ({
      ...t,
      lightValue: light.get(t.name) ?? '',
      dark: themes.dark.get(t.name) ?? '',
      light: themes.light.get(t.name) ?? '',
    })),
  }));

  const palette: PaletteColor[] = parseTokenGroups(read('reference.css')).flatMap((group) =>
    group.tokens.map((t) => ({ name: t.name, hex: t.value, tone: tone(t.value), family: group.title.split(':')[0] })));

  const spec = JSON.parse(read('contrast.json'));
  const pairs: ContrastPair[] = spec.pairs.map((p: Omit<ContrastPair, 'results' | 'on'> & { on: string[] | 'surfaces' }) => {
    const on: string[] = p.on === 'surfaces' ? spec.surfaces : p.on;
    const min = spec.rules[p.rule].min;
    return {
      ...p,
      on,
      min,
      results: THEME_NAMES.flatMap((theme) => on.map((bg) => {
        const ratio = contrastRatio(themes[theme].get(p.fg) ?? '#000000', themes[theme].get(bg) ?? '#000000');
        return { theme, bg, ratio: Math.round(ratio * 100) / 100, pass: ratio >= min };
      })),
    };
  });

  return {
    roles,
    palette,
    paletteGroups: parseTokenGroups(read('reference.css')).map(({ title, description }) => ({ title, description })),
    aliases: parseTokenGroups(read('aliases.css')),
    scales: parseTokenGroups(read('scales.css')),
    contrast: { rules: spec.rules, surfaces: spec.surfaces, pairs },
  };
}

export function tokensPlugin(): Plugin {
  return {
    name: 'pastel-studio-tokens',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      for (const entry of fs.readdirSync(TOKENS_DIR, { recursive: true }) as string[]) {
        const file = path.join(TOKENS_DIR, entry);
        if (fs.statSync(file).isFile()) this.addWatchFile(file);
      }
      return `export const tokens = ${JSON.stringify(build())};`;
    },
    configureServer(server) {
      server.watcher.add(TOKENS_DIR);
      server.watcher.on('change', (file) => {
        if (!path.resolve(file).startsWith(TOKENS_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
