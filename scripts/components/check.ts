// Checks the structure the component contract asks for. Run: npm run check:components
//   1. Every folder in packages/react/src/components is named like its component (PascalCase)
//      and holds Name.tsx, meta.ts and index.ts. Its stylesheet, if it has one, is name.css in
//      kebab-case, and it is the only one.
//   2. The folder is exported from src/index.ts, and its stylesheet is imported in
//      src/styles.css inside layer(ps.components).
//   3. meta.ts exports `meta` as plain data (it imports nothing but types); its name is the
//      folder's, and every related component exists.
// What a stylesheet may contain (tokens only, ps-* and is-* classes) is Stylelint's job.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { componentNames, COMPONENTS_DIR, kebab, REACT_SRC } from './parse.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const rel = (file: string) => path.relative(ROOT, file).replaceAll('\\', '/');
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const problems: string[] = [];
const names = componentNames();
const index = fs.readFileSync(path.join(REACT_SRC, 'index.ts'), 'utf8');
const styles = fs.readFileSync(path.join(REACT_SRC, 'styles.css'), 'utf8');
let stylesheets = 0;

for (const name of names) {
  const dir = path.join(COMPONENTS_DIR, name);
  const where = rel(dir);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) { problems.push(`${where}: a component folder is PascalCase, like its component`); continue; }

  // 1. The folder's files.
  for (const file of [`${name}.tsx`, 'meta.ts', 'index.ts']) {
    if (!fs.existsSync(path.join(dir, file))) problems.push(`${where}: ${file} is missing`);
  }
  const sheet = `${kebab(name)}.css`;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    if (file !== sheet) problems.push(`${where}/${file}: a component has one stylesheet, named ${sheet}`);
  }

  // 2. Exported, and its styles imported.
  if (!new RegExp(`from\\s+['"]\\./components/${name}['"]`).test(index)) {
    problems.push(`${where}: not exported from packages/react/src/index.ts (export * from './components/${name}')`);
  }
  if (fs.existsSync(path.join(dir, sheet))) {
    stylesheets++;
    const line = `@import url('./components/${name}/${sheet}') layer(ps.components);`;
    if (!new RegExp(escape(line).replace(/'/g, `['"]`)).test(styles)) {
      problems.push(`${where}/${sheet}: not imported in packages/react/src/styles.css (${line})`);
    }
  }

  // 3. The metadata.
  const metaFile = path.join(dir, 'meta.ts');
  if (!fs.existsSync(metaFile)) continue;
  let meta: { name?: unknown; related?: unknown } | undefined;
  try {
    ({ meta } = await import(pathToFileURL(metaFile).href));
  } catch (error) {
    problems.push(`${rel(metaFile)}: could not be read as plain data (${(error as Error).message.split('\n')[0]})`);
    continue;
  }
  if (!meta) { problems.push(`${rel(metaFile)}: must export "meta"`); continue; }
  if (meta.name !== name) problems.push(`${rel(metaFile)}: name is "${String(meta.name)}", the folder is ${name}`);
  for (const other of Array.isArray(meta.related) ? meta.related : []) {
    if (other === name) problems.push(`${rel(metaFile)}: lists itself as related`);
    else if (!names.includes(other)) problems.push(`${rel(metaFile)}: related component "${String(other)}" doesn't exist`);
  }
}

if (problems.length) {
  console.error(`Components: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Components: ${names.length} component folders, ${stylesheets} stylesheets checked. No problems.`);
