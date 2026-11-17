// Pastel Studio DS: Figma library.
// Builds the design system's components on the "Components" page of the Pastel Studio file, beside
// the foundations already there (variables, text styles, icons, the basic components: see README).
// Each batch below adds sections; everything it uses is found by name. A section that already
// exists is skipped, so running the plugin again only adds what is missing, and a new component is
// one more `if (!exists('Name')) { … }` block in a batch.
//   Dialogs: TextButton, FormError, ActionRow, Modal, ConfirmModal
//   Explorer: TreeItem, TreeHeading, ListRow, DetailsPane, StatusBar, ToolbarDivider, EmptyState, Drawer
//   Pickers and feedback: SegmentedControl, Select, Slider, Tabs, ListPicker, Toast, StatusChip, Spinner

const log = [];
let V = {};          // variable name -> Variable
let STY = [];        // local text styles
let page;            // the Components page

// ── Lookups ──────────────────────────────────────────────
function v(name) { const x = V[name]; if (!x) throw new Error(`Variable "${name}" not found`); return x; }
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
async function paint(name) {
  const variable = v(name); const c = await resolveColor(variable);
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a === undefined ? 1 : c.a }, 'color', variable);
}
function textStyleId(name) { const s = STY.find(s => s.name === name); if (!s) throw new Error(`Text style "${name}" not found`); return s.id; }
function find(name) {
  const n = page.findOne(n => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name);
  if (!n) throw new Error(`Component "${name}" not found on the Components page`);
  return n;
}
function variantOf(setName, variantName) {
  const set = find(setName);
  const vnt = set.children.find(c => c.name === variantName);
  if (!vnt) throw new Error(`Variant "${variantName}" of ${setName} not found`);
  return vnt;
}
const icon = name => find(`Icon/${name}`);
function prop(inst, prefix, value) {
  const key = Object.keys(inst.componentProperties).find(k => k === prefix || k.startsWith(prefix + '#'));
  if (!key) throw new Error(`Property ${prefix} not on ${inst.name}`);
  inst.setProperties({ [key]: value });
}

// ── Builders ─────────────────────────────────────────────
async function bindNum(node, field, name) { node.setBoundVariable(field, v(name)); }
async function radius(node, name) { for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(f, v(name)); }
async function pad(node, t, r, b, l) { for (const [f, n] of [['paddingTop', t], ['paddingRight', r], ['paddingBottom', b], ['paddingLeft', l]]) if (n) node.setBoundVariable(f, v(n)); }
function auto(dir, name, props) {
  const f = figma.createFrame(); f.name = name; f.layoutMode = dir;
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.fills = []; f.clipsContent = false;
  if (props) Object.assign(f, props);
  return f;
}
function comp(dir, name) {
  const c = figma.createComponent(); c.name = name; c.layoutMode = dir;
  c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO'; c.fills = []; c.clipsContent = false;
  return c;
}
async function text(chars, style, color, name) {
  const t = figma.createText(); await t.setTextStyleIdAsync(textStyleId(style)); t.characters = chars;
  t.fills = [await paint(color)]; t.autoRename = false; t.name = name || 'Text'; return t;
}
async function iconInst(name, color, px, layerName) {
  const i = icon(name).createInstance(); i.name = layerName || 'Icon';
  if (px) i.resize(px, px);
  const p = await paint(color);
  for (const n of i.findAll(n => 'strokes' in n)) { if (n.strokes.length) n.strokes = [p]; if ('fills' in n && Array.isArray(n.fills) && n.fills.length) n.fills = [p]; }
  return i;
}
function fill(node) { node.layoutSizingHorizontal = 'FILL'; return node; }

async function ensureSize(name, css, value) {
  if (V[name]) return V[name];
  const coll = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Size');
  const nv = figma.variables.createVariable(name, coll, 'FLOAT');
  nv.setValueForMode(coll.modes[0].modeId, value); nv.scopes = ['WIDTH_HEIGHT']; nv.setVariableCodeSyntax('WEB', `var(--ps-${css})`);
  V[name] = nv; log.push(`+ variable ${name}`); return nv;
}
async function ensureTextStyle(name, size, weight, lineHeight) {
  let s = STY.find(s => s.name === name); if (s) return s;
  await figma.loadFontAsync({ family: 'Geist', style: weight });
  s = figma.createTextStyle(); s.name = name; s.fontName = { family: 'Geist', style: weight }; s.fontSize = size;
  s.lineHeight = { unit: 'PERCENT', value: lineHeight || 140 }; STY.push(s); log.push(`+ text style ${name}`); return s;
}

// ── Sections and layout ──────────────────────────────────
let rowX = 0, rowY = 0;
function bottomOfPage() { return Math.max(0, ...page.children.map(n => n.y + n.height)); }
function startRow() { rowX = 0; rowY = bottomOfPage() + 96; }
function exists(name) { return page.children.some(n => n.type === 'SECTION' && n.name === name); }
async function section(name, nodes, bg) {
  const s = figma.createSection(); s.name = name; s.x = rowX; s.y = rowY;
  let x = 24;
  for (const n of nodes) { s.appendChild(n); n.x = x; n.y = 48; x += n.width + 40; }
  const w = Math.max(...nodes.map(n => n.x + n.width)), h = Math.max(...nodes.map(n => n.y + n.height));
  s.resizeWithoutConstraints(w + 24, h + 24); s.fills = [await paint(bg || 'surface/1')];
  rowX += s.width + 48; log.push(`+ ${name}`); return s;
}
function grid(set, cols, cellW, cellH) {
  set.children.forEach((c, i) => { c.x = 24 + (i % cols) * cellW; c.y = 24 + Math.floor(i / cols) * cellH; });
  set.resizeWithoutConstraints(24 + Math.min(cols, set.children.length) * cellW, 24 + Math.ceil(set.children.length / cols) * cellH);
  return set;
}
function column(set, gap) { // variants stacked one under another, each at its own height
  let y = 24;
  for (const c of set.children) { c.x = 24; c.y = y; y += c.height + gap; }
  set.resizeWithoutConstraints(48 + Math.max(...set.children.map(c => c.width)), y - gap + 24);
  return set;
}
function stackGrid(set) { // size each cell to its own variant: columns of the widest, rows of the tallest
  const w = Math.max(...set.children.map(c => c.width)) + 24, h = Math.max(...set.children.map(c => c.height)) + 20;
  return { w, h };
}

