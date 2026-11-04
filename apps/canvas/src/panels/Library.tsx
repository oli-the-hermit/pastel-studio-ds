// The asset library: the design system's components, icons and tokens, and the person's own blocks
// and images (Organized.tsx). Every kind is searchable, can be starred, and remembers what was used
// last. Click an item to add it where the selection is, or drag it onto a frame.
import React, { useMemo, useState } from 'react';
import * as PS from '@pastel-studio/react';
import { IconStar, SearchField, SegmentedControl, cx } from '@pastel-studio/react';
import { CATALOG, catalogEntry, defaultProps } from '../data/components';
import { COLOR_GROUPS, FONT_SIZES, RADII, SPACE, shortName } from '../data/tokens';
import { insertNodes, updateNode } from '../model/actions';
import { currentPage, getState, useEditor } from '../model/store';
import { nodesFor, setDragPayload, type ElementKind, type Payload } from '../model/payload';
import { find } from '../model/tree';
import { materialize } from '../canvas/RenderNode';
import { noteUsed, toggleStar, usePref } from './prefs';
import { OrganizedView } from './Organized';

const registry = PS as unknown as Record<string, React.ComponentType<Record<string, unknown>> | undefined>;
const ICONS = Object.keys(PS).filter((k) => /^Icon[A-Z]/.test(k)).sort();

const keyOf = (p: Payload) => (p.kind === 'component' || p.kind === 'icon' ? `${p.kind}:${p.name}` : p.kind === 'asset' || p.kind === 'block' ? `${p.kind}:${p.id}` : `element:${p.element}`);

function add(p: Payload) {
  noteUsed(keyOf(p));
  insertNodes(nodesFor(p));
}

function Item({ payload, label, title, children, className }: { payload: Payload; label: string; title?: string; children: React.ReactNode; className?: string }) {
  const [stars] = usePref<string[]>('stars', []);
  const key = keyOf(payload);
  const starred = stars.includes(key);
  return (
    <div
      className={cx('cv-lib-item', className)}
      role="button"
      tabIndex={0}
      title={title ?? label}
      draggable
      onDragStart={(e) => { setDragPayload(e, payload); noteUsed(key); }}
      onClick={() => add(payload)}
      onKeyDown={(e) => { if (e.key === 'Enter') add(payload); }}
    >
      <div className="cv-lib-thumb">{children}</div>
      <span className="cv-lib-name">{label}</span>
      {payload.kind !== 'element' && (
        <button type="button" className={cx('cv-star', starred && 'is-active')} aria-label={starred ? 'Unstar' : 'Star'} aria-pressed={starred} onClick={(e) => { e.stopPropagation(); toggleStar(key); }}>
          <IconStar size={13} />
        </button>
      )}
    </div>
  );
}

class Quiet extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** A component drawn small, as it really looks. */
function ComponentThumb({ name }: { name: string }) {
  const Comp = registry[catalogEntry(name)?.exportName ?? name];
  const props = useMemo(() => materialize(defaultProps(name)) as Record<string, unknown>, [name]);
  if (!Comp) return null;
  return (
    <div className="cv-comp-thumb" ref={(el) => el?.setAttribute('inert', '')}>
      <Quiet><Comp {...props} /></Quiet>
    </div>
  );
}

