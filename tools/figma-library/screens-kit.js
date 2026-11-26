/* eslint-disable @typescript-eslint/no-unused-vars -- the kit is used by each app's screens.js */
// Pastel Studio screens kit: what every app's screens plugin is built from.
// An app's tools/figma-screens/build.mjs puts this file, the app's accent and its screens.js
// together into its plugin's code.js. The app's screens are frames in its section on the
// "Screens" page, made of instances of the library (pastel-studio-ds, tools/figma-library), so
// a change to a component shows on every screen. A screen that already exists is skipped:
// delete it to rebuild it. Nothing here edits what is already in the file.
// Built into the whole-file plugin (tools/figma-file), where FILE_LAYOUT is 'three-page', the
// screens go in the app's section on the "Mockups" page and the app's own components on "Blocks".
/* global APP_ACCENT, FILE_LAYOUT */
const THREE_PAGE = typeof FILE_LAYOUT !== 'undefined' && FILE_LAYOUT === 'three-page';

const log = [];
let V = {};            // variable name -> Variable
let STY = [];          // local text styles
let screensPage;       // the page the screens go on: "Screens", or "Mockups" in the three-page file
let blocksPage = null; // the "Blocks" page of the three-page file
let appName = '';      // the app whose screens are being built
let appSection;        // this app's section on the screens page
const freshBlocks = [];   // sections this run added to Blocks

// ── Progress ─────────────────────────────────────────────
let note = null;
function progress(msg) {
  console.log(`[screens] ${msg}`);
  if (note) note.cancel();
  note = figma.notify(msg, { timeout: Infinity });
}

// ── Lookups, by name like the library plugin ─────────────
function v(name) { const x = V[name]; if (!x) throw new Error(`Variable "${name}" not found: build the library first`); return x; }
async function resolveColor(variable) {
  let cur = variable;
  for (let i = 0; i < 10; i++) {
    const coll = await figma.variables.getVariableCollectionByIdAsync(cur.variableCollectionId);
    const val = cur.valuesByMode[coll.modes[0].modeId];
    if (val && val.type === 'VARIABLE_ALIAS') { cur = await figma.variables.getVariableByIdAsync(val.id); continue; }
    return val;
  }
  throw new Error(`Alias loop at ${variable.name}`);
}
const colorCache = new Map();
async function paintOf(variable) {
  if (!colorCache.has(variable.id)) colorCache.set(variable.id, await resolveColor(variable));
  const c = colorCache.get(variable.id);
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a === undefined ? 1 : c.a }, 'color', variable);
}
async function paint(name) { return paintOf(v(name)); }
function textStyleId(name) { const s = STY.find(s => s.name === name); if (!s) throw new Error(`Text style "${name}" not found`); return s.id; }
let compIndex = null;
function indexComponents() {
  compIndex = new Map();
  for (const n of figma.root.children.flatMap(p => p.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }))) {
    if (n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET') continue;
    if (!compIndex.has(n.name)) compIndex.set(n.name, n);
  }
}
// Indexed once, and again on a miss: an app's own components are made while it runs
function find(name) {
  if (!compIndex || !compIndex.has(name) || compIndex.get(name).removed) indexComponents();
  const n = compIndex.get(name);
  if (!n) throw new Error(`Component "${name}" not found: run "Pastel Studio DS: Figma library" first`);
  return n;
}
function variantOf(setName, variantName) {
  const vnt = find(setName).children.find(c => c.name === variantName);
  if (!vnt) throw new Error(`Variant "${variantName}" of ${setName} not found`);
  return vnt;
}
const icon = name => find(`Icon/${name}`);
function prop(inst, prefix, value) {
  const key = Object.keys(inst.componentProperties).find(k => k === prefix || k.startsWith(prefix + '#'));
  if (!key) throw new Error(`Property ${prefix} not on ${inst.name}`);
  inst.setProperties({ [key]: value });
}
// An instance of a component (or one of its variants) with its properties set. An "Icon"
// property takes an icon's name.
function use(setName, variantName, props) {
  const i = (variantName ? variantOf(setName, variantName) : find(setName)).createInstance();
  for (const [k, val] of Object.entries(props || {})) prop(i, k, k === 'Icon' ? icon(val).id : val);
  return i;
}