// ══ 1. Dialogs ═══════════════════════════════════════════
async function buildDialogs() {
  startRow();
  if (!exists('TextButton')) {
    const vs = [];
    for (const [tone, st, bg, fg] of [['Default', 'Default', null, 'text/2'], ['Default', 'Hover', 'surface/3', 'text/1'], ['Accent', 'Default', null, 'accent/text'], ['Accent', 'Hover', 'accent/container', 'accent/on-container']]) {
      const c = comp('HORIZONTAL', `Tone=${tone}, State=${st}`); c.counterAxisAlignItems = 'CENTER';
      await pad(c, 'space/6', 'space/10', 'space/6', 'space/10'); await bindNum(c, 'itemSpacing', 'space/6'); await radius(c, 'radius/md');
      if (bg) c.fills = [await paint(bg)];
      c.appendChild(await text('Forgot your password?', 'md/SemiBold', fg, 'Label')); vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'TextButton';
    set.description = 'A quiet text action in forms ("Forgot your password?"). Default text/2; Accent in accent-text. Hover: surface/3 (Accent: the accent container).';
    const k = set.addComponentProperty('Label', 'TEXT', 'Forgot your password?');
    for (const c of set.children) c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: k };
    await section('TextButton', [grid(set, 2, 240, 52)]);
  }
  if (!exists('Form parts')) {
    const fe = comp('HORIZONTAL', 'FormError');
    const ft = await text('That username and password don’t match an account.', 'sm/Medium', 'status/danger'); fe.appendChild(ft);
    ft.componentPropertyReferences = { characters: fe.addComponentProperty('Text', 'TEXT', 'That username and password don’t match an account.') };
    fe.description = 'A form’s error line (sm/Medium, danger), just above its buttons.';
    const ar = comp('HORIZONTAL', 'ActionRow'); ar.primaryAxisSizingMode = 'FIXED'; ar.resize(464, 44);
    ar.primaryAxisAlignItems = 'MAX'; ar.counterAxisAlignItems = 'CENTER'; await bindNum(ar, 'itemSpacing', 'space/8'); await bindNum(ar, 'paddingTop', 'space/4');
    const cancel = variantOf('Button', 'Style=Secondary, Size=md').createInstance(); prop(cancel, 'Label', 'Cancel');
    const save = variantOf('Button', 'Style=Primary, Size=md').createInstance(); prop(save, 'Label', 'Save');
    ar.appendChild(cancel); ar.appendChild(save);
    ar.description = 'A form’s buttons at its end: Secondary to cancel, Primary to confirm (swap to Danger for a destructive one). Gap 8.';
    await section('Form parts', [fe, ar]);
  }
  if (!exists('Modal')) {
    const w520 = await ensureSize('size/modal-max-width', 'modal-max-width', 520);
    await ensureSize('size/modal-max-width-wide', 'modal-max-width-wide', 620);
    const elev = (await figma.getLocalEffectStylesAsync()).find(s => s.name === 'elevation/overlay');
    const actionRow = find('ActionRow');
    async function shell(name, title) {
      const m = comp('VERTICAL', name); m.counterAxisSizingMode = 'FIXED'; m.resize(520, 100); m.setBoundVariable('width', w520); m.primaryAxisSizingMode = 'AUTO';
      await radius(m, 'radius/3xl'); m.fills = [await paint('surface/1')]; if (elev) await m.setEffectStyleIdAsync(elev.id);
      const head = auto('HORIZONTAL', 'Header'); head.counterAxisAlignItems = 'CENTER'; m.appendChild(head); fill(head);
      await pad(head, 'space/22', 'space/18', 'space/6', 'space/28'); await bindNum(head, 'itemSpacing', 'space/12');
      const t = await text(title, 'xl/Bold', 'text/1', 'Title'); head.appendChild(t); fill(t);
      const close = variantOf('IconButton', 'Size=sm, State=Default').createInstance(); close.name = 'Close'; prop(close, 'Icon', icon('Close').id); head.appendChild(close);
      const body = auto('VERTICAL', 'Body'); m.appendChild(body); fill(body);
      await pad(body, 'space/14', 'space/28', 'space/28', 'space/28'); await bindNum(body, 'itemSpacing', 'space/20');
      t.componentPropertyReferences = { characters: m.addComponentProperty('Title', 'TEXT', title) };
      return { m, body };
    }
    const a = await shell('Modal', 'Rename');
    const f = variantOf('Field', 'Error=False').createInstance(); a.body.appendChild(f); fill(f); prop(f, 'Label', 'Name'); prop(f, 'Show note', false);
    const r1 = actionRow.createInstance(); a.body.appendChild(r1); fill(r1);
    a.m.description = 'A dialog: surface/1, radius 3xl, 520 wide (620 wide variant via size/modal-max-width-wide), elevation/overlay, over structure/scrim. Header: title xl/Bold + close IconButton. Body: the form, gap 20, ending in an ActionRow.';
    const b = await shell('ConfirmModal', 'Move to Trash?');
    const msg = await text('“IMG_0042.jpg” goes to the Trash. You can restore it from there.', 'md/Regular', 'text/2', 'Message');
    b.body.appendChild(msg); fill(msg); msg.textAutoResize = 'HEIGHT';
    msg.componentPropertyReferences = { characters: b.m.addComponentProperty('Message', 'TEXT', msg.characters) };
    const r2 = actionRow.createInstance(); b.body.appendChild(r2); fill(r2);
    const confirm = r2.children[1]; confirm.swapComponent(variantOf('Button', 'Style=Danger, Size=md')); prop(confirm, 'Label', 'Move to Trash');
    b.m.description = 'A confirmation: the question as the title, one line of consequences (md, text/2), then Cancel and the action (Danger when it removes something).';
    // The dialog over the page, for mockups
    const scrim = figma.createFrame(); scrim.name = 'Modal over the page (example)'; scrim.resize(760, 420);
    scrim.fills = [await paint('surface/bg')];
    const veil = figma.createRectangle(); veil.name = 'Scrim'; veil.resize(760, 420); veil.fills = [await paint('structure/scrim')]; scrim.appendChild(veil);
    const shown = b.m.createInstance(); scrim.appendChild(shown); shown.x = 120; shown.y = (420 - shown.height) / 2;
    await section('Modal', [a.m, b.m, scrim], 'surface/bg');
  }
}

