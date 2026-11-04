// The inspector: every setting of the selection, one section per concern. A change applies to every
// selected element that has the setting; the first selected one shows the current values.
import React, { useMemo } from 'react';
import * as PS from '@pastel-studio/react';
import { IconBookmark, IconButton, IconCopy, IconPlus, IconTrash, Switch } from '@pastel-studio/react';
import { catalogEntry, enumValues, HIDDEN_PROPS, isCallback, type PropDoc } from '../data/components';
import { FONT_SIZES, FONT_WEIGHTS, LEADINGS, RADII, SPACE } from '../data/tokens';
import { deleteSelection, duplicateSelection, updateNode } from '../model/actions';
import { FRAME_PRESETS } from '../model/factory';
import { currentPage, getState, useEditor } from '../model/store';
import { addVariant, blockUsage, detachInstance, editInstanceBlock, makeBlock } from '../model/blocks';
import { edit } from '../model/store';
import { uid } from '../model/types';
import { hasOverride, lookup, resetOverride } from '../model/virtual';
import { isToken, type CanvasNode, type Size, type StackLayout, type Style } from '../model/types';
import { Buttons, Choice, ColorField, JsonField, NumberInput, Row, TextInput, TokenField } from './controls';

const ICONS = Object.keys(PS).filter((k) => /^Icon[A-Z]/.test(k)).sort();

/** Applies a change to every selected element; quick repeats of one field are one undo step. */
function change(field: string, fn: (n: CanvasNode) => void) {
  const ids = getState().selection;
  for (const id of ids) updateNode(id, fn, `inspector:${field}:${ids.join()}`);
}
const setStyle = <K extends keyof Style>(key: K, v: Style[K]) => change(`style.${key}`, (n) => { if (v === undefined) delete n.style[key]; else n.style[key] = v; });
const setStack = <K extends keyof StackLayout>(key: K, v: StackLayout[K]) => change(`stack.${key}`, (n) => { if (n.stack) { if (v === undefined) delete n.stack[key]; else n.stack[key] = v; } });
const off = (...vs: (string | undefined)[]) => vs.some((v) => v !== undefined && v !== '' && !isToken(v));

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="cv-insp-section">
      <div className="cv-panel-head"><span className="ps-overline">{title}</span>{aside}</div>
      {children}
    </section>
  );
}

function SizeRow({ axis, size, measured }: { axis: 'width' | 'height'; size: Size; measured?: number }) {
  const label = axis === 'width' ? 'Width' : 'Height';
  return (
    <Row label={label}>
      <Buttons
        label={`${label} mode`}
        value={size.mode}
        options={[{ value: 'fixed', label: 'Fixed' }, { value: 'fill', label: 'Fill' }, { value: 'fit', label: 'Fit' }]}
        onChange={(mode) => change(axis, (n) => { n[axis] = mode === 'fixed' ? { mode, value: size.mode === 'fixed' ? size.value : Math.round(measured ?? 100) } : { mode }; })}
      />
      {size.mode === 'fixed' && <NumberInput label={axis === 'width' ? 'W' : 'H'} value={size.value} min={1} onChange={(value) => change(axis, (n) => { n[axis] = { mode: 'fixed', value }; })} />}
    </Row>
  );
}

function measure(id: string): { w?: number; h?: number } {
  const el = document.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(id)}"]`);
  return el ? { w: el.offsetWidth, h: el.offsetHeight } : {};
}

