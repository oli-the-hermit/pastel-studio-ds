// Builds the whole-file plugin (code.js): one script that makes a three-page Figma file.
//   Library  the foundations and the components (tools/figma-library/code.js)
//   Blocks   the big pieces made of them, and each app's own components
//   Mockups  each app's screens, from the app's own repo (tools/figma-screens/screens.js there)
// Run: node tools/figma-file/build.mjs [--pro=<folder>] [--media=<folder>] [--espresso=<folder>] [--apps=pro,media] [--out=<file>]
// An app is looked for beside this repo when its folder isn't given; one that isn't found is left
// out, and its menu command says so.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ds = resolve(here, '..', '..');
const beside = resolve(ds, '..');
const APPS = [
  { key: 'pro', name: 'Pastel Studio Pro', folders: ['pastel-studio-pro-figma', 'pastel-studio-pro'] },
  { key: 'media', name: 'Pastel Media Pro', folders: ['pastel-media-pro'] },
  { key: 'espresso', name: 'Pastel Espresso', folders: ['time-tracker-figma', 'time-tracker'] },
];
const read = f => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
const given = key => { const a = process.argv.find(x => x.startsWith(`--${key}=`)); return a ? resolve(a.slice(key.length + 3)) : null; };

// The library, without its own run at the end: the runner below calls its main()
const library = read(join(ds, 'tools', 'figma-library', 'code.js'));
const runAt = library.indexOf('/* <run> */'), runEnd = library.indexOf('/* </run> */');
if (runAt < 0 || runEnd < 0) throw new Error('tools/figma-library/code.js has no /* <run> */ … /* </run> */ block');
const kit = read(join(ds, 'tools', 'figma-library', 'screens-kit.js'));

// --apps=pro,media builds with only those apps; --out=<file> writes somewhere else (for a trial build)
const onlyApps = (process.argv.find(x => x.startsWith('--apps=')) || '').slice(7).split(',').filter(Boolean);
const outArg = process.argv.find(x => x.startsWith('--out='));
const outFile = outArg ? resolve(outArg.slice(6)) : join(here, 'code.js');
const parts = [], found = [];
for (const app of APPS) {
  if (onlyApps.length && !onlyApps.includes(app.key)) { parts.push(`const app_${app.key} = null;`); continue; }
  const candidates = given(app.key) ? [given(app.key)] : app.folders.map(f => join(beside, f));
  const dir = candidates.find(c => existsSync(join(c, 'tools', 'figma-screens', 'screens.js')));
  if (!dir) { console.warn(`  ${app.name}: no tools/figma-screens/screens.js in ${candidates.join(' or ')} — left out`); parts.push(`const app_${app.key} = null;`); continue; }
  const tool = join(dir, 'tools', 'figma-screens');
  // The app's colours come from its own build, so they are worked out in one place
  const consts = execFileSync(process.execPath, [join(tool, 'build.mjs'), '--consts', `--ds=${ds}`], { encoding: 'utf8' }).trim();
  let screens = read(join(tool, 'screens.js'));
  if (!/^runScreens\(/m.test(screens)) throw new Error(`${app.name}: screens.js doesn't end with runScreens(…)`);
  screens = screens.replace(/^runScreens\(/m, 'return runScreens(');
  parts.push(`// ══════ ${app.name}: its colours, the screens kit, its screens (tools/figma-screens in its repo) ══════\nasync function app_${app.key}() {\n${consts}\n${kit}\n${screens}\n}`);
  found.push(`${app.name} (${dir})`);
}

const runner = `
// ══════ The whole file: the menu command says what to build ══════
(async () => {
  const cmd = figma.command || 'all';
  const APP_RUNS = [${APPS.map(a => `['${a.key}', '${a.name}', app_${a.key}]`).join(', ')}];
  const done = [];
  try {
    if (cmd === 'update') { await main(true); if (note) note.cancel(); figma.closePlugin('Tokens updated from the code.'); return; }
    if (cmd === 'all' || cmd === 'library') {
      await main(false);
      const sections = log.filter(l => l.startsWith('+ ') && !/variable|text style|collection|effect style|page /.test(l)).length;
      const tokens = log.filter(l => /variable|text style|effect style/.test(l)).length;
      const what = [sections && sections + ' sections', tokens && tokens + ' tokens and styles'].filter(Boolean).join(' and ');
      done.push(what ? 'added ' + what + ' to the library' : 'the library is all there');
      if (skippedIcons.length) done.push('skipped icons Figma could not read: ' + skippedIcons.join(', '));
    }
    for (const [key, name, run] of APP_RUNS) {
      if (cmd !== 'all' && cmd !== key) continue;
      if (!run) { done.push(name + ' is not in this build of the plugin'); continue; }
      done.push(await run());
    }
    if (note) note.cancel();
    figma.closePlugin('Done: ' + done.join('; ') + '.');
  } catch (err) {
    if (note) note.cancel(); console.error(err);
    figma.closePlugin('Stopped: ' + err.message + '. What was built before it stays; run again after fixing.' + (done.length ? ' Before that: ' + done.join('; ') + '.' : ''));
  }
})();
`;

const code = [
  '// Generated by tools/figma-file/build.mjs: edit the library (tools/figma-library), the kit, or an app\'s screens.js, then build again.',
  "const FILE_LAYOUT = 'three-page';",
  library.slice(0, runAt) + library.slice(runEnd + '/* </run> */'.length),
  ...parts,
  runner,
].join('\n');
writeFileSync(outFile, code);
console.log(`Built ${outFile} (${Math.round(code.length / 1024)} kB): the library, and ${found.length ? found.join(', ') : 'no app'}.`);