const ELEMENTS: { element: ElementKind; label: string; icon: string }[] = [
  { element: 'frame', label: 'Frame', icon: 'IconMonitor' },
  { element: 'column', label: 'Stack', icon: 'IconViewList' },
  { element: 'row', label: 'Row', icon: 'IconViewTiles' },
  { element: 'heading', label: 'Heading', icon: 'IconFont' },
  { element: 'text', label: 'Text', icon: 'IconFileText' },
  { element: 'rect', label: 'Rectangle', icon: 'IconLayers' },
  { element: 'image', label: 'Image', icon: 'IconFileImage' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const I = registry[name];
  return I ? <I size={size} /> : null;
}

function Section({ title, count, children, defaultOpen = true }: { title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = usePref<boolean>(`section:${title}`, defaultOpen);
  return (
    <section className="cv-lib-section">
      <button type="button" className="cv-lib-section-title" aria-expanded={open} onClick={() => setOpen(!open)}>
        <PS.IconChevronDown size={14} className={cx('cv-chevron', !open && 'is-closed')} />
        {title}
        {count !== undefined && <span className="cv-count">{count}</span>}
      </button>
      {open && children}
    </section>
  );
}

const matches = (q: string, ...texts: (string | undefined)[]) => !q || texts.some((t) => t?.toLowerCase().includes(q.toLowerCase()));

function ComponentsView({ query }: { query: string }) {
  const [stars] = usePref<string[]>('stars', []);
  const [recent] = usePref<string[]>('recent', []);
  const list = CATALOG.filter((c) => matches(query, c.name, c.summary, c.group));
  const byKey = (keys: string[]) => keys.filter((k) => k.startsWith('component:')).map((k) => CATALOG.find((c) => `component:${c.name}` === k)).filter((c): c is (typeof CATALOG)[number] => !!c);
  const tile = (c: (typeof CATALOG)[number]) => (
    <Item key={c.name} payload={{ kind: 'component', name: c.name }} label={c.name} title={c.summary}><ComponentThumb name={c.name} /></Item>
  );
  const groups = [...new Set(list.map((c) => c.group))];
  return (
    <>
      {!query && (
        <Section title="Basics">
          <div className="cv-lib-grid cv-lib-grid--small">
            {ELEMENTS.map((e) => <Item key={e.element} payload={{ kind: 'element', element: e.element }} label={e.label}><Icon name={e.icon} size={20} /></Item>)}
          </div>
        </Section>
      )}
      {!query && byKey(stars).length > 0 && <Section title="Starred"><div className="cv-lib-grid">{byKey(stars).map(tile)}</div></Section>}
      {!query && byKey(recent).length > 0 && <Section title="Recently used" defaultOpen={false}><div className="cv-lib-grid">{byKey(recent).slice(0, 6).map(tile)}</div></Section>}
      {groups.map((g) => {
        const items = list.filter((c) => c.group === g);
        return <Section key={g} title={g} count={items.length} defaultOpen={!!query}><div className="cv-lib-grid">{items.map(tile)}</div></Section>;
      })}
      {!list.length && <p className="cv-muted">No component matches “{query}”.</p>}
    </>
  );
}

function IconsView({ query }: { query: string }) {
  const [stars] = usePref<string[]>('stars', []);
  const list = ICONS.filter((n) => matches(query, n.replace(/^Icon/, '')));
  const starred = stars.filter((k) => k.startsWith('icon:')).map((k) => k.slice(5)).filter((n) => ICONS.includes(n));
  const tile = (n: string) => <Item key={n} payload={{ kind: 'icon', name: n }} label={n.replace(/^Icon/, '')} className="cv-lib-item--icon"><Icon name={n} size={20} /></Item>;
  return (
    <>
      {!query && starred.length > 0 && <Section title="Starred"><div className="cv-lib-grid cv-lib-grid--icons">{starred.map(tile)}</div></Section>}
      <Section title="Icons" count={list.length}><div className="cv-lib-grid cv-lib-grid--icons">{list.map(tile)}</div></Section>
    </>
  );
}

/** Applies a token to the selection: a color as fill or text color, a radius, a gap, a type size. */
function applyToken(kind: 'color' | 'radius' | 'space' | 'size', name: string) {
  const page = currentPage();
  for (const id of getState().selection) {
    const node = page && find(page, id)?.node;
    if (!node) continue;
    updateNode(id, (n) => {
      if (kind === 'color') {
        if (n.type === 'text' || n.type === 'icon') n.style.color = name;
        else n.style.fill = name;
      } else if (kind === 'radius') n.style.radius = name;
      else if (kind === 'space' && n.stack) n.stack.gap = name;
      else if (kind === 'size' && n.type === 'text') n.style.fontSize = name;
    });
  }
}

function TokensView({ query }: { query: string }) {
  const theme = useEditor((s) => {
    const p = currentPage(s);
    const id = s.selection[0];
    const hit = p && id ? find(p, id) : undefined;
    return (hit ? (hit.path[0] ?? hit.node).theme : p?.frames[0]?.theme) ?? 'dark';
  });
  const chip = (kind: 'radius' | 'space' | 'size', t: { name: string; value: string }) => (
    <button key={t.name} type="button" className="cv-token-chip" title={`${t.name}: ${t.value}`} onClick={() => applyToken(kind, t.name)}>
      {shortName(t.name)}<span>{t.value.replace(/\s*\/\*.*$/, '')}</span>
    </button>
  );
  return (
    <>
      <p className="cv-muted cv-pad">Click a token to apply it to the selection.</p>
      {COLOR_GROUPS.map((g) => {
        const tokens = g.tokens.filter((t) => matches(query, t.name, g.title));
        if (!tokens.length) return null;
        return (
          <Section key={g.title} title={g.title} count={tokens.length}>
            <div className="cv-swatches">
              {tokens.map((t) => (
                <button key={t.name} type="button" className="cv-swatch" title={`${t.name}\n${theme === 'light' ? t.light : t.dark}`} onClick={() => applyToken('color', t.name)}>
                  <span className="cv-swatch-color" style={{ background: theme === 'light' ? t.light : t.dark }} />
                  <span className="cv-swatch-name">{shortName(t.name)}</span>
                </button>
              ))}
            </div>
          </Section>
        );
      })}
      <Section title="Radius" defaultOpen={false}><div className="cv-token-chips">{RADII.filter((t) => matches(query, t.name)).map((t) => chip('radius', t))}</div></Section>
      <Section title="Space" defaultOpen={false}><div className="cv-token-chips">{SPACE.filter((t) => matches(query, t.name)).map((t) => chip('space', t))}</div></Section>
      <Section title="Type size" defaultOpen={false}><div className="cv-token-chips">{FONT_SIZES.filter((t) => matches(query, t.name)).map((t) => chip('size', t))}</div></Section>
    </>
  );
}

type Kind = 'components' | 'blocks' | 'icons' | 'tokens' | 'images';

export function Library() {
  const [kind, setKind] = usePref<Kind>('library:kind', 'components');
  const [query, setQuery] = useState('');
  return (
    <div className="cv-library">
      <div className="cv-pad cv-stack-8">
        <SegmentedControl<Kind>
          ariaLabel="Library"
          value={kind}
          onChange={setKind}
          options={[{ value: 'components', label: 'Parts' }, { value: 'blocks', label: 'Blocks' }, { value: 'icons', label: 'Icons' }, { value: 'tokens', label: 'Tokens' }, { value: 'images', label: 'Images' }]}
        />
        <SearchField value={query} onChange={setQuery} placeholder={`Search ${kind === 'components' ? 'components' : kind}`} />
      </div>
      <div className="cv-scroll">
        {kind === 'components' && <ComponentsView query={query} />}
        {kind === 'icons' && <IconsView query={query} />}
        {kind === 'tokens' && <TokensView query={query} />}
        {kind === 'blocks' && <OrganizedView kind="block" query={query} />}
        {kind === 'images' && <OrganizedView kind="image" query={query} />}
      </div>
    </div>
  );
}