function LayoutSection({ node }: { node: CanvasNode }) {
  const st = node.stack;
  const frame = node.type === 'frame';
  return (
    <Section title="Layout">
      <Row label="Children">
        <Buttons
          label="Layout"
          value={st ? st.direction : 'free'}
          options={[
            ...(frame ? [{ value: 'free' as const, label: 'Free', title: 'Place children anywhere' }] : []),
            { value: 'column' as const, label: 'Column', title: 'Stack vertically' },
            { value: 'row' as const, label: 'Row', title: 'Stack horizontally' },
          ]}
          onChange={(v) => change('stack', (n) => {
            if (v === 'free') { delete n.stack; return; }
            n.stack = { gap: '--ps-space-16', align: 'start', ...n.stack, direction: v };
          })}
        />
      </Row>
      {st && (
        <>
          <Row label="Gap" off={off(st.gap)}><TokenField label="Gap" value={st.gap} tokens={SPACE} onChange={(v) => setStack('gap', v)} /></Row>
          <Row label="Padding" off={off(st.padY, st.padX)}>
            <div className="cv-pair">
              <TokenField label="Padding top and bottom" value={st.padY} tokens={SPACE} onChange={(v) => setStack('padY', v)} />
              <TokenField label="Padding left and right" value={st.padX} tokens={SPACE} onChange={(v) => setStack('padX', v)} />
            </div>
            <span className="cv-hint">Top and bottom · left and right</span>
          </Row>
          <Row label="Align">
            <Buttons label="Align" value={st.align ?? 'start'} onChange={(v) => setStack('align', v)} options={[{ value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' }, { value: 'stretch', label: 'Stretch' }]} />
          </Row>
          <Row label="Distribute">
            <Buttons label="Distribute" value={st.justify ?? 'start'} onChange={(v) => setStack('justify', v)} options={[{ value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' }, { value: 'between', label: 'Between' }]} />
          </Row>
          <Switch label="Wrap" layout="inline" checked={!!st.wrap} onChange={(v) => setStack('wrap', v || undefined)} />
        </>
      )}
    </Section>
  );
}

function PropField({ prop, value, onChange }: { prop: PropDoc; value: unknown; onChange: (v: unknown) => void }) {
  const values = enumValues(prop);
  const hint = `${prop.type}${prop.defaultValue ? ` · default ${prop.defaultValue}` : ''}${prop.description ? `\n${prop.description}` : ''}`;
  if (values && values.every((v) => typeof v === 'boolean')) {
    return <Switch label={prop.name} layout="inline" checked={!!value} onChange={onChange} />;
  }
  if (values) {
    return (
      <Row label={prop.name} hint={hint}>
        <select className="ps-input cv-input" aria-label={prop.name} value={value === undefined ? '' : String(value)} onChange={(e) => {
          const v = values.find((x) => String(x) === e.target.value);
          onChange(e.target.value === '' ? undefined : v);
        }}>
          <option value="">{prop.defaultValue ? `Default (${prop.defaultValue.replace(/'/g, '')})` : 'Not set'}</option>
          {values.map((v) => <option key={String(v)} value={String(v)}>{String(v)}</option>)}
        </select>
      </Row>
    );
  }
  if (prop.type === 'boolean') return <Switch label={prop.name} layout="inline" checked={!!value} onChange={onChange} />;
  if (prop.type === 'number') return <Row label={prop.name} hint={hint}><NumberInput label={prop.name} value={typeof value === 'number' ? value : undefined} onChange={onChange} /></Row>;
  if (prop.type === 'string') return <Row label={prop.name} hint={hint}><TextInput label={prop.name} value={typeof value === 'string' ? value : ''} onChange={(v) => onChange(v === '' ? undefined : v)} /></Row>;
  if (/ReactNode|ReactElement|Element/.test(prop.type)) {
    const icon = value && typeof value === 'object' && '$icon' in value ? String((value as { $icon: string }).$icon) : undefined;
    const kind = value === undefined || value === null ? 'none' : icon ? 'icon' : typeof value === 'string' || typeof value === 'number' ? 'text' : 'json';
    return (
      <Row label={prop.name} hint={hint}>
        <Buttons label={`${prop.name} content`} value={kind} onChange={(k) => onChange(k === 'none' ? undefined : k === 'icon' ? { $icon: 'IconStar' } : k === 'text' ? prop.name : value)} options={[{ value: 'text', label: 'Text' }, { value: 'icon', label: 'Icon' }, { value: 'none', label: 'None' }]} />
        {kind === 'text' && <TextInput label={prop.name} value={String(value)} onChange={onChange} />}
        {kind === 'icon' && <Choice label={`${prop.name} icon`} value={icon} options={ICONS.map((i) => ({ value: i, label: i.replace(/^Icon/, '') }))} onChange={(v) => onChange({ $icon: v })} />}
        {kind === 'json' && <JsonField label={prop.name} value={value} onChange={onChange} />}
      </Row>
    );
  }
  return <Row label={prop.name} hint={hint}><JsonField label={prop.name} value={value} onChange={onChange} /></Row>;
}

function PropsSection({ node }: { node: CanvasNode }) {
  const spec = node.component!;
  const entry = catalogEntry(spec.name);
  const props = (entry?.props ?? []).filter((p) => !HIDDEN_PROPS.has(p.name) && !isCallback(p) && p.name !== 'labels');
  const setProp = (name: string, v: unknown) => change(`prop.${name}`, (n) => {
    if (!n.component) return;
    if (v === undefined) delete n.component.props[name];
    else n.component.props[name] = v;
  });
  return (
    <Section title={spec.name}>
      {entry && <p className="cv-muted cv-insp-summary">{entry.summary}</p>}
      {props.map((p) => <PropField key={p.name} prop={p} value={spec.props[p.name]} onChange={(v) => setProp(p.name, v)} />)}
    </Section>
  );
}

function InstanceSection({ node }: { node: CanvasNode }) {
  const block = useEditor((s) => s.pages[node.instance!.block]);
  const used = useEditor((s) => blockUsage(node.instance!.block, s.pages));
  const overrides = Object.keys(node.instance!.overrides).length;
  if (!block) return <Section title="Block"><p className="cv-error">This block is missing from the library.</p></Section>;
  return (
    <Section title="Block" aside={<PS.TextButton size="xs" onClick={() => editInstanceBlock(node.id)}>Edit block</PS.TextButton>}>
      <p className="cv-muted cv-insp-summary">{block.name} · used {used} time{used === 1 ? '' : 's'}{block.shared ? ' · shared library' : ''}</p>
      {block.frames.length > 1 && (
        <Row label="Variant">
          <Choice label="Variant" value={node.instance!.variant ?? block.frames[0].id} options={block.frames.map((f) => ({ value: f.id, label: f.name }))} onChange={(v) => change('variant', (x) => { if (x.instance) x.instance.variant = v === block.frames[0].id ? undefined : v; })} />
        </Row>
      )}
      <div className="cv-row">
        {overrides > 0 && <PS.Button size="sm" onClick={() => change('overrides', (x) => { if (x.instance) x.instance.overrides = {}; })}>Reset {overrides} override{overrides === 1 ? '' : 's'}</PS.Button>}
        <PS.Button size="sm" onClick={() => detachInstance(node.id)}>Detach</PS.Button>
      </div>
      <p className="cv-hint">Double-click inside the instance to change its text, images or props for this copy only.</p>
    </Section>
  );
}

const BP_PRESETS = [{ name: 'Tablet', width: 834 }, { name: 'Phone', width: 390 }];

function BreakpointsSection({ node }: { node: CanvasNode }) {
  const list = node.breakpoints ?? [];
  const add = (name: string, width: number) => change('breakpoints', (x) => {
    (x.breakpoints ??= []).push({ id: uid(), name, width, overrides: {} });
  });
  return (
    <Section title="Breakpoints" aside={<PS.TextButton size="xs" onClick={() => add(`Width ${list.length + 1}`, 600)}>Custom</PS.TextButton>}>
      {list.map((b) => (
        <Row key={b.id} label={b.name}>
          <div className="cv-pair">
            <NumberInput label="W" value={b.width} min={240} onChange={(v) => change(`bp.${b.id}`, (x) => { const t = x.breakpoints?.find((y) => y.id === b.id); if (t) t.width = v; })} />
            <span className="cv-hint">{Object.keys(b.overrides).length} changed</span>
          </div>
        </Row>
      ))}
      <div className="cv-row">
        {BP_PRESETS.filter((p) => !list.some((b) => b.name === p.name)).map((p) => (
          <PS.Button key={p.name} size="sm" icon={<IconPlus size={14} />} onClick={() => add(p.name, p.width)}>{p.name} · {p.width}</PS.Button>
        ))}
      </div>
      {!list.length && <p className="cv-hint">The same layout at another width, beside this frame. Whatever you change there is kept for that width.</p>}
    </Section>
  );
}

export function Inspector() {
  const page = useEditor((s) => currentPage(s));
  const pages = useEditor((s) => s.pages);
  const selected = useEditor((s) => s.selection[0]);
  const node = useMemo(() => (page && selected ? lookup(page, selected, pages) : undefined), [page, pages, selected]);
  const count = useEditor((s) => s.selection.length);
  const assets = useEditor((s) => s.library.assets);

  if (!node) {
    return (
      <div className="cv-inspector cv-empty">
        <p className="cv-muted">Select something on the canvas or in the layers to see its settings.</p>
        <ul className="cv-muted cv-shortcuts">
          <li><kbd>Ctrl</kbd> + wheel, or pinch: zoom</li>
          <li>Wheel, or <kbd>Space</kbd> + drag: pan</li>
          <li>Double-click: go inside, or type into text</li>
          <li><kbd>Esc</kbd>: select the parent</li>
          <li><kbd>Ctrl</kbd> + click: select the deepest element</li>
          <li><kbd>Ctrl</kbd> + <kbd>G</kbd>: wrap in a stack</li>
          <li><kbd>Shift</kbd> + <kbd>1</kbd>: zoom to fit</li>
        </ul>
      </div>
    );
  }

  const n = node.node;
  const s = n.style;
  const theme = (node.path[0] ?? n).theme ?? 'dark';
  const bpFrame = node.virtual === 'breakpoint-frame';
  const positioned = !bpFrame && (!node.parent || !node.parent.stack || !!n.absolute);
  const where = node.virtual === 'breakpoint' ? `the ${node.path[0]?.name ?? 'breakpoint'} breakpoint` : node.virtual === 'instance' ? 'this instance' : undefined;
  const overridden = !!where && !!page && hasOverride(page, n.id);
  const blockPage = page?.kind === 'block';
  const m = measure(n.id);
  const container = n.type === 'frame' || n.type === 'stack';

  return (
    <div className="cv-inspector cv-scroll">
      <div className="cv-insp-head">
        <input className="ps-input cv-input cv-name" aria-label="Name" value={n.name} onChange={(e) => change('name', (x) => { x.name = e.target.value; })} />
        {!node.virtual && node.parent && <IconButton size="sm" label="Make a block (Ctrl+Alt+K)" onClick={() => makeBlock()}><IconBookmark size={16} /></IconButton>}
        {!node.virtual && <IconButton size="sm" label="Duplicate (Ctrl+D)" onClick={duplicateSelection}><IconCopy size={16} /></IconButton>}
        <IconButton size="sm" tone="danger" label={bpFrame ? 'Remove this breakpoint' : node.virtual ? 'Hide here (Del)' : 'Delete (Del)'} onClick={deleteSelection}><IconTrash size={16} /></IconButton>
      </div>
      {count > 1 && <p className="cv-muted cv-pad">{count} selected: changes apply to all of them.</p>}
      {where && (
        <div className="cv-scope">
          <span>Changes here apply only to {where}.</span>
          {overridden && <PS.TextButton size="xs" onClick={() => edit((d) => resetOverride(d, n.id))}>Reset</PS.TextButton>}
        </div>
      )}

      {n.type === 'instance' && n.instance && !node.virtual && <InstanceSection node={n} />}

      {bpFrame && (
        <Section title="Breakpoint">
          <Row label="Name"><TextInput label="Breakpoint name" value={n.name} onChange={(v) => change('name', (x) => { x.name = v; })} /></Row>
          <p className="cv-muted">Its elements follow the main frame. What you change at this width is kept for this width only.</p>
        </Section>
      )}

      {n.type === 'frame' && !node.parent && !bpFrame && blockPage && (
        <Section title="Variant" aside={<PS.TextButton size="xs" onClick={addVariant}>Add variant</PS.TextButton>}>
          <p className="cv-muted">This frame is a variant of the block. Instances can show any variant, and their overrides follow them from one to another.</p>
        </Section>
      )}

      {n.type === 'frame' && !node.parent && !bpFrame && !blockPage && <BreakpointsSection node={n} />}

      {n.type === 'frame' && !node.parent && !bpFrame && (
        <Section title="Frame">
          <Row label="Size">
            <select className="ps-input cv-input" aria-label="Frame size" value="" onChange={(e) => {
              const p = FRAME_PRESETS.find((x) => x.name === e.target.value);
              if (p) change('preset', (x) => { x.width = { mode: 'fixed', value: p.width }; x.height = { mode: 'fixed', value: p.height }; });
            }}>
              <option value="">Choose a size…</option>
              {FRAME_PRESETS.map((p) => <option key={p.name} value={p.name}>{p.name} · {p.width} × {p.height}</option>)}
            </select>
          </Row>
          <Row label="Theme">
            <Buttons label="Theme" value={n.theme ?? 'dark'} onChange={(v) => change('theme', (x) => { x.theme = v; })} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} />
          </Row>
        </Section>
      )}

      <Section title="Position and size">
        {node.parent?.stack && <Switch label="Absolute (out of the stack)" layout="inline" checked={!!n.absolute} onChange={(v) => change('absolute', (x) => {
          x.absolute = v || undefined;
          if (v && x.x === undefined) { x.x = 0; x.y = 0; }
        })} />}
        {positioned && (
          <Row label="Position">
            <div className="cv-pair">
              <NumberInput label="X" value={n.x ?? 0} onChange={(v) => change('x', (x) => { x.x = v; })} />
              <NumberInput label="Y" value={n.y ?? 0} onChange={(v) => change('y', (x) => { x.y = v; })} />
            </div>
          </Row>
        )}
        <SizeRow axis="width" size={n.width} measured={m.w} />
        <SizeRow axis="height" size={n.height} measured={m.h} />
      </Section>

      {container && <LayoutSection node={n} />}

      {n.type === 'component' && <PropsSection node={n} />}

      {n.type === 'text' && (
        <Section title="Text">
          <TextInput label="Text" multiline value={n.text ?? ''} onChange={(v) => change('text', (x) => { x.text = v; })} />
          <Row label="Size" off={off(s.fontSize)}><TokenField label="Size" value={s.fontSize} tokens={FONT_SIZES} onChange={(v) => setStyle('fontSize', v)} rawPlaceholder="18px" /></Row>
          <Row label="Weight" off={off(s.fontWeight)}><TokenField label="Weight" value={s.fontWeight} tokens={FONT_WEIGHTS} onChange={(v) => setStyle('fontWeight', v)} rawPlaceholder="500" /></Row>
          <Row label="Line height" off={off(s.lineHeight)}><TokenField label="Line height" value={s.lineHeight} tokens={LEADINGS} onChange={(v) => setStyle('lineHeight', v)} rawPlaceholder="1.4" /></Row>
          <Row label="Color" off={off(s.color)}><ColorField label="Text color" theme={theme} value={s.color} onChange={(v) => setStyle('color', v)} /></Row>
          <Row label="Align"><Buttons label="Text align" value={s.textAlign ?? 'left'} onChange={(v) => setStyle('textAlign', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Row>
        </Section>
      )}

      {n.type === 'icon' && (
        <Section title="Icon">
          <Row label="Icon"><Choice label="Icon" value={n.icon} options={ICONS.map((i) => ({ value: i, label: i.replace(/^Icon/, '') }))} onChange={(v) => change('icon', (x) => { x.icon = v; })} /></Row>
          <Row label="Color" off={off(s.color)}><ColorField label="Icon color" theme={theme} value={s.color} onChange={(v) => setStyle('color', v)} /></Row>
        </Section>
      )}

      {n.type === 'image' && (
        <Section title="Image">
          <Row label="Image">
            <Choice label="Image" value={n.asset} options={assets.map((a) => ({ value: a.id, label: a.name }))} onChange={(v) => change('asset', (x) => { x.asset = v; })} />
          </Row>
          <Row label="Fit"><Buttons label="Fit" value={s.fit ?? 'cover'} onChange={(v) => setStyle('fit', v)} options={[{ value: 'cover', label: 'Fill the box' }, { value: 'contain', label: 'Show it all' }]} /></Row>
        </Section>
      )}

      {n.type !== 'icon' && (
        <Section title="Fill">
          <Row label="Color" off={off(s.fill)}><ColorField label="Fill" theme={theme} value={s.fill} onChange={(v) => setStyle('fill', v)} /></Row>
        </Section>
      )}

      {n.type !== 'text' && n.type !== 'icon' && (
        <Section title="Border and corners">
          <Row label="Border">
            <div className="cv-pair">
              <NumberInput label="Width" value={s.borderWidth ?? 0} min={0} suffix="px" onChange={(v) => setStyle('borderWidth', v || undefined)} />
              <Choice label="Border style" value={s.borderStyle ?? 'solid'} options={[{ value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }]} onChange={(v) => setStyle('borderStyle', v)} />
            </div>
          </Row>
          {!!s.borderWidth && <Row label="Border color" off={off(s.borderColor)}><ColorField label="Border color" theme={theme} value={s.borderColor} onChange={(v) => setStyle('borderColor', v)} /></Row>}
          <Row label="Radius" off={off(s.radius)}><TokenField label="Radius" value={s.radius} tokens={RADII} onChange={(v) => setStyle('radius', v)} /></Row>
        </Section>
      )}

      <Section title="Effects">
        <Row label="Elevation">
          <Buttons label="Elevation" value={s.elevation ?? 'none'} onChange={(v) => setStyle('elevation', v === 'none' ? undefined : v)} options={[{ value: 'none', label: 'Flat' }, { value: 'overlay', label: 'Floating', title: 'The shadow of menus and dialogs: only for floating layers' }]} />
        </Row>
        <Row label="Opacity">
          <NumberInput label="Opacity" value={Math.round((s.opacity ?? 1) * 100)} min={0} max={100} suffix="%" onChange={(v) => setStyle('opacity', v >= 100 ? undefined : v / 100)} />
        </Row>
      </Section>
    </div>
  );
}
