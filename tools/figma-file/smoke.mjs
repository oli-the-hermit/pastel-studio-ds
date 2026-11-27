// Runs the whole-file plugin in a stand-in for Figma (figma-stub.mjs), as a new file would:
// "Build everything", then again (the second run must add nothing). It fails on anything the
// plugin stops on. With --preview=<folder> it also draws every screen and block as SVG there,
// with an index.html to look through them.
//   node tools/figma-file/smoke.mjs [--only=library|pro|media|espresso] [--preview=<folder>] [--code=<file>]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figma, newFile, run, toSvg, warnings } from './figma-stub.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const opt = name => { const a = process.argv.find(x => x.startsWith(`--${name}=`)); return a ? a.slice(name.length + 3) : null; };
const code = readFileSync(opt('code') ? resolve(opt('code')) : join(here, 'code.js'), 'utf8');
const only = opt('only');

newFile();
const steps = only && only !== 'library' ? ['library', only, only] : only ? ['library', 'library'] : ['all', 'all'];
let failed = false;
for (const [i, cmd] of steps.entries()) {
  const { msg, errors } = await run(code, cmd);
  console.log(`${cmd} → ${msg}`);
  if (/^Stopped/.test(msg)) { failed = true; for (const e of errors) console.error(e && e.stack ? e.stack.split('\n').slice(0, 6).join('\n') : e); break; }
  if (i === steps.length - 1 && /added/.test(msg)) { failed = true; console.error('The second run added something: a screen or section is not found again by its name.'); }
}

console.log('');
for (const p of figma.root.children) {
  console.log(`Page ${p.name}`);
  for (const n of p.children) {
    const inside = n.children ? n.children.filter(c => c.name !== 'Heading') : [];
    console.log(`  ${n.type.toLowerCase()} ${n.name}  ${Math.round(n.width)} × ${Math.round(n.height)} at ${Math.round(n.x)}, ${Math.round(n.y)}${inside.length ? `  (${inside.length})` : ''}`);
    if (p.name !== 'Library') for (const c of inside) console.log(`      ${c.type === 'SECTION' ? '§ ' : ''}${c.name}  ${Math.round(c.width)} × ${Math.round(c.height)}`);
  }
}
const uniq = [...new Set(warnings)];
if (uniq.length) { console.log(`\n${uniq.length} things Figma may refuse (each is tried softly in the scripts):`); for (const w of uniq.slice(0, 40)) console.log(`  ${w}`); }

const out = opt('preview');
if (out && !failed) {
  const dir = resolve(out); mkdirSync(dir, { recursive: true });
  const items = [];
  const slug = s => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const save = (group, n) => { const file = `${slug(group)}--${slug(n.name)}.svg`; writeFileSync(join(dir, file), toSvg(n)); items.push([group, n.name, file, Math.round(n.width), Math.round(n.height)]); };
  for (const p of figma.root.children.filter(x => x.name === 'Mockups' || x.name === 'Blocks')) {
    for (const s of p.children) {
      if (s.type !== 'SECTION') { if (s.type === 'FRAME') save(p.name, s); continue; }
      for (const c of s.children) {
        if (c.name === 'Heading') continue;
        if (c.type === 'SECTION') { for (const k of c.children) for (const v of (k.type === 'COMPONENT_SET' ? k.children : [k])) if (v.type !== 'TEXT') save(`${p.name} · ${s.name} · ${c.name}`, k.type === 'COMPONENT_SET' ? Object.assign(v, { name: `${k.name} — ${v.name}` }) : v); }
        else for (const v of (c.type === 'COMPONENT_SET' ? c.children : [c])) if (v.type !== 'TEXT') save(`${p.name} · ${s.name}`, c.type === 'COMPONENT_SET' ? Object.assign(v, { name: `${c.name} — ${v.name}` }) : v);
      }
    }
  }
  const groups = [...new Set(items.map(i => i[0]))];
  const html = `<!doctype html><meta charset="utf-8"><title>Figma file preview</title>
<style>body{margin:0;background:#0d0f12;color:#ddd;font:14px/1.4 Segoe UI,sans-serif}nav{position:sticky;top:0;background:#16191d;padding:10px 16px;display:flex;gap:12px;flex-wrap:wrap;z-index:2}
nav a{color:#9cc;text-decoration:none}h2{margin:32px 16px 8px;font-size:18px}figure{margin:16px;display:inline-block;vertical-align:top}figcaption{margin-bottom:6px;color:#aaa}
img{max-width:min(1200px,calc(100vw - 32px));height:auto;background:#000;outline:1px solid #333}p.note{margin:8px 16px;color:#999}</style>
<nav>${groups.map((g, i) => `<a href="#g${i}">${g}</a>`).join('')}</nav>
<p class="note">Drawn by the stand-in for Figma: boxes, text and layout only (an icon is an outlined square, a picture a grey box). Sizes and spacing are close, not exact.</p>
${groups.map((g, i) => `<h2 id="g${i}">${g}</h2>${items.filter(x => x[0] === g).map(x => `<figure><figcaption>${x[1]} · ${x[3]} × ${x[4]}</figcaption><img loading="lazy" src="${x[2]}" width="${x[3]}" height="${x[4]}"></figure>`).join('')}`).join('')}`;
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`\nDrew ${items.length} previews in ${dir}`);
}
process.exit(failed ? 1 : 0);