// ── Builders ─────────────────────────────────────────────
function bindNum(node, field, name) { node.setBoundVariable(field, v(name)); }
function radius(node, name) { for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(f, v(name)); }
function pad(node, t, r, b, l) { for (const [f, n] of [['paddingTop', t], ['paddingRight', r], ['paddingBottom', b], ['paddingLeft', l]]) if (n) node.setBoundVariable(f, v(n)); }
function auto(dir, name, gap) {
  const f = figma.createFrame(); f.name = name; f.layoutMode = dir;
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.fills = []; f.clipsContent = false;
  if (gap) bindNum(f, 'itemSpacing', gap);
  return f;
}
function fixed(f, w, h) { f.resize(w, h); f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED'; return f; }
function fill(node) { node.layoutSizingHorizontal = 'FILL'; return node; }
function fillBoth(node) { node.layoutSizingHorizontal = 'FILL'; node.layoutSizingVertical = 'FILL'; return node; }
async function text(chars, style, color, name) {
  const t = figma.createText(); await t.setTextStyleIdAsync(textStyleId(style)); t.characters = chars;
  t.fills = [await paint(color)]; t.autoRename = false; t.name = name || chars.slice(0, 40); return t;
}
async function iconInst(name, color, px) {
  const i = icon(name).createInstance(); i.name = name;
  if (px) i.resize(px, px);
  await recolor(i, color);
  return i;
}
async function recolor(node, color) {
  const p = await paint(color);
  for (const n of node.findAll(n => 'strokes' in n)) { if (n.strokes.length) n.strokes = [p]; if ('fills' in n && Array.isArray(n.fills) && n.fills.length) n.fills = [p]; }
}
function setText(root, layerName, value) { const t = root.findOne(n => n.type === 'TEXT' && n.name === layerName); if (t) t.characters = value; }
// The nth text layer of that name (a list's rows, a table's cells), counted from 0
function setTextAt(root, layerName, index, value) { const t = root.findAll(n => n.type === 'TEXT' && n.name === layerName)[index]; if (t) t.characters = value; }
// A change Figma may refuse on a layer inside an instance (a size, a layout setting): tried, and
// left as it was when refused, so a nicety never stops the build
function soft(change) { try { change(); } catch (err) { console.log(`[screens] skipped: ${err.message}`); } }
// A box with a centred icon: a stand-in for a picture, a poster or a cover
async function picture(name, w, h, ic, round, bg) {
  const f = auto('HORIZONTAL', name); fixed(f, w, h); f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER'; f.clipsContent = true;
  radius(f, round || 'radius/xl'); f.fills = [await paint(bg || 'surface/2')];
  if (ic) f.appendChild(await iconInst(ic, 'text/3', Math.max(16, Math.round(Math.min(w, h) / 4))));
  return f;
}
// A line across a container: a separator
async function rule(w, color) { const r = figma.createRectangle(); r.name = 'Separator'; r.resize(w || 100, 1); r.fills = [await paint(color || 'surface/3')]; return r; }
// The overlay shadow on a floating layer
async function elevate(node) { const e = (await figma.getLocalEffectStylesAsync()).find(x => x.name === 'elevation/overlay'); if (e) await node.setEffectStyleIdAsync(e.id); return node; }
async function card(parent, name, padding, gap) {
  const c = auto('VERTICAL', name, gap || 'space/12'); const p = padding || 'space/16'; pad(c, p, p, p, p);
  radius(c, 'radius/3xl'); c.fills = [await paint('surface/1')]; if (parent) parent.appendChild(c); return c;
}

// ── The app's own colours: its accent, and any colour of its own ──
// The library's roles carry Pastel Studio Pro's accent. An app with another accent gets its own
// variables (in "App colours"), and its screens are re-pointed to them, so its buttons, rings and
// highlights show its colour while the components stay one copy.
const ACCENT_ROLES = { 'accent/accent': 'accent', 'accent/hover': 'accent-hover', 'accent/on-accent': 'on-accent', 'accent/on-accent-2': 'on-accent-2',
  'accent/container': 'accent-container', 'accent/on-container': 'on-accent-container', 'accent/text': 'accent-text', 'structure/focus-ring': 'focus-ring' };
const appVars = new Map();   // library role variable id -> the app's variable
async function appColour(name, hex, alpha) {
  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  let c = colls.find(x => x.name === 'App colours');
  if (!c) c = figma.variables.createVariableCollection('App colours');
  const all = await figma.variables.getLocalVariablesAsync('COLOR');
  let x = all.find(y => y.name === name && y.variableCollectionId === c.id);
  if (!x) {
    x = figma.variables.createVariable(name, c, 'COLOR');
    x.setValueForMode(c.modes[0].modeId, { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255, a: alpha === undefined ? 1 : alpha });
    x.scopes = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
  }
  V[name] = x; return x;
}
async function setUpAccent(prefix) {
  for (const [role, token] of Object.entries(ACCENT_ROLES)) {
    const own = await appColour(`${prefix}/${token}`, APP_ACCENT[token]);
    appVars.set(v(role).id, own);
  }
}
// Re-points every paint of a screen that uses an accent role to the app's own accent
async function useAppAccent(root) {
  if (!appVars.size) return;
  const swap = async paints => {
    let changed = false;
    const next = await Promise.all(paints.map(async p => {
      const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
      if (!id || !appVars.has(id)) return p;
      changed = true; return paintOf(appVars.get(id));
    }));
    return changed ? next : null;
  };
  for (const n of [root, ...root.findAll(() => true)]) {
    if ('fills' in n && Array.isArray(n.fills) && n.fills.length) { const f = await swap(n.fills); if (f) n.fills = f; }
    if ('strokes' in n && Array.isArray(n.strokes) && n.strokes.length) { const s = await swap(n.strokes); if (s) n.strokes = s; }
  }
}

// ── Screens ──────────────────────────────────────────────
const W = 1280, H = 800;
const built = [];
function exists(name) { return appSection.children.some(n => n.name === name); }
// A window-sized frame in the app's section; laid out in rows of three when the run ends
async function screen(name, w, h) {
  const f = figma.createFrame(); f.name = name; f.resize(w || W, h || H); f.clipsContent = true;
  f.fills = [await paint('surface/bg')];
  appSection.appendChild(f); built.push(f);
  log.push(`+ ${name}`); progress(`Building ${name}…`);
  return f;
}
// Something floating over a page: the scrim, then the layer, centred unless told where
async function overlay(f, layer, at) {
  const veil = figma.createRectangle(); veil.name = 'Scrim'; veil.resize(f.width, f.height); veil.fills = [await paint('structure/scrim')];
  f.appendChild(veil); if (f.layoutMode !== 'NONE') veil.layoutPositioning = 'ABSOLUTE'; veil.x = 0; veil.y = 0;
  f.appendChild(layer); if (f.layoutMode !== 'NONE') layer.layoutPositioning = 'ABSOLUTE';
  layer.x = at && at.x !== undefined ? at.x : (f.width - layer.width) / 2; layer.y = at && at.y !== undefined ? at.y : (f.height - layer.height) / 2;
}
// Something floating without the scrim (a menu, a toast)
function float(f, layer, x, y) { f.appendChild(layer); if (f.layoutMode !== 'NONE') layer.layoutPositioning = 'ABSOLUTE'; layer.x = x; layer.y = y; }
// The screens this run added go in rows under the ones already there, which stay where they are
function layOutScreens() {
  const fresh = built.filter(n => n.parent === appSection);
  const old = appSection.children.filter(n => n.name !== 'Heading' && !fresh.includes(n));
  const gap = 160, cols = THREE_PAGE ? 4 : 3;
  let row = [], y = Math.max(200, ...old.map(n => n.y + n.height + gap + 40));
  const flush = () => { let x = 64; const h = Math.max(...row.map(n => n.height)); for (const n of row) { n.x = x; n.y = y; x += n.width + gap; } y += h + gap + 40; row = []; };
  for (const n of fresh) { row.push(n); if (row.length === cols) flush(); }
  if (row.length) flush();
  const kids = appSection.children.filter(n => n.name !== 'Heading');
  appSection.resizeWithoutConstraints(Math.max(1600, ...kids.map(n => n.x + n.width)) + 64, Math.max(400, ...kids.map(n => n.y + n.height)) + 64);
}
// New sections go under what is there; whatever a grown or new section covers moves down.
// Nothing moves up or sideways, so an arrangement made by hand stays.
function settle(p, fresh) {
  let bottom = Math.max(0, ...p.children.filter(n => !fresh.includes(n)).map(n => n.y + n.height));
  for (const s of fresh) { s.x = 0; s.y = bottom ? bottom + 160 : 0; bottom = s.y + s.height; }
  const boxes = p.children.slice().sort((a, b) => a.y - b.y);
  for (let i = 0; i < boxes.length; i++) for (let j = 0; j < i; j++) {
    const a = boxes[j], b = boxes[i];
    if (b.x < a.x + a.width && a.x < b.x + b.width && b.y < a.y + a.height + 160 && a.y < b.y + b.height) { b.y = a.y + a.height + 160; j = -1; }
  }
}

// ── The app's own components ─────────────────────────────
// Their section: inside the app's section on "Screens", or on "Blocks" in the three-page file
// (there it is called "<App> components", whatever name is asked for)
async function componentsSection(name) {
  const host = blocksPage || appSection;
  const title = blocksPage ? `${appName} components` : name;
  let s = host.children.find(n => n.type === 'SECTION' && n.name === title);
  if (!s) {
    s = figma.createSection(); s.name = title; host.appendChild(s); s.fills = [await paint('surface/bg')];
    if (blocksPage) { freshBlocks.push(s); const h = await text(title, '4xl/Bold', 'text/1', 'Heading'); s.appendChild(h); h.x = 64; h.y = 64; }
    log.push(`+ ${title}`);
  }
  return s;
}
// A component of the app, by name, when its section already has it
function ownComponent(sec, name) { return sec.findOne(n => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name); }
// Puts a new component (or set) in the section, in rows under what is there, and fits the section
function shelve(sec, node) {
  sec.appendChild(node);
  const others = sec.children.filter(n => n !== node && n.name !== 'Heading');
  const top = blocksPage ? 200 : 64;
  if (!others.length) { node.x = 64; node.y = top; }
  else {
    const rowY = Math.max(...others.map(n => n.y)), row = others.filter(n => n.y === rowY);
    const right = Math.max(...row.map(n => n.x + n.width));
    if (right + 96 + node.width <= 3200) { node.x = right + 96; node.y = rowY; }
    else { node.x = 64; node.y = Math.max(...others.map(n => n.y + n.height)) + 96; }
  }
  const kids = sec.children;
  sec.resizeWithoutConstraints(Math.max(...kids.map(n => n.x + n.width)) + 64, Math.max(...kids.map(n => n.y + n.height)) + 64);
  return node;
}
// A set of variants from components, laid in a row inside the set, with a description
function variants(sec, name, comps, description) {
  const set = figma.combineAsVariants(comps, sec); set.name = name; if (description) set.description = description;
  let x = 24; for (const c of set.children) { c.x = x; c.y = 24; x += c.width + 32; }
  set.resizeWithoutConstraints(x - 8, Math.max(...set.children.map(c => c.height)) + 48);
  return shelve(sec, set);
}

// ── Running ──────────────────────────────────────────────
// On its own (an app's screens plugin) it closes the plugin with what it did. In the whole-file
// plugin it returns that line instead, and an error goes to the caller.
async function runScreens(app, build) {
  appName = app;
  try {
    for (const p of figma.root.children) await p.loadAsync();
    const where = THREE_PAGE ? 'Mockups' : 'Screens';
    screensPage = figma.root.children.find(p => p.name === where);
    if (!screensPage) throw new Error(THREE_PAGE ? 'No "Mockups" page: run "Library and Blocks" first' : 'No "Screens" page: run "Pastel Studio DS: Figma library" first');
    blocksPage = THREE_PAGE ? figma.root.children.find(p => p.name === 'Blocks') || null : null;
    if (THREE_PAGE && !blocksPage) throw new Error('No "Blocks" page: run "Library and Blocks" first');
    await figma.setCurrentPageAsync(screensPage);
    appSection = screensPage.children.find(n => n.type === 'SECTION' && n.name === appName);
    const freshApp = [];
    if (!appSection) { appSection = figma.createSection(); appSection.name = appName; screensPage.appendChild(appSection); freshApp.push(appSection); }
    for (const s of ['Regular', 'Medium', 'SemiBold', 'Bold']) await figma.loadFontAsync({ family: 'Geist', style: s });
    for (const x of await figma.variables.getLocalVariablesAsync()) V[x.name] = x;
    STY = await figma.getLocalTextStylesAsync();
    await build();
    if (built.length) layOutScreens();
    if (THREE_PAGE) { settle(screensPage, freshApp); settle(blocksPage, freshBlocks); }
    if (note) note.cancel();
    const done = built.length ? `added ${built.length} screens to ${appName}` : `${appName}’s screens are all there`;
    if (THREE_PAGE) return done;
    figma.closePlugin(built.length ? `Done: ${done}.` : `Nothing to add: ${done}.`);
  } catch (err) {
    if (note) note.cancel();
    if (THREE_PAGE) throw err;
    console.error(err);
    figma.closePlugin(`Stopped: ${err.message}. What was built before it stays; run again after fixing.`);
  }
  return '';
}
