// Prints what the library holds after a build in the stand-in for Figma: each component, its
// variants and its properties. Handy when writing screens: `node tools/figma-file/catalog.mjs`.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figma, newFile, run } from './figma-stub.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, '..', 'figma-library', 'code.js'), 'utf8');
newFile();
const { msg, errors } = await run(code, 'build');
if (/^Stopped/.test(msg)) { console.error(msg); for (const e of errors) console.error(e); process.exit(1); }

export function catalog() {
  const lines = [];
  const comps = figma.root.children.flatMap(p => p.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }))
    .filter(n => !(n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET'));
  const icons = comps.filter(c => c.name.startsWith('Icon/')).map(c => c.name.slice(5));
  for (const c of comps) {
    if (c.name.startsWith('Icon/')) continue;
    const defs = c.componentPropertyDefinitions;
    const props = Object.entries(defs).map(([k, d]) => d.type === 'VARIANT' ? `${k}: ${d.variantOptions.join(' | ')}` : `${k.split('#')[0]} (${d.type === 'INSTANCE_SWAP' ? 'icon' : d.type.toLowerCase()}${d.type === 'TEXT' ? ` "${d.defaultValue}"` : d.type === 'BOOLEAN' ? ` ${d.defaultValue}` : ''})`);
    const first = c.type === 'COMPONENT_SET' ? c.children[0] : c;
    lines.push(`${c.name}  [${Math.round(first.width)} × ${Math.round(first.height)}]${c.type === 'COMPONENT_SET' ? `  ${c.children.length} variants` : ''}`);
    for (const p of props) lines.push(`    ${p}`);
    const layers = [...new Set(first.findAll(n => n.type === 'TEXT' || n.type === 'INSTANCE').filter(n => !n.parent || !(n.parent.mainComponent && n.parent.mainComponent.name.startsWith('Icon/'))).map(n => `${n.type === 'TEXT' ? 'T' : 'I'}:${n.name}`))].slice(0, 24);
    if (layers.length) lines.push(`    layers: ${layers.join(', ')}`);
  }
  lines.push('', `Icons: ${icons.join(' ')}`);
  return lines.join('\n');
}
if (process.argv[1] && process.argv[1].endsWith('catalog.mjs')) { console.log(msg); console.log(catalog()); }