// ══ 2. Explorer pieces ═══════════════════════════════════
async function buildExplorer() {
  startRow();
  await ensureTextStyle('xs/Bold', 11.25, 'Bold');
  await ensureTextStyle('lg/Bold', 16.5, 'Bold');
  const indent = 16;
  if (!exists('TreeView')) {
    const vs = [];
    for (const [st, bg, fg, weight] of [['Default', null, 'text/2', 'sm/Medium'], ['Hover', 'surface/2', 'text/1', 'sm/Medium'], ['Selected', 'accent/container', 'accent/on-container', 'sm/SemiBold']])
      for (const tw of ['Closed', 'Open', 'Leaf']) {
        const c = comp('HORIZONTAL', `State=${st}, Twisty=${tw}`); c.counterAxisAlignItems = 'CENTER'; c.primaryAxisSizingMode = 'FIXED'; c.resize(232, 40);
        await bindNum(c, 'height', 'size/row-height'); await pad(c, null, 'space/10', null, 'space/4'); await bindNum(c, 'itemSpacing', 'space/6'); await radius(c, 'radius/pill');
        if (bg) c.fills = [await paint(bg)];
        const twisty = await iconInst(tw === 'Open' ? 'ChevronDown' : 'ChevronRight', 'text/3', 14, 'Twisty');
        const tbox = auto('HORIZONTAL', 'Twisty box'); tbox.primaryAxisSizingMode = 'FIXED'; tbox.counterAxisSizingMode = 'FIXED'; tbox.resize(20, 20);
        tbox.primaryAxisAlignItems = 'CENTER'; tbox.counterAxisAlignItems = 'CENTER'; tbox.appendChild(twisty); if (tw === 'Leaf') twisty.visible = false;
        c.appendChild(tbox);
        c.appendChild(await iconInst('Folder', bg === 'accent/container' ? 'accent/on-container' : 'text/2', 16, 'Icon'));
        const l = await text('Pictures', weight, fg, 'Label'); c.appendChild(l); fill(l); l.textTruncation = 'ENDING';
        vs.push(c);
      }
    const set = figma.combineAsVariants(vs, page); set.name = 'TreeItem';
    set.description = `A folder row in the tree: 40px pill, sm/Medium text/2. Selected: accent container, SemiBold. Nest a level by adding ${indent}px of left padding per level.`;
    const lk = set.addComponentProperty('Label', 'TEXT', 'Pictures'), ik = set.addComponentProperty('Icon', 'INSTANCE_SWAP', icon('Folder').id);
    for (const c of set.children) { c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: lk }; c.findOne(n => n.name === 'Icon').componentPropertyReferences = { mainComponent: ik }; }
    grid(set, 3, 256, 52);
    const hd = comp('HORIZONTAL', 'TreeHeading'); await pad(hd, 'space/12', 'space/14', 'space/4', 'space/14');
    const ht = await text('QUICK ACCESS', 'xs/Bold', 'text/2', 'Label'); ht.letterSpacing = { unit: 'PERCENT', value: 12 }; hd.appendChild(ht);
    ht.componentPropertyReferences = { characters: hd.addComponentProperty('Label', 'TEXT', 'QUICK ACCESS') };
    hd.description = 'A heading inside the tree: xs bold, uppercase, tracking caps, text/2.';
    await section('TreeView', [set, hd]);
  }
  if (!exists('ListRow')) {
    const vs = [];
    for (const [st, bg, trail] of [['Default', 'surface/2', 'text/3'], ['Hover', 'surface/3', 'text/1']]) {
      const c = comp('HORIZONTAL', `State=${st}`); c.counterAxisAlignItems = 'CENTER'; c.primaryAxisSizingMode = 'FIXED'; c.resize(420, 64); c.counterAxisSizingMode = 'AUTO';
      await pad(c, 'space/12', 'space/14', 'space/12', 'space/14'); await bindNum(c, 'itemSpacing', 'space/14'); await radius(c, 'radius/lg'); c.fills = [await paint(bg)];
      const tile = auto('HORIZONTAL', 'Icon tile'); tile.primaryAxisSizingMode = 'FIXED'; tile.counterAxisSizingMode = 'FIXED'; tile.resize(40, 40);
      tile.primaryAxisAlignItems = 'CENTER'; tile.counterAxisAlignItems = 'CENTER'; await radius(tile, 'radius/md'); tile.fills = [await paint('accent/container')];
      tile.appendChild(await iconInst('Keyboard', 'accent/on-container', 18, 'Icon')); c.appendChild(tile);
      const col = auto('VERTICAL', 'Text'); await bindNum(col, 'itemSpacing', 'space/2'); c.appendChild(col); fill(col);
      const t1 = await text('Keyboard shortcuts', 'md/SemiBold', 'text/1', 'Title'); col.appendChild(t1); fill(t1);
      const t2 = await text('Every key the app answers to', 'xs/Medium', 'text/2', 'Description'); col.appendChild(t2); fill(t2);
      c.appendChild(await iconInst('ChevronRight', trail, 18, 'Trail'));
      vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'ListRow';
    set.description = 'A tonal row that opens something (Help, settings): icon in an accent tile, title over a short description, a chevron. surface/2, radius lg.';
    const tk = set.addComponentProperty('Title', 'TEXT', 'Keyboard shortcuts'), dk = set.addComponentProperty('Description', 'TEXT', 'Every key the app answers to'), ik = set.addComponentProperty('Icon', 'INSTANCE_SWAP', icon('Keyboard').id);
    for (const c of set.children) { c.findOne(n => n.name === 'Title').componentPropertyReferences = { characters: tk }; c.findOne(n => n.name === 'Description').componentPropertyReferences = { characters: dk }; c.findOne(n => n.name === 'Icon').componentPropertyReferences = { mainComponent: ik }; }
    await section('ListRow', [column(set, 16)]);
  }
  if (!exists('DetailsPane')) {
    const iconSize = await ensureSize('size/details-pane-icon', 'details-pane-icon', 88);
    const c = comp('VERTICAL', 'DetailsPane'); c.counterAxisSizingMode = 'FIXED'; c.resize(288, 100); await bindNum(c, 'width', 'size/details-pane-width'); c.primaryAxisSizingMode = 'AUTO';
    await bindNum(c, 'itemSpacing', 'space/18'); await pad(c, 'space/16', 'space/16', 'space/16', 'space/16'); await radius(c, 'radius/3xl'); c.fills = [await paint('surface/1')];
    const hero = auto('VERTICAL', 'Hero'); hero.counterAxisAlignItems = 'CENTER'; await bindNum(hero, 'itemSpacing', 'space/12'); await pad(hero, 'space/18', null, 'space/4', null);
    c.appendChild(hero); fill(hero);
    const tile = auto('HORIZONTAL', 'Thumbnail'); tile.primaryAxisSizingMode = 'FIXED'; tile.counterAxisSizingMode = 'FIXED'; tile.resize(88, 88);
    tile.setBoundVariable('width', iconSize); tile.setBoundVariable('height', iconSize);
    tile.primaryAxisAlignItems = 'CENTER'; tile.counterAxisAlignItems = 'CENTER'; await radius(tile, 'radius/2xl'); tile.fills = [await paint('surface/2')];
    tile.appendChild(await iconInst('Gallery', 'text/3', 36, 'Placeholder')); hero.appendChild(tile);
    const name = await text('IMG_0042.jpg', 'lg/Bold', 'text/1', 'Name'); hero.appendChild(name); name.textAlignHorizontal = 'CENTER';
    const facts = auto('VERTICAL', 'Facts'); await bindNum(facts, 'itemSpacing', 'space/2'); c.appendChild(facts); fill(facts);
    const rows = [['Kind', 'JPEG image'], ['Size', '3.1 MB'], ['Dimensions', '4032 × 3024'], ['Modified', '12 Nov 2026']];
    for (let i = 0; i < rows.length; i++) {
      const r = auto('HORIZONTAL', `Fact ${i + 1}`); r.primaryAxisAlignItems = 'SPACE_BETWEEN'; r.counterAxisAlignItems = 'CENTER';
      await pad(r, 'space/8', 'space/12', 'space/8', 'space/12'); await bindNum(r, 'itemSpacing', 'space/12'); r.fills = [await paint('surface/2')];
      const big = i === 0 ? ['topLeftRadius', 'topRightRadius'] : i === rows.length - 1 ? ['bottomLeftRadius', 'bottomRightRadius'] : [];
      for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) r.setBoundVariable(f, v(big.includes(f) ? 'radius/lg' : 'radius/2xs'));
      r.appendChild(await text(rows[i][0], 'sm/Regular', 'text/2', 'Term'));
      r.appendChild(await text(rows[i][1], 'sm/Medium', 'text/1', 'Value'));
      facts.appendChild(r); fill(r);
    }
    const acts = auto('HORIZONTAL', 'Actions'); await bindNum(acts, 'itemSpacing', 'space/8'); c.appendChild(acts);
    for (const [label, ic] of [['Open', 'External'], ['Reveal', 'Folder']]) { const b = variantOf('Button', 'Style=Secondary, Size=sm').createInstance(); prop(b, 'Label', label); prop(b, 'Show icon', true); prop(b, 'Icon', icon(ic).id); acts.appendChild(b); }
    name.componentPropertyReferences = { characters: c.addComponentProperty('Name', 'TEXT', 'IMG_0042.jpg') };
    c.description = 'The details pane (288 wide): a thumbnail tile (88, radius 2xl), the name lg/Bold, facts as a stack of surface/2 rows (the first and last rounded lg), then actions.';
    await section('DetailsPane', [c], 'surface/bg');
  }
  if (!exists('StatusBar')) {
    const c = comp('HORIZONTAL', 'StatusBar'); c.primaryAxisSizingMode = 'FIXED'; c.resize(720, 34); c.counterAxisAlignItems = 'CENTER'; c.primaryAxisAlignItems = 'SPACE_BETWEEN';
    await bindNum(c, 'height', 'size/button-height-sm'); await bindNum(c, 'itemSpacing', 'space/12'); await pad(c, null, 'space/6', null, 'space/12');
    const left = auto('HORIZONTAL', 'Text'); await bindNum(left, 'itemSpacing', 'space/12'); c.appendChild(left);
    const t1 = await text('128 items', 'xs/Medium', 'text/2', 'Count'); left.appendChild(t1);
    const t2 = await text('1 selected · 3.1 MB', 'xs/Medium', 'text/2', 'Selection'); left.appendChild(t2);
    const end = auto('HORIZONTAL', 'End'); end.counterAxisAlignItems = 'CENTER'; await bindNum(end, 'itemSpacing', 'space/4'); c.appendChild(end);
    const vb = variantOf('IconButton', 'Size=xs, State=Default').createInstance(); prop(vb, 'Icon', icon('ViewTiles').id); end.appendChild(vb);
    t1.componentPropertyReferences = { characters: c.addComponentProperty('Count', 'TEXT', '128 items') };
    t2.componentPropertyReferences = { characters: c.addComponentProperty('Selection', 'TEXT', '1 selected · 3.1 MB') };
    c.description = 'The line under the content: counts in xs, text/2, tabular numbers; view controls at its end. At least 34 tall.';
    const dv = comp('HORIZONTAL', 'ToolbarDivider'); dv.primaryAxisSizingMode = 'FIXED'; dv.counterAxisSizingMode = 'FIXED'; dv.resize(9, 20);
    await pad(dv, null, 'space/4', null, 'space/4'); const line = figma.createRectangle(); line.name = 'Line'; line.resize(1, 20); line.fills = [await paint('surface/3')]; dv.appendChild(line);
    dv.description = 'A 1px divider between toolbar groups (surface/3, 20 tall, 4 either side).';
    await section('StatusBar', [c, dv]);
  }
  if (!exists('EmptyState')) {
    const c = comp('VERTICAL', 'EmptyState'); c.counterAxisSizingMode = 'FIXED'; c.resize(420, 100); c.primaryAxisSizingMode = 'AUTO'; c.counterAxisAlignItems = 'CENTER';
    await pad(c, 'space/32', 'space/16', 'space/32', 'space/16'); await bindNum(c, 'itemSpacing', 'space/12');
    c.appendChild(await iconInst('Gallery', 'text/3', 32, 'Icon'));
    const t = await text('Nothing here yet. Drop files in, or choose a folder.', 'md/Regular', 'text/3', 'Message'); c.appendChild(t); t.textAlignHorizontal = 'CENTER';
    t.componentPropertyReferences = { characters: c.addComponentProperty('Message', 'TEXT', t.characters) };
    c.children[0].componentPropertyReferences = { visible: c.addComponentProperty('Show icon', 'BOOLEAN', true) };
    c.description = 'What an empty view says: md, text/3, centred, padding 32/16.';
    await section('EmptyState', [c]);
  }
  if (!exists('Drawer')) {
    const c = comp('VERTICAL', 'Drawer (expanded)'); c.counterAxisSizingMode = 'FIXED'; c.resize(240, 100); await bindNum(c, 'width', 'size/drawer-expanded'); c.primaryAxisSizingMode = 'AUTO';
    await pad(c, 'space/24', 'space/16', 'space/16', 'space/16'); await bindNum(c, 'itemSpacing', 'space/16'); await radius(c, 'radius/3xl'); c.fills = [await paint('drawer/bg')];
    const head = auto('HORIZONTAL', 'Head'); head.counterAxisAlignItems = 'CENTER'; await bindNum(head, 'itemSpacing', 'space/8'); await pad(head, null, 'space/8', null, 'space/8'); c.appendChild(head);
    const mark = auto('HORIZONTAL', 'Mark'); mark.primaryAxisSizingMode = 'FIXED'; mark.counterAxisSizingMode = 'FIXED'; mark.resize(32, 32); mark.primaryAxisAlignItems = 'CENTER'; mark.counterAxisAlignItems = 'CENTER';
    await radius(mark, 'radius/md'); mark.fills = [await paint('accent/accent')]; mark.appendChild(await iconInst('FolderSolid', 'accent/on-accent', 18, 'Icon')); head.appendChild(mark);
    head.appendChild(await text('Pastel Studio', 'md/Bold', 'text/1', 'Name'));
    const items = auto('VERTICAL', 'Pages'); await bindNum(items, 'itemSpacing', 'space/10'); c.appendChild(items); fill(items);
    for (const [label, ic, act] of [['Files', 'Monitor', true], ['Collections', 'Gallery', false], ['Labels', 'Tag', false], ['Trash', 'Trash', false]]) {
      const it = variantOf('NavItem', `Layout=Expanded, Active=${act ? 'True' : 'False'}`).createInstance(); items.appendChild(it); fill(it); prop(it, 'Label', label); prop(it, 'Icon', icon(ic).id);
    }
    const sep = figma.createRectangle(); sep.name = 'Separator'; sep.resize(208, 1); sep.fills = [await paint('surface/3')]; c.appendChild(sep); fill(sep);
    const sec = auto('VERTICAL', 'Section: Quick access'); await bindNum(sec, 'itemSpacing', 'space/2'); c.appendChild(sec); fill(sec);
    const sh = auto('HORIZONTAL', 'Heading'); sh.counterAxisAlignItems = 'CENTER'; sh.primaryAxisSizingMode = 'FIXED'; await bindNum(sh, 'height', 'size/button-height-sm');
    await pad(sh, null, 'space/12', null, 'space/16'); await bindNum(sh, 'itemSpacing', 'space/10'); await radius(sh, 'radius/pill'); sec.appendChild(sh); fill(sh);
    const sht = await text('Quick access', 'xs/SemiBold', 'text/3', 'Label'); sh.appendChild(sht); fill(sht);
    sh.appendChild(await iconInst('ChevronDown', 'text/3', 14, 'Chevron'));
    for (const [label, ic] of [['Pictures', 'Folder'], ['Photos (D:)', 'Drive']]) {
      const row = variantOf('TreeItem', 'State=Default, Twisty=Leaf').createInstance(); sec.appendChild(row); fill(row); prop(row, 'Label', label); prop(row, 'Icon', icon(ic).id);
    }
    c.description = 'The drawer, expanded (240): the mark and the app’s name, the pages as NavItem (Expanded), a hairline, then foldable sections of places.';
    const rail = comp('VERTICAL', 'Drawer (rail)'); rail.counterAxisSizingMode = 'FIXED'; rail.resize(88, 100); rail.primaryAxisSizingMode = 'AUTO'; rail.counterAxisAlignItems = 'CENTER'; await bindNum(rail, 'width', 'size/drawer-rail');
    await pad(rail, 'space/24', null, 'space/16', null); await bindNum(rail, 'itemSpacing', 'space/12'); await radius(rail, 'radius/3xl'); rail.fills = [await paint('drawer/bg')];
    const rmark = mark.clone(); rail.appendChild(rmark);
    for (const [ic, act] of [['Monitor', true], ['Gallery', false], ['Tag', false], ['Trash', false]]) {
      const it = variantOf('NavItem', `Layout=Rail, Active=${act ? 'True' : 'False'}`).createInstance(); rail.appendChild(it); prop(it, 'Icon', icon(ic).id);
    }
    rail.description = 'The drawer as a rail (88): icons only, each with a tooltip; the active page in the accent pill.';
    await section('Drawer', [c, rail], 'surface/bg');
  }
}

