/* eslint-disable @typescript-eslint/no-unused-vars -- the kit is used by each app's screens.js */
// Pastel Studio screens kit: what every app's screens plugin is built from.
// An app's tools/figma-screens/build.mjs puts this file, the app's accent and its screens.js
// together into its plugin's code.js. The app's screens are frames in its section on the
// "Screens" page, made of instances of the library (pastel-studio-ds, tools/figma-library), so
// a change to a component shows on every screen. A screen that already exists is skipped:
// delete it to rebuild it. Nothing here edits what is already in the file.
/* global APP_ACCENT */

const log = [];
let V = {};            // variable name -> Variable
let STY = [];          // local text styles
let screensPage;       // the "Screens" page
let appSection;        // this app's section on it

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
function find(name) {
  if (!compIndex) {
    compIndex = new Map();
    for (const n of figma.root.children.flatMap(p => p.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }))) {
      if (n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET') continue;
      if (!compIndex.has(n.name)) compIndex.set(n.name, n);
    }
  }
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
function layOutScreens() {
  const kids = appSection.children.filter(n => n.name !== 'Heading');
  const top = 200, gap = 160, cols = 3;
  let row = [], y = top;
  const flush = () => { let x = 64; const h = Math.max(...row.map(n => n.height)); for (const n of row) { n.x = x; n.y = y; x += n.width + gap; } y += h + gap + 40; row = []; };
  for (const n of kids) { row.push(n); if (row.length === cols) flush(); }
  if (row.length) flush();
  appSection.resizeWithoutConstraints(Math.max(1600, ...kids.map(n => n.x + n.width)) + 64, Math.max(400, y));
}

// ── Running ──────────────────────────────────────────────
async function runScreens(appName, build) {
  try {
    for (const p of figma.root.children) await p.loadAsync();
    screensPage = figma.root.children.find(p => p.name === 'Screens');
    if (!screensPage) throw new Error('No "Screens" page: run "Pastel Studio DS: Figma library" first');
    await figma.setCurrentPageAsync(screensPage);
    appSection = screensPage.children.find(n => n.type === 'SECTION' && n.name === appName);
    if (!appSection) { appSection = figma.createSection(); appSection.name = appName; screensPage.appendChild(appSection); }
    for (const s of ['Regular', 'Medium', 'SemiBold', 'Bold']) await figma.loadFontAsync({ family: 'Geist', style: s });
    for (const x of await figma.variables.getLocalVariablesAsync()) V[x.name] = x;
    STY = await figma.getLocalTextStylesAsync();
    await build();
    if (built.length) layOutScreens();
    if (note) note.cancel();
    figma.closePlugin(built.length ? `Done: added ${built.length} screens to ${appName}.` : `Nothing to add: ${appName}’s screens are all there.`);
  } catch (err) {
    if (note) note.cancel(); console.error(err);
    figma.closePlugin(`Stopped: ${err.message}. What was built before it stays; run again after fixing.`);
  }
}
