// Generates packages/react/src/theme/palette.json from the presets and the theme tokens, after
// checking every contrast rule. Run: npm run accents
// Pass --report to also print each preset's colors, or --check to fail when the file is stale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveThemes } from '../tokens/parse.ts';
import { OPTIONS, render } from './options.ts';
import { auditPalette, buildPalette } from './palette.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'packages/react/src/theme/palette.json');

const themes = resolveThemes();
const palette = buildPalette(themes, OPTIONS);
const problems = auditPalette(palette, themes, OPTIONS);
if (problems.length) {
  console.error(`Accent palette: ${problems.length} contrast problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

if (process.argv.includes('--report')) {
  for (const [id, e] of Object.entries(palette)) {
    console.log(`${id.padEnd(18)} dark ${e.dark.join(' ')}  light ${e.light.join(' ')}`);
  }
}

if (process.argv.includes('--check')) {
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') !== render(palette)) {
    console.error('Accent palette is out of date: run npm run accents');
    process.exit(1);
  }
  console.log(`Accent palette: ${Object.keys(palette).length} presets, up to date, every contrast rule passes.`);
} else {
  fs.writeFileSync(OUT, render(palette));
  console.log(`Accent palette: ${Object.keys(palette).length} presets written to packages/react/src/theme/palette.json`);
}