// ══ 3. Pickers and feedback ══════════════════════════════
async function buildPickers() {
  startRow();
  await ensureTextStyle('sm/Bold', 12.75, 'Bold');
  if (!exists('SegmentedControl')) {
    const vs = [];
    for (const [sel, bg, fg] of [[false, null, 'text/2'], [true, 'accent/accent', 'accent/on-accent']]) {
      const c = comp('HORIZONTAL', `Selected=${sel ? 'True' : 'False'}`); c.counterAxisAlignItems = 'CENTER'; c.counterAxisSizingMode = 'FIXED'; c.resize(60, 32);
      await bindNum(c, 'height', 'size/icon-button-size-sm'); await pad(c, null, 'space/16', null, 'space/16'); await radius(c, 'radius/pill');
      if (bg) c.fills = [await paint(bg)];
      c.appendChild(await text('Tiles', 'sm/SemiBold', fg, 'Label')); vs.push(c);
    }
    const opt = figma.combineAsVariants(vs, page); opt.name = 'SegmentedOption';
    const k = opt.addComponentProperty('Label', 'TEXT', 'Tiles');
    for (const c of opt.children) c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: k };
    grid(opt, 2, 110, 48);
    const sc = comp('HORIZONTAL', 'SegmentedControl'); await pad(sc, 'space/4', 'space/4', 'space/4', 'space/4'); await bindNum(sc, 'itemSpacing', 'space/2');
    await radius(sc, 'radius/pill'); sc.fills = [await paint('surface/1')];
    for (const [label, sel] of [['Tiles', true], ['List', false], ['Details', false]]) { const o = opt.children.find(c => c.name === `Selected=${sel ? 'True' : 'False'}`).createInstance(); prop(o, 'Label', label); sc.appendChild(o); }
    sc.description = 'Pick one of a few: a track one step above its surface (surface/1 on the page, surface/2 on a card), the choice in the accent.';
    await section('SegmentedControl', [opt, sc], 'surface/bg');
  }
  if (!exists('Select')) {
    const vs = [];
    for (const [st, bg, txt, txtColor, open] of [['Default', 'field/bg', 'Name', 'text/1', false], ['Placeholder', 'field/bg', 'Choose…', 'text/3', false], ['Open', 'field/bg', 'Name', 'text/1', true]]) {
      const c = comp('HORIZONTAL', `State=${st}`); c.counterAxisAlignItems = 'CENTER'; c.primaryAxisSizingMode = 'FIXED'; c.resize(280, 44);
      await bindNum(c, 'height', 'size/field-height'); await pad(c, null, 'space/8', null, 'space/14'); await bindNum(c, 'itemSpacing', 'space/10'); await radius(c, 'radius/md');
      c.fills = [await paint(bg)];
      if (open) { c.strokes = [await paint('accent/accent')]; c.strokeWeight = 2; c.strokeAlign = 'INSIDE'; }
      const t = await text(txt, 'md/Regular', txtColor, 'Value'); c.appendChild(t); fill(t); t.textTruncation = 'ENDING';
      const chev = auto('HORIZONTAL', 'Chevron'); chev.primaryAxisSizingMode = 'FIXED'; chev.counterAxisSizingMode = 'FIXED'; chev.resize(28, 28);
      chev.primaryAxisAlignItems = 'CENTER'; chev.counterAxisAlignItems = 'CENTER'; await radius(chev, 'radius/pill');
      chev.fills = [await paint(open ? 'accent/accent' : 'row/bg')];
      const ci = await iconInst('ChevronDown', open ? 'accent/on-accent' : 'text/2', 16, 'Icon'); if (open) ci.rotation = 180; chev.appendChild(ci); c.appendChild(chev);
      vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'Select';
    set.description = 'A dropdown field (field/bg, 44, radius md) with a round chevron. Open: a 2px accent ring and the chevron in the accent; its list is a Menu.';
    const k = set.addComponentProperty('Value', 'TEXT', 'Name');
    for (const c of set.children) if (c.name !== 'State=Placeholder') c.findOne(n => n.name === 'Value').componentPropertyReferences = { characters: k };
    await section('Select', [column(set, 20)]);
  }
  if (!exists('Slider')) {
    const vs = [];
    for (const [size, track, knob] of [['md', 6, 16], ['sm', 4, 12]]) {
      const c = figma.createComponent(); c.name = `Size=${size}`; c.resize(240, 20); c.fills = []; c.clipsContent = false;
      const tr = figma.createRectangle(); tr.name = 'Track'; tr.resize(240, track); tr.y = (20 - track) / 2; tr.cornerRadius = 999; tr.fills = [await paint('surface/3')]; c.appendChild(tr);
      const fl = figma.createRectangle(); fl.name = 'Fill'; fl.resize(96, track); fl.y = (20 - track) / 2; fl.cornerRadius = 999; fl.fills = [await paint('accent/accent')]; c.appendChild(fl);
      const th = figma.createEllipse(); th.name = 'Thumb'; th.resize(knob, knob); th.x = 96 - knob / 2; th.y = (20 - knob) / 2;
      th.fills = [await paint('accent/accent')]; th.strokes = [await paint('surface/1')]; th.strokeWeight = 4; th.strokeAlign = 'OUTSIDE'; c.appendChild(th);
      tr.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'Slider';
    set.description = 'Track surface/3, fill and thumb in the accent, a 4px halo in the surface it sits on (surface/1 on a card). md track 6 / thumb 16; sm 4 / 12. Move Fill and Thumb together to set the value.';
    await section('Slider', [column(set, 28)]);
  }
  if (!exists('Tabs')) {
    const vs = [];
    for (const [act, bg, fg] of [[false, null, 'text/2'], [true, 'surface/2', 'text/1']]) {
      const c = comp('HORIZONTAL', `Active=${act ? 'True' : 'False'}`); c.counterAxisAlignItems = 'CENTER'; c.counterAxisSizingMode = 'FIXED'; c.resize(80, 40);
      await bindNum(c, 'height', 'size/icon-button-size'); await pad(c, null, 'space/16', null, 'space/16'); await bindNum(c, 'itemSpacing', 'space/8');
      c.setBoundVariable('topLeftRadius', v('radius/lg')); c.setBoundVariable('topRightRadius', v('radius/lg'));
      if (bg) c.fills = [await paint(bg)];
      c.appendChild(await text('General', 'md/SemiBold', fg, 'Label')); vs.push(c);
    }
    const tab = figma.combineAsVariants(vs, page); tab.name = 'Tab';
    const k = tab.addComponentProperty('Label', 'TEXT', 'General');
    for (const c of tab.children) c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: k };
    grid(tab, 2, 120, 56);
    const tabs = comp('VERTICAL', 'Tabs'); tabs.counterAxisSizingMode = 'FIXED'; tabs.resize(464, 100); tabs.primaryAxisSizingMode = 'AUTO';
    const list = auto('HORIZONTAL', 'List'); await bindNum(list, 'itemSpacing', 'space/4'); tabs.appendChild(list);
    for (const [label, act] of [['General', true], ['Appearance', false], ['Shortcuts', false]]) { const t = tab.children.find(c => c.name === `Active=${act ? 'True' : 'False'}`).createInstance(); prop(t, 'Label', label); list.appendChild(t); }
    const panel = auto('VERTICAL', 'Panel'); panel.counterAxisSizingMode = 'FIXED'; await pad(panel, 'space/20', 'space/20', 'space/20', 'space/20'); panel.fills = [await paint('surface/2')];
    for (const f of ['topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) panel.setBoundVariable(f, v('radius/lg'));
    tabs.appendChild(panel); fill(panel);
    const pt = await text('The panel shares the active tab’s colour, so they read as one folder.', 'md/Regular', 'text/2', 'Content'); panel.appendChild(pt); fill(pt); pt.textAutoResize = 'HEIGHT';
    tabs.description = 'Folder tabs on a dialog (surface/1): the active tab and its panel are surface/2. With the first tab active the panel’s top-left corner is square.';
    await section('Tabs', [tab, tabs]);
  }
  if (!exists('ListPicker')) {
    await ensureSize('size/list-picker-width', 'list-picker-width', 300);
    const elev = (await figma.getLocalEffectStylesAsync()).find(s => s.name === 'elevation/overlay');
    const c = comp('VERTICAL', 'ListPicker'); c.counterAxisSizingMode = 'FIXED'; c.resize(300, 100); await bindNum(c, 'width', 'size/list-picker-width'); c.primaryAxisSizingMode = 'AUTO';
    await radius(c, 'radius/lg'); c.fills = [await paint('surface/3')]; if (elev) await c.setEffectStyleIdAsync(elev.id);
    const sw = auto('VERTICAL', 'Search'); await pad(sw, 'space/8', 'space/8', 'space/4', 'space/8'); c.appendChild(sw); fill(sw);
    const sf = variantOf('SearchField', 'Filled=False').createInstance(); sw.appendChild(sf); fill(sf); prop(sf, 'Placeholder', 'Find or create a label');
    sf.fills = [await paint('surface/2')];
    const list = auto('VERTICAL', 'List'); await pad(list, 'space/4', 'space/6', 'space/6', 'space/6'); c.appendChild(list); fill(list);
    const hd = await text('Labels', 'xs/SemiBold', 'text/3', 'Heading'); const hw = auto('HORIZONTAL', 'Heading row'); await pad(hw, 'space/8', 'space/10', 'space/4', 'space/10'); hw.appendChild(hd); list.appendChild(hw);
    for (const [label, count, on] of [['Holidays', '42', true], ['Family', '128', false], ['Work', '9', false]]) {
      const r = auto('HORIZONTAL', `Row: ${label}`); r.counterAxisAlignItems = 'CENTER'; r.primaryAxisSizingMode = 'FIXED'; await bindNum(r, 'height', 'size/row-height');
      await pad(r, null, 'space/10', null, 'space/10'); await bindNum(r, 'itemSpacing', 'space/10'); await radius(r, 'radius/md'); list.appendChild(r); fill(r);
      const cb = variantOf('Checkbox', `Checked=${on ? 'True' : 'False'}`).createInstance(); r.appendChild(cb);
      if (!on) cb.fills = [await paint('surface/2')];
      const lt = await text(label, 'md/Regular', 'text/1', 'Label'); r.appendChild(lt); fill(lt);
      r.appendChild(await text(count, 'xs/Medium', 'text/3', 'Count'));
    }
    const cr = auto('HORIZONTAL', 'Create'); cr.counterAxisAlignItems = 'CENTER'; cr.primaryAxisSizingMode = 'FIXED'; await bindNum(cr, 'height', 'size/row-height');
    await pad(cr, null, 'space/10', null, 'space/10'); await bindNum(cr, 'itemSpacing', 'space/10'); await radius(cr, 'radius/md'); list.appendChild(cr); fill(cr);
    cr.appendChild(await iconInst('Plus', 'accent/text', 18, 'Icon')); cr.appendChild(await text('New label “Hol”', 'md/SemiBold', 'accent/text', 'Label'));
    c.description = 'A popover list to tick several (labels, collections): surface/3, radius lg, elevation/overlay; the search field and boxes a step down (surface/2); a create row in accent-text.';
    await section('ListPicker', [c], 'surface/bg');
  }
  if (!exists('Toast')) {
    const elev = (await figma.getLocalEffectStylesAsync()).find(s => s.name === 'elevation/overlay');
    const vs = [];
    for (const [tone, bg, fg, ic, msg] of [['Success', 'status/success-container', 'status/success', 'Check', 'Moved 3 files to Trips'], ['Info', 'accent/container', 'accent/on-container', 'Info', 'Scanning Photos (D:)…'], ['Warning', 'status/warning-container', 'status/warning', 'Info', 'Some files couldn’t be read'], ['Error', 'status/danger-container', 'status/danger', 'Close', 'Couldn’t rename the folder']]) {
      const c = comp('HORIZONTAL', `Tone=${tone}`); c.counterAxisAlignItems = 'CENTER';
      await pad(c, 'space/12', 'space/18', 'space/12', 'space/14'); await bindNum(c, 'itemSpacing', 'space/10'); await radius(c, 'radius/lg'); c.fills = [await paint(bg)];
      if (elev) await c.setEffectStyleIdAsync(elev.id);
      c.appendChild(await iconInst(ic, fg, 18, 'Icon'));
      c.appendChild(await text(msg, 'md/Medium', 'text/1', 'Message')); vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'Toast';
    set.description = 'A short notice at the top right (up to 380 wide): the tone’s container colour, its icon in the tone, md/Medium text/1, elevation/overlay.';
    const k = set.addComponentProperty('Message', 'TEXT', 'Moved 3 files to Trips');
    for (const c of set.children) c.findOne(n => n.name === 'Message').componentPropertyReferences = { characters: k };
    const { w } = stackGrid(set);
    await section('Toast', [grid(set, 2, w, 64)], 'surface/bg');
  }
  if (!exists('StatusChip')) {
    const vs = [];
    for (const [tone, dot] of [['Idle', 'text/3'], ['Live', 'accent/accent'], ['Paused', 'status/warning']]) {
      const c = comp('HORIZONTAL', `Tone=${tone}`); c.counterAxisAlignItems = 'CENTER'; c.counterAxisSizingMode = 'FIXED'; c.resize(100, 36);
      await pad(c, null, 'space/4', null, 'space/4'); await bindNum(c, 'itemSpacing', 'space/4'); await radius(c, 'radius/pill'); c.fills = [await paint('surface/1')];
      const main = auto('HORIZONTAL', 'Main'); main.counterAxisAlignItems = 'CENTER'; main.counterAxisSizingMode = 'FIXED'; await bindNum(main, 'height', 'size/icon-button-size-xs');
      await pad(main, null, 'space/10', null, 'space/10'); await bindNum(main, 'itemSpacing', 'space/8'); await radius(main, 'radius/pill'); c.appendChild(main);
      const d = figma.createEllipse(); d.name = 'Dot'; d.resize(8, 8); d.fills = [await paint(dot)]; main.appendChild(d);
      main.appendChild(await text('Scanning', 'sm/SemiBold', 'text/1', 'Label'));
      main.appendChild(await text('1,204', 'sm/Bold', 'accent/text', 'Value'));
      vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'StatusChip';
    set.description = 'What is happening, in the top bar: a dot (text/3 idle, accent live, warning paused), a label sm/SemiBold and a value in bold accent-text, on surface/1.';
    const lk = set.addComponentProperty('Label', 'TEXT', 'Scanning'), vk = set.addComponentProperty('Value', 'TEXT', '1,204');
    for (const c of set.children) { c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: lk }; c.findOne(n => n.name === 'Value').componentPropertyReferences = { characters: vk }; }
    const { w } = stackGrid(set);
    await section('StatusChip', [grid(set, 3, w, 56)], 'surface/bg');
  }
  if (!exists('Spinner')) {
    const vs = [];
    for (const [size, px] of [['sm', 32], ['lg', 50]]) {
      const c = figma.createComponent(); c.name = `Size=${size}`; c.resize(px, px); c.fills = []; c.clipsContent = false;
      const ratio = 1 - (2 * 5 / 50); // the code's ring: stroke 5 in a 50 box
      const track = figma.createEllipse(); track.name = 'Track'; track.resize(px, px); track.arcData = { startingAngle: 0, endingAngle: 2 * Math.PI, innerRadius: ratio }; track.fills = [await paint('surface/3')]; c.appendChild(track);
      const arc = figma.createEllipse(); arc.name = 'Arc'; arc.resize(px, px); arc.arcData = { startingAngle: -Math.PI / 2, endingAngle: -Math.PI / 2 + 2 * Math.PI * 0.3, innerRadius: ratio }; arc.fills = [await paint('accent/accent')]; c.appendChild(arc);
      vs.push(c);
    }
    const set = figma.combineAsVariants(vs, page); set.name = 'Spinner';
    set.description = 'Working: a surface/3 ring with an accent arc that turns. sm 32 (the icon-button size), lg 50.';
    await section('Spinner', [grid(set, 2, 80, 80)], 'surface/bg');
  }
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  page = figma.root.children.find(p => p.name === 'Components');
  if (!page) throw new Error('No page named "Components". Run this in the Pastel Studio DS file.');
  await figma.setCurrentPageAsync(page);
  for (const s of ['Regular', 'Medium', 'SemiBold', 'Bold']) await figma.loadFontAsync({ family: 'Geist', style: s });
  for (const x of await figma.variables.getLocalVariablesAsync()) V[x.name] = x;
  STY = await figma.getLocalTextStylesAsync();
  figma.notify('Building dialogs…', { timeout: 1500 });
  await buildDialogs();
  figma.notify('Building explorer pieces…', { timeout: 1500 });
  await buildExplorer();
  figma.notify('Building pickers and feedback…', { timeout: 1500 });
  await buildPickers();
}

main()
  .then(() => figma.closePlugin(log.length ? `Done: ${log.filter(l => l.startsWith('+ ') && !l.includes('variable') && !l.includes('text style')).length} sections added.` : 'Nothing to add: everything is already there.'))
  .catch(err => { console.error(err); figma.closePlugin(`Stopped: ${err.message}. What was built before it stays; run again after fixing.`); });
