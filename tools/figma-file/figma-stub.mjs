// A stand-in for Figma's plugin API, enough to run the plugins of this folder in Node.
// It keeps a document in memory (pages, frames, components, instances, variables, styles),
// refuses what Figma refuses (a missing variant or property, FILL outside auto layout, moving a
// layer inside an instance, a size that isn't a number, a fourth page), and can draw a frame as
// SVG with a rough auto layout. It is a check for the scripts, not a copy of Figma: what passes
// here can still look different there.
import vm from 'node:vm';

let nextId = 1;
const byId = new Map();
export const warnings = [];
const AUTO = n => n.layoutMode === 'HORIZONTAL' || n.layoutMode === 'VERTICAL';
const CONTAINER = new Set(['PAGE', 'FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'SECTION', 'GROUP']);
const num = (x, what) => { if (typeof x !== 'number' || !Number.isFinite(x)) throw new Error(`${what} is not a number (${x})`); return x; };

class N {
  constructor(type) {
    this.id = `${nextId++}:1`; byId.set(this.id, this); this.type = type; this.name = type[0] + type.slice(1).toLowerCase();
    this.parent = null; this.removed = false; this.visible = true; this.fills = []; this.strokes = []; this.effects = [];
    this._x = 0; this._y = 0; this._w = 100; this._h = 100; this._sh = 'FIXED'; this._sv = 'FIXED';
    this._wrap = 'NO_WRAP'; this._pos = 'AUTO'; this._cas = 0; this._bound = {}; this._inInstance = false;
    this.layoutMode = 'NONE'; this.itemSpacing = 0; this.paddingLeft = this.paddingRight = this.paddingTop = this.paddingBottom = 0;
    this.primaryAxisAlignItems = 'MIN'; this.counterAxisAlignItems = 'MIN'; this.clipsContent = false; this.opacity = 1;
    this.topLeftRadius = this.topRightRadius = this.bottomLeftRadius = this.bottomRightRadius = 0; this.cornerRadius = 0; this.strokeWeight = 1;
    if (CONTAINER.has(type)) this.children = [];
    if (type === 'TEXT') { this.characters = ''; this.textAutoResize = 'WIDTH_AND_HEIGHT'; this._styleId = null; }
    if (type === 'COMPONENT' || type === 'COMPONENT_SET') { this._defs = {}; this.description = ''; }
    if (type === 'PAGE') this.selection = [];
  }
  // ── Tree ──
  appendChild(c) { this.insertChild(this.children ? this.children.length : 0, c); }
  insertChild(i, c) {
    if (!this.children) throw new Error(`${this.type} "${this.name}" can't have children`);
    if (!c || !(c instanceof N)) throw new Error(`appendChild: not a node (in "${this.name}")`);
    if (this.type === 'INSTANCE' || this._inInstance) throw new Error(`Cannot add "${c.name}" inside the instance "${this.name}"`);
    if (c._inInstance) throw new Error(`Cannot move "${c.name}": it is inside an instance`);
    if (this.type === 'COMPONENT_SET' && c.type !== 'COMPONENT') throw new Error('A component set only holds components');
    if (c === this || c.findAll(n => n === this).length) throw new Error("A node can't be put inside itself");
    if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1);
    c.parent = this; this.children.splice(Math.min(i, this.children.length), 0, c);
    if (!AUTO(this)) { if (c._sh === 'FILL') c._sh = 'FIXED'; if (c._sv === 'FILL') c._sv = 'FIXED'; c._pos = 'AUTO'; }
  }
  remove() {
    if (this._inInstance) throw new Error(`Cannot remove "${this.name}": it is inside an instance`);
    if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null; this.removed = true; for (const n of this._all()) n.removed = true;
  }
  _all() { const out = []; const walk = n => { for (const c of n.children || []) { out.push(c); walk(c); } }; walk(this); return out; }
  findAll(f) { return this._all().filter(f || (() => true)); }
  findOne(f) { return this._all().find(f) || null; }
  findAllWithCriteria({ types }) { return this._all().filter(n => types.includes(n.type)); }
  findChild(f) { return this.children.find(f) || null; }
  async loadAsync() {}
  // ── Geometry ──
  get x() { return this._x; }
  set x(v) { num(v, `x of "${this.name}"`); if (this._inInstance) throw new Error(`Cannot move "${this.name}": it is inside an instance`); this._x = v; }
  get y() { return this._y; }
  set y(v) { num(v, `y of "${this.name}"`); if (this._inInstance) throw new Error(`Cannot move "${this.name}": it is inside an instance`); this._y = v; }
  get width() { return size(this, 'h'); }
  get height() { return size(this, 'v'); }
  resize(w, h) {
    num(w, `width of "${this.name}"`); num(h, `height of "${this.name}"`);
    if (w < 0.01 || h < 0.01) throw new Error(`resize of "${this.name}": ${w} × ${h} is too small`);
    if (this._inInstance) warnings.push(`resize inside an instance: "${this.name}" (Figma may refuse it)`);
    this._w = w; this._h = h;
    if (this.type === 'TEXT' && this.textAutoResize === 'WIDTH_AND_HEIGHT') this.textAutoResize = 'NONE';
    if (this._sh !== 'FILL') this._sh = 'FIXED';
    if (this._sv !== 'FILL') this._sv = 'FIXED';
  }
  resizeWithoutConstraints(w, h) { this.resize(w, h); }
  get layoutSizingHorizontal() { return this._sh; }
  set layoutSizingHorizontal(v) { setSizing(this, 'h', v); }
  get layoutSizingVertical() { return this._sv; }
  set layoutSizingVertical(v) { setSizing(this, 'v', v); }
  get primaryAxisSizingMode() { return (this.layoutMode === 'VERTICAL' ? this._sv : this._sh) === 'HUG' ? 'AUTO' : 'FIXED'; }
  set primaryAxisSizingMode(v) { axisMode(this, this.layoutMode === 'VERTICAL' ? 'v' : 'h', v); }
  get counterAxisSizingMode() { return (this.layoutMode === 'VERTICAL' ? this._sh : this._sv) === 'HUG' ? 'AUTO' : 'FIXED'; }
  set counterAxisSizingMode(v) { axisMode(this, this.layoutMode === 'VERTICAL' ? 'h' : 'v', v); }
  get layoutWrap() { return this._wrap; }
  set layoutWrap(v) { if (v === 'WRAP' && this.layoutMode !== 'HORIZONTAL') throw new Error(`layoutWrap WRAP needs a horizontal auto layout ("${this.name}")`); this._wrap = v; }
  get counterAxisSpacing() { return this._cas; }
  set counterAxisSpacing(v) { if (this._wrap !== 'WRAP') throw new Error(`counterAxisSpacing needs layoutWrap WRAP ("${this.name}")`); this._cas = v; }
  get layoutPositioning() { return this._pos; }
  set layoutPositioning(v) { if (v === 'ABSOLUTE' && !(this.parent && AUTO(this.parent))) throw new Error(`layoutPositioning ABSOLUTE needs an auto-layout parent ("${this.name}")`); this._pos = v; }
  setBoundVariable(field, variable) {
    if (!variable || !variable.valuesByMode) throw new Error(`setBoundVariable(${field}) on "${this.name}": not a variable`);
    if (field === 'counterAxisSpacing' && this._wrap !== 'WRAP') throw new Error(`counterAxisSpacing needs layoutWrap WRAP ("${this.name}")`);
    this._bound[field] = variable; const val = Object.values(variable.valuesByMode)[0];
    if (typeof val !== 'number') return;
    if (field === 'width') { this._w = val; if (this._sh !== 'FILL') this._sh = 'FIXED'; }
    else if (field === 'height') { this._h = val; if (this._sv !== 'FILL') this._sv = 'FIXED'; }
    else if (field === 'counterAxisSpacing') this._cas = val;
    else this[field] = val;
  }
  async setTextStyleIdAsync(id) { if (!textStyles.find(s => s.id === id)) throw new Error('No such text style'); this._styleId = id; }
  async setEffectStyleIdAsync(id) { if (!effectStyles.find(s => s.id === id)) throw new Error('No such effect style'); this.effectStyleId = id; }
  // ── Components ──
  addComponentProperty(name, type, defaultValue) {
    if (!this._defs) throw new Error(`addComponentProperty on a ${this.type}`);
    if (type === 'INSTANCE_SWAP') { const c = byId.get(defaultValue); if (!c || c.type !== 'COMPONENT') throw new Error(`Property ${name}: the default must be a component's id`); }
    const key = type === 'VARIANT' ? name : `${name}#${nextId++}:0`; this._defs[key] = { type, defaultValue }; return key;
  }
  get componentPropertyDefinitions() { return defsOf(this); }
  swapComponent(c) {
    if (this.type !== 'INSTANCE') throw new Error(`swapComponent on a ${this.type}`);
    if (!c || c.type !== 'COMPONENT') throw new Error('swapComponent needs a component');
    const fresh = cloneInto(c, true, this._inInstance);
    this.mainComponent = c; this.children = fresh.children; for (const ch of this.children) ch.parent = this; this._values = {};
    for (const p of ['layoutMode', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'fills', 'strokes', '_wrap', '_cas']) this[p] = fresh[p];
    if (this._sh !== 'FILL') { this._sh = fresh._sh; this._w = fresh._w; }
    if (this._sv !== 'FILL') { this._sv = fresh._sv; this._h = fresh._h; }
  }
  clone() {
    if (this._inInstance) throw new Error(`Cannot clone "${this.name}" out of an instance this way`);
    const n = cloneInto(this, false, false); const fix = k => { for (const c of k.children || []) { c._inInstance = k.type === 'INSTANCE' || k._inInstance; fix(c); } }; fix(n);
    if (this.type === 'COMPONENT') { n._defs = { ...this._defs }; n.description = this.description; }
    const host = this.parent && this.parent.type !== 'COMPONENT_SET' ? this.parent : figma.currentPage;
    if (host) { n.parent = host; host.children.push(n); }
    return n;
  }
  createInstance() {
    if (this.type !== 'COMPONENT') throw new Error(`createInstance on a ${this.type} ("${this.name}")`);
    const i = cloneInto(this, true); if (figma.currentPage) { i.parent = figma.currentPage; figma.currentPage.children.push(i); }
    // a layer whose visibility follows a property starts as the property's default says
    const defs = defsOf(this);
    for (const n of i._all()) { const r = n.componentPropertyReferences; if (r && r.visible && defs[r.visible]) n.visible = defs[r.visible].defaultValue; }
    return i;
  }
  get componentProperties() {
    if (this.type !== 'INSTANCE') throw new Error(`componentProperties on a ${this.type}`);
    const out = {};
    for (const [k, d] of Object.entries(defsOf(this.mainComponent))) out[k] = { type: d.type, value: k in this._values ? this._values[k] : d.defaultValue };
    return out;
  }
  setProperties(props) {
    if (this.type !== 'INSTANCE') throw new Error(`setProperties on a ${this.type}`);
    for (const [k, val] of Object.entries(props)) {
      const defs = defsOf(this.mainComponent);
      const d = defs[k]; if (!d) throw new Error(`No component property "${k}" on "${this.name}"`);
      if (d.type !== 'VARIANT') { applyValue(this, k, d, val); continue; }
      const set = this.mainComponent.parent; const cur = variantProps(this.mainComponent.name); cur[k] = String(val);
      const next = set.children.find(c => sameVariant(c.name, cur));
      if (!next) throw new Error(`No variant "${Object.entries(cur).map(([a, b]) => `${a}=${b}`).join(', ')}" in ${set.name}`);
      const keep = this._values; const fresh = cloneInto(next, true, this._inInstance);
      this.mainComponent = next; this.children = fresh.children; for (const c of this.children) c.parent = this; this._values = {};
      for (const p of ['layoutMode', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'fills', 'strokes', '_wrap', '_cas']) this[p] = fresh[p];
      if (this._sh !== 'FILL') { this._sh = fresh._sh; this._w = fresh._w; }
      if (this._sv !== 'FILL') { this._sv = fresh._sv; this._h = fresh._h; }
      // text, boolean and swap values carry over by property name
      const now = defsOf(next);
      for (const [ok, ov] of Object.entries(keep)) {
        const nk = Object.keys(now).find(x => x.split('#')[0] === ok.split('#')[0] && now[x].type !== 'VARIANT');
        if (nk) applyValue(this, nk, now[nk], ov);
      }
    }
  }
}
function applyValue(inst, key, d, val) {
  if (d.type === 'TEXT' && typeof val !== 'string') throw new Error(`Property ${key} wants text, got ${typeof val}`);
  if (d.type === 'BOOLEAN' && typeof val !== 'boolean') throw new Error(`Property ${key} wants true or false, got ${typeof val}`);
  if (d.type === 'INSTANCE_SWAP') { const c = byId.get(val); if (!c || c.type !== 'COMPONENT') throw new Error(`Property ${key} wants a component's id`); }
  inst._values[key] = val;
  for (const n of inst._all()) {
    const r = n.componentPropertyReferences; if (!r) continue;
    if (r.characters === key) n.characters = val;
    if (r.visible === key) n.visible = val;
    if (r.mainComponent === key && n.type === 'INSTANCE') {
      const c = byId.get(val); const f = cloneInto(c, true, true);
      n.mainComponent = c; n.children = f.children; for (const ch of n.children) ch.parent = n;
    }
  }
}
function variantProps(name) { return Object.fromEntries(name.split(',').map(s => s.trim().split('=').map(t => t.trim()))); }
function sameVariant(name, want) { const have = variantProps(name); return Object.keys(want).every(k => have[k] === want[k]) && Object.keys(have).length === Object.keys(want).length; }
function defsOf(c) {
  if (c.type === 'COMPONENT_SET') return c.children[0] ? defsOf(c.children[0]) : {};
  const out = {};
  if (c.parent && c.parent.type === 'COMPONENT_SET') {
    const set = c.parent; const opts = {};
    for (const v of set.children) for (const [k, val] of Object.entries(variantProps(v.name))) (opts[k] = opts[k] || new Set()).add(val);
    for (const [k, s] of Object.entries(opts)) out[k] = { type: 'VARIANT', defaultValue: variantProps(c.name)[k], variantOptions: [...s] };
    Object.assign(out, set._defs);
  }
  return Object.assign(out, c._defs);
}
const SKIP = new Set(['id', 'type', 'parent', 'children', '_defs', 'description', 'removed', '_bound', '_values', 'mainComponent', '_inInstance']);
function cloneInto(src, asInstance, inside) {
  const n = new N(asInstance ? 'INSTANCE' : src.type);
  for (const [k, val] of Object.entries(src)) {
    if (SKIP.has(k)) continue;
    n[k] = Array.isArray(val) ? val.slice() : (val && typeof val === 'object') ? { ...val } : val;
  }
  n._bound = { ...src._bound }; n._inInstance = !!inside;
  if (asInstance) { n.mainComponent = src; n._values = {}; }
  else if (src.type === 'INSTANCE') { n.mainComponent = src.mainComponent; n._values = { ...src._values }; }
  if (src.children) n.children = src.children.map(c => { const k = cloneInto(c, false, true); k.parent = n; return k; });
  return n;
}
function setSizing(n, axis, v) {
  if (!['FIXED', 'HUG', 'FILL'].includes(v)) throw new Error(`layoutSizing: "${v}"`);
  if (v === 'FILL' && !(n.parent && AUTO(n.parent))) throw new Error(`FILL can only be set on children of auto-layout frames ("${n.name}" in "${n.parent ? n.parent.name : 'nothing'}")`);
  if (v === 'FILL' && n._pos === 'ABSOLUTE') throw new Error(`FILL on an absolutely placed layer ("${n.name}")`);
  if (v === 'HUG' && !(AUTO(n) || n.type === 'TEXT')) throw new Error(`HUG can only be set on auto-layout frames and text ("${n.name}")`);
  if (n.type === 'TEXT' && v !== 'HUG' && axis === 'h' && n.textAutoResize === 'WIDTH_AND_HEIGHT') n.textAutoResize = 'HEIGHT';
  if (axis === 'h') n._sh = v; else n._sv = v;
}
function axisMode(n, axis, v) {
  if (!AUTO(n)) throw new Error(`Sizing mode on "${n.name}", which has no auto layout`);
  const cur = axis === 'h' ? n._sh : n._sv; const next = v === 'AUTO' ? 'HUG' : cur === 'FILL' ? 'FILL' : 'FIXED';
  if (axis === 'h') n._sh = next; else n._sv = next;
}

// ── A rough auto layout ──
const collections = [], variables = [], textStyles = [], effectStyles = [];
const styleOf = t => textStyles.find(s => s.id === t._styleId) || { fontSize: 14, lineHeight: { value: 140 }, fontName: { style: 'Regular' } };
function textLine(t) {
  const s = styleOf(t); const k = /Bold/.test(s.fontName.style) ? 0.6 : 0.56;
  const track = t.letterSpacing && t.letterSpacing.value ? 1 + t.letterSpacing.value / 100 : 1;
  return Math.max(...String(t.characters).split('\n').map(l => l.length)) * s.fontSize * k * track;
}
const flow = n => (n.children || []).filter(c => c.visible && c._pos !== 'ABSOLUTE');
function size(n, axis) {
  const mode = axis === 'h' ? n._sh : n._sv; const p = n.parent;
  if (mode === 'FILL' && p && AUTO(p)) {
    const main = (p.layoutMode === 'HORIZONTAL') === (axis === 'h');
    const inner = size(p, axis) - (axis === 'h' ? p.paddingLeft + p.paddingRight : p.paddingTop + p.paddingBottom);
    if (!main || p._wrap === 'WRAP') return Math.max(0, inner);
    const kids = flow(p); const fills = kids.filter(c => (axis === 'h' ? c._sh : c._sv) === 'FILL');
    const used = kids.filter(c => !fills.includes(c)).reduce((s, c) => s + size(c, axis), 0) + p.itemSpacing * Math.max(0, kids.length - 1);
    return Math.max(0, (inner - used) / Math.max(1, fills.length));
  }
  if (n.type === 'TEXT') {
    const s = styleOf(n); const lh = s.fontSize * s.lineHeight.value / 100; const lines = String(n.characters).split('\n').length;
    if (n.textAutoResize === 'WIDTH_AND_HEIGHT') return axis === 'h' ? textLine(n) : lh * lines;
    if (axis === 'h') return n._w;
    if (n.textAutoResize === 'HEIGHT') {
      const w = Math.max(1, size(n, 'h')); let wrapped = Math.ceil(textLine(n) / w);
      if (n.maxLines) wrapped = Math.min(n.maxLines, wrapped);
      return lh * Math.max(lines, wrapped);
    }
    return n._h;
  }
  if (mode === 'HUG' && AUTO(n)) {
    const kids = flow(n); const main = (n.layoutMode === 'HORIZONTAL') === (axis === 'h');
    const pads = axis === 'h' ? n.paddingLeft + n.paddingRight : n.paddingTop + n.paddingBottom;
    const part = c => ((axis === 'h' ? c._sh : c._sv) === 'FILL' ? 0 : size(c, axis));
    if (n._wrap === 'WRAP' && !main) { const r = rows(n); return pads + r.reduce((s, x) => s + x.h, 0) + n._cas * Math.max(0, r.length - 1); }
    if (main) return pads + kids.reduce((s, c) => s + part(c), 0) + n.itemSpacing * Math.max(0, kids.length - 1);
    return pads + Math.max(0, ...kids.map(part));
  }
  return axis === 'h' ? n._w : n._h;
}
function rows(n) {
  const inner = size(n, 'h') - n.paddingLeft - n.paddingRight; const out = []; let row = null;
  for (const c of flow(n)) {
    const w = c._sh === 'FILL' ? 0 : size(c, 'h');
    if (!row || row.w + n.itemSpacing + w > inner + 0.5) { row = { kids: [], w: 0, h: 0 }; out.push(row); } else row.w += n.itemSpacing;
    row.kids.push(c); row.w += w; row.h = Math.max(row.h, c._sv === 'FILL' ? 0 : size(c, 'v'));
  }
  return out;
}
// Positions of the children of auto-layout frames, written before drawing
export function layout(n) {
  if (AUTO(n)) {
    const H = n.layoutMode === 'HORIZONTAL';
    const place = (kids, x0, y0, innerMain, innerCross) => {
      const main = c => size(c, H ? 'h' : 'v'), cross = c => size(c, H ? 'v' : 'h');
      const total = kids.reduce((s, c) => s + main(c), 0) + n.itemSpacing * Math.max(0, kids.length - 1); const free = innerMain - total;
      let at = n.primaryAxisAlignItems === 'CENTER' ? free / 2 : n.primaryAxisAlignItems === 'MAX' ? free : 0;
      const gap = n.primaryAxisAlignItems === 'SPACE_BETWEEN' && kids.length > 1 ? n.itemSpacing + Math.max(0, free) / (kids.length - 1) : n.itemSpacing;
      for (const c of kids) {
        const off = n.counterAxisAlignItems === 'CENTER' ? (innerCross - cross(c)) / 2 : n.counterAxisAlignItems === 'MAX' ? innerCross - cross(c) : 0;
        if (H) { c._x = x0 + at; c._y = y0 + off; } else { c._y = y0 + at; c._x = x0 + off; }
        at += main(c) + gap;
      }
    };
    const iw = size(n, 'h') - n.paddingLeft - n.paddingRight, ih = size(n, 'v') - n.paddingTop - n.paddingBottom;
    if (n._wrap === 'WRAP') { let y = n.paddingTop; for (const r of rows(n)) { place(r.kids, n.paddingLeft, y, iw, r.h); y += r.h + n._cas; } }
    else place(flow(n), n.paddingLeft, n.paddingTop, H ? iw : ih, H ? ih : iw);
  }
  for (const c of n.children || []) layout(c);
}

// ── Drawing ──
function resolve(variable) {
  let cur = variable;
  for (let i = 0; i < 10 && cur; i++) { const val = Object.values(cur.valuesByMode)[0]; if (val && val.type === 'VARIABLE_ALIAS') cur = variables.find(x => x.id === val.id); else return val; }
  return null;
}
function css(paints, fallback) {
  const p = (paints || []).find(x => x.visible !== false); if (!p) return fallback || 'none';
  if (p.type === 'IMAGE') return '#555';
  if (p.type !== 'SOLID') return '#444';
  let c = p.color, a = p.opacity === undefined ? 1 : p.opacity;
  const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
  if (id) { const val = resolve(variables.find(x => x.id === id)); if (val) { c = val; a = val.a === undefined ? 1 : val.a; } }
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// A frame as SVG: boxes, corner radii, text and where things sit. An icon is drawn as its box.
export function toSvg(root) {
  layout(root); const w = root.width, h = root.height; let clip = 0; const out = [];
  const draw = (n, ox, oy) => {
    if (!n.visible) return;
    const x = ox + (n === root ? 0 : n.x), y = oy + (n === root ? 0 : n.y), nw = n.width, nh = n.height;
    if (n.type === 'TEXT') {
      const s = styleOf(n); const lh = s.fontSize * s.lineHeight.value / 100; const weight = /Bold/.test(s.fontName.style) ? 700 : /Semi/.test(s.fontName.style) ? 600 : 400;
      String(n.characters).split('\n').forEach((line, i) => out.push(`<text x="${x.toFixed(1)}" y="${(y + lh * i + s.fontSize).toFixed(1)}" font-size="${s.fontSize}" font-weight="${weight}" fill="${css(n.fills, '#888')}">${esc(line)}</text>`));
      return;
    }
    const r = Math.max(0, Math.min(n.topLeftRadius || n.cornerRadius || 0, nw / 2, nh / 2)); const f = css(n.fills), st = css(n.strokes);
    if (n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.name.startsWith('Icon/')) {
      const ink = n.findOne(c => c.strokes && c.strokes.length);
      out.push(`<rect x="${(x + 2).toFixed(1)}" y="${(y + 2).toFixed(1)}" width="${Math.max(1, nw - 4).toFixed(1)}" height="${Math.max(1, nh - 4).toFixed(1)}" rx="3" fill="none" stroke="${ink ? css(ink.strokes) : '#999'}" stroke-width="1.5"><title>${esc(n.mainComponent.name)}</title></rect>`);
      return;
    }
    if (f !== 'none' || st !== 'none') out.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, nw).toFixed(1)}" height="${Math.max(0, nh).toFixed(1)}" rx="${n.type === 'ELLIPSE' ? nw / 2 : r}" fill="${f}" stroke="${st}"${n.opacity < 1 ? ` opacity="${n.opacity}"` : ''}><title>${esc(n.name)}</title></rect>`);
    if (!n.children) return;
    if (n.clipsContent) { const id = `c${clip++}`; out.push(`<clipPath id="${id}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}" rx="${r}"/></clipPath><g clip-path="url(#${id})">`); }
    for (const c of n.children) draw(c, x, y);
    if (n.clipsContent) out.push('</g>');
  };
  draw(root, 0, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Geist, Segoe UI, sans-serif">${out.join('')}</svg>`;
}

// ── The figma object ──
const root = {
  type: 'DOCUMENT', children: [],
  insertChild(i, p) { const at = this.children.indexOf(p); if (at >= 0) this.children.splice(at, 1); this.children.splice(Math.min(i, this.children.length), 0, p); },
};
function make(type) { const n = new N(type); if (figma.currentPage) { n.parent = figma.currentPage; figma.currentPage.children.push(n); } return n; }
let closed = null;
export const figma = {
  root, currentPage: null, command: '',
  createPage() {
    if (root.children.length >= 3) throw new Error('The free plan allows three pages a file');
    const p = new N('PAGE'); p.name = `Page ${root.children.length + 1}`; root.children.push(p); return p;
  },
  async setCurrentPageAsync(p) { if (!root.children.includes(p)) throw new Error('Not a page of this file'); figma.currentPage = p; },
  createFrame: () => make('FRAME'), createComponent: () => make('COMPONENT'), createText: () => make('TEXT'), createRectangle: () => make('RECTANGLE'),
  createEllipse: () => make('ELLIPSE'), createLine: () => make('LINE'), createSection: () => make('SECTION'), createVector: () => make('VECTOR'),
  createNodeFromSvg(svg) {
    if (!/<svg/.test(svg)) throw new Error('Not an SVG');
    const f = make('FRAME'); f._w = f._h = 18; const v = new N('VECTOR'); v._w = v._h = 14;
    v.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; v.parent = f; f.children.push(v); return f;
  },
  createComponentFromNode(node) { node.type = 'COMPONENT'; node._defs = {}; node.description = ''; return node; },
  combineAsVariants(nodes, parent) {
    if (!nodes.length || nodes.some(n => n.type !== 'COMPONENT')) throw new Error('combineAsVariants needs components');
    if (!parent || !parent.children) throw new Error('combineAsVariants needs a parent');
    const names = new Set();
    for (const n of nodes) {
      if (!/=/.test(n.name)) throw new Error(`Variant "${n.name}" has no Property=Value name`);
      if (names.has(n.name)) throw new Error(`Two variants named "${n.name}"`);
      names.add(n.name);
    }
    const set = new N('COMPONENT_SET'); set.parent = parent; parent.children.push(set);
    for (const n of nodes) { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = set; set.children.push(n); }
    return set;
  },
  group(nodes, parent) {
    if (!nodes.length) throw new Error('group needs nodes');
    const g = new N('GROUP'); g.parent = parent; parent.children.push(g);
    const x0 = Math.min(...nodes.map(n => n.x)), y0 = Math.min(...nodes.map(n => n.y));
    g._w = Math.max(...nodes.map(n => n.x + n.width)) - x0; g._h = Math.max(...nodes.map(n => n.y + n.height)) - y0; g._x = x0; g._y = y0;
    for (const n of nodes) { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = g; g.children.push(n); n._x -= x0; n._y -= y0; }
    return g;
  },
  notify() { return { cancel() {} }; },
  closePlugin(msg) { if (closed) closed(msg || ''); },
  async loadFontAsync(f) { if (f.family !== 'Geist') throw new Error(`Font ${f.family}`); },
  getImageByHash() { return null; },
  async getLocalTextStylesAsync() { return textStyles.slice(); },
  createTextStyle() {
    const s = { id: `S:${nextId++}`, name: '', fontName: { family: 'Geist', style: 'Regular' }, fontSize: 14, lineHeight: { unit: 'PERCENT', value: 140 }, letterSpacing: { unit: 'PERCENT', value: 0 } };
    textStyles.push(s); return s;
  },
  async getLocalEffectStylesAsync() { return effectStyles.slice(); },
  createEffectStyle() { const s = { id: `E:${nextId++}`, name: '', effects: [] }; effectStyles.push(s); return s; },
  variables: {
    async getLocalVariableCollectionsAsync() { return collections.slice(); },
    createVariableCollection(name) {
      const c = { id: `VC:${nextId++}`, name, modes: [{ modeId: `m${nextId++}`, name: 'Mode 1' }], renameMode(id, n) { this.modes.find(m => m.modeId === id).name = n; } };
      collections.push(c); return c;
    },
    createVariable(name, coll, type) {
      if (!coll || !coll.modes) throw new Error(`createVariable(${name}): no collection`);
      if (variables.some(x => x.name === name && x.variableCollectionId === coll.id)) throw new Error(`A variable named ${name} is already in ${coll.name}`);
      const x = { id: `V:${nextId++}`, name, resolvedType: type, variableCollectionId: coll.id, valuesByMode: {}, scopes: [], setValueForMode(m, val) { this.valuesByMode[m] = val; }, setVariableCodeSyntax() {} };
      variables.push(x); return x;
    },
    async getLocalVariablesAsync(type) { return variables.filter(x => !type || x.resolvedType === type); },
    async getVariableCollectionByIdAsync(id) { return collections.find(c => c.id === id); },
    async getVariableByIdAsync(id) { return variables.find(x => x.id === id); },
    setBoundVariableForPaint(paint, field, variable) {
      if (!variable || !variable.id) throw new Error('setBoundVariableForPaint: not a variable');
      return { ...paint, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: variable.id } } };
    },
  },
};
// A new, empty file: one page
export function newFile() { const p = new N('PAGE'); p.name = 'Page 1'; root.children.push(p); figma.currentPage = p; }
// Runs a plugin's code with a menu command, until it closes itself
export async function run(code, command) {
  figma.command = command || '';
  const errors = [];
  const done = new Promise(res => { closed = res; });
  const sandbox = { figma, console: { log() {}, warn() {}, error: e => errors.push(e) }, setTimeout, Promise };
  vm.runInNewContext(code, sandbox, { filename: 'code.js' });
  let timer;
  const late = new Promise(res => { timer = setTimeout(() => res('Stopped: the plugin never closed (120 s)'), 120000); });
  const msg = await Promise.race([done, late]);
  clearTimeout(timer);
  return { msg, errors };
}
