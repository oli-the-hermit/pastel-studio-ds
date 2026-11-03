// The asset library: the design system's components, icons and tokens, and the project's images.
// Every kind is searchable, can be starred, and remembers what was used last; images also sit in
// folders and carry tags. Click an item to add it where the selection is, or drag it onto a frame.
import React, { useMemo, useRef, useState } from 'react';
import * as PS from '@pastel-studio/react';
import { IconButton, IconFolder, IconFolderPlus, IconPlus, IconStar, IconTrash, SearchField, SegmentedControl, cx } from '@pastel-studio/react';
import { CATALOG, catalogEntry, defaultProps } from '../data/components';
import { COLOR_GROUPS, FONT_SIZES, RADII, SPACE, shortName } from '../data/tokens';
import { insertNodes, updateNode } from '../model/actions';
import { currentPage, editLibrary, getState, useEditor } from '../model/store';
import { nodesFor, setDragPayload, type ElementKind, type Payload } from '../model/payload';
import { find, walk } from '../model/tree';
import { uid, type Asset, type Page } from '../model/types';
import { materialize } from '../canvas/RenderNode';
import { useAssetUrl } from '../canvas/assets';
import { fsApi, join } from '../storage/fs';
import { importImages, isImageFile } from '../storage/images';
import { noteUsed, toggleStar, usePref } from './prefs';

const registry = PS as unknown as Record<string, React.ComponentType<Record<string, unknown>> | undefined>;
const ICONS = Object.keys(PS).filter((k) => /^Icon[A-Z]/.test(k)).sort();

const keyOf = (p: Payload) => (p.kind === 'component' || p.kind === 'icon' ? `${p.kind}:${p.name}` : p.kind === 'asset' ? `asset:${p.id}` : `element:${p.element}`);

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

// ── Images ──────────────────────────────────────────────────────────────────

type Scope = 'all' | 'starred' | 'unfiled' | string;

function ImageThumb({ asset }: { asset: Asset }) {
  const url = useAssetUrl(asset.id);
  return url ? <img src={url} alt="" draggable={false} /> : <PS.IconFileImage size={22} />;
}

function usageCount(assetId: string, pages: Record<string, Page>): number {
  let n = 0;
  for (const page of Object.values(pages)) walk(page.frames, (node) => { if (node.asset === assetId) n++; });
  return n;
}

function FolderRow({ id, name, depth, scope, setScope, count }: { id: Scope; name: string; depth: number; scope: Scope; setScope: (s: Scope) => void; count: number }) {
  const [renaming, setRenaming] = useState(false);
  const isFolder = !['all', 'starred', 'unfiled'].includes(id);
  return (
    <div
      className={cx('cv-folder', scope === id && 'is-active')}
      style={{ paddingLeft: `calc(var(--ps-space-8) + ${depth} * var(--ps-tree-indent))` }}
      role="button"
      tabIndex={0}
      onClick={() => setScope(id)}
      onKeyDown={(e) => { if (e.key === 'Enter') setScope(id); if (e.key === 'F2' && isFolder) setRenaming(true); }}
      onDoubleClick={() => isFolder && setRenaming(true)}
      onDragOver={(e) => { if (isFolder || id === 'unfiled') { e.preventDefault(); e.currentTarget.classList.add('is-drop'); } }}
      onDragLeave={(e) => e.currentTarget.classList.remove('is-drop')}
      onDrop={(e) => {
        e.currentTarget.classList.remove('is-drop');
        const assetId = e.dataTransfer.getData('application/x-pastel-asset');
        if (assetId) editLibrary((lib) => { const a = lib.assets.find((x) => x.id === assetId); if (a) a.folder = isFolder ? id : undefined; });
      }}
    >
      {id === 'starred' ? <IconStar size={15} /> : <IconFolder size={15} />}
      {renaming ? (
        <input
          className="ps-input cv-inline-input"
          autoFocus
          defaultValue={name}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => { const v = e.target.value.trim(); if (v) editLibrary((lib) => { const f = lib.folders.find((x) => x.id === id); if (f) f.name = v; }); setRenaming(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenaming(false); }}
        />
      ) : <span className="cv-folder-name">{name}</span>}
      <span className="cv-count">{count}</span>
    </div>
  );
}

function AssetDetails({ asset }: { asset: Asset }) {
  const folders = useEditor((s) => s.library.folders);
  const [tag, setTag] = useState('');
  const pages = useEditor((s) => s.pages);
  const used = useMemo(() => usageCount(asset.id, pages), [asset.id, pages]);
  const change = (fn: (a: Asset) => void) => editLibrary((lib) => { const a = lib.assets.find((x) => x.id === asset.id); if (a) fn(a); });
  const remove = async () => {
    const dir = getState().dir;
    if (!dir || used) return;
    await fsApi.remove(join(dir, asset.file)).catch(() => {});
    editLibrary((lib) => { lib.assets = lib.assets.filter((a) => a.id !== asset.id); });
  };
  return (
    <div className="cv-asset-details">
      <input className="ps-input" aria-label="Name" defaultValue={asset.name} key={asset.id} onBlur={(e) => change((a) => { a.name = e.target.value.trim() || a.name; })} />
      <p className="cv-muted">{asset.width && asset.height ? `${asset.width} × ${asset.height} · ` : ''}{used ? `used ${used} time${used === 1 ? '' : 's'}` : 'not used yet'}</p>
      <label className="cv-field-label" htmlFor={`folder-${asset.id}`}>Folder</label>
      <select id={`folder-${asset.id}`} className="ps-input" value={asset.folder ?? ''} onChange={(e) => change((a) => { a.folder = e.target.value || undefined; })}>
        <option value="">Unfiled</option>
        {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <span className="cv-field-label">Tags</span>
      <div className="cv-tags">
        {asset.tags.map((t) => (
          <button key={t} type="button" className="cv-tag" title="Remove tag" onClick={() => change((a) => { a.tags = a.tags.filter((x) => x !== t); })}>{t} ✕</button>
        ))}
        <input
          className="ps-input cv-tag-input"
          placeholder="Add a tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => {
            const v = tag.trim().toLowerCase();
            if (e.key === 'Enter' && v) { change((a) => { if (!a.tags.includes(v)) a.tags.push(v); }); setTag(''); }
          }}
        />
      </div>
      <div className="cv-row">
        <PS.Button size="sm" onClick={() => add({ kind: 'asset', id: asset.id })} icon={<IconPlus size={16} />}>Add to frame</PS.Button>
        <IconButton size="sm" tone="danger" label={used ? 'In use: remove it from the frames first' : 'Delete image'} disabled={!!used} onClick={() => void remove()}>
          <IconTrash size={16} />
        </IconButton>
      </div>
    </div>
  );
}

function ImagesView({ query }: { query: string }) {
  const library = useEditor((s) => s.library);
  const [stars] = usePref<string[]>('stars', []);
  const [scope, setScope] = usePref<Scope>('images:scope', 'all');
  const [tags, setTags] = useState<string[]>([]);
  const [picked, setPicked] = useState<string>();
  const file = useRef<HTMLInputElement>(null);
  const folderId = !['all', 'starred', 'unfiled'].includes(scope) ? scope : undefined;

  const descendants = (id: string): string[] => [id, ...library.folders.filter((f) => f.parent === id).flatMap((f) => descendants(f.id))];
  const inScope = (a: Asset) =>
    scope === 'all' ? true : scope === 'starred' ? stars.includes(`asset:${a.id}`) : scope === 'unfiled' ? !a.folder : !!a.folder && descendants(scope).includes(a.folder);
  const list = library.assets.filter((a) => inScope(a) && tags.every((t) => a.tags.includes(t)) && matches(query, a.name, ...a.tags));
  const allTags = [...new Set(library.assets.flatMap((a) => a.tags))].sort();
  const asset = library.assets.find((a) => a.id === picked);

  const folderRows = (parent: string | undefined, depth: number): React.ReactNode[] =>
    library.folders.filter((f) => f.parent === parent).sort((a, b) => a.name.localeCompare(b.name)).flatMap((f) => [
      <FolderRow key={f.id} id={f.id} name={f.name} depth={depth} scope={scope} setScope={setScope} count={library.assets.filter((a) => a.folder && descendants(f.id).includes(a.folder)).length} />,
      ...folderRows(f.id, depth + 1),
    ]);

  const newFolder = () => {
    const id = uid();
    editLibrary((lib) => { lib.folders.push({ id, name: 'New folder', parent: folderId }); });
    setScope(id);
  };
  const deleteFolder = () => {
    if (!folderId) return;
    const parent = library.folders.find((f) => f.id === folderId)?.parent;
    editLibrary((lib) => {
      lib.folders = lib.folders.filter((f) => f.id !== folderId).map((f) => (f.parent === folderId ? { ...f, parent } : f));
      lib.assets.forEach((a) => { if (a.folder === folderId) a.folder = parent; });
    });
    setScope(parent ?? 'all');
  };

  return (
    <div
      className="cv-images"
      onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); }}
      onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); void importImages([...e.dataTransfer.files].filter(isImageFile), folderId); } }}
    >
      <div className="cv-row cv-pad">
        <PS.Button size="sm" icon={<IconPlus size={16} />} onClick={() => file.current?.click()}>Import images</PS.Button>
        <IconButton size="sm" label="New folder" onClick={newFolder}><IconFolderPlus size={16} /></IconButton>
        {folderId && <IconButton size="sm" label="Delete folder (its images move up a level)" onClick={deleteFolder}><IconTrash size={16} /></IconButton>}
        <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => { void importImages([...(e.target.files ?? [])], folderId); e.target.value = ''; }} />
      </div>
      <div className="cv-folders">
        <FolderRow id="all" name="All images" depth={0} scope={scope} setScope={setScope} count={library.assets.length} />
        <FolderRow id="starred" name="Starred" depth={0} scope={scope} setScope={setScope} count={library.assets.filter((a) => stars.includes(`asset:${a.id}`)).length} />
        <FolderRow id="unfiled" name="Unfiled" depth={0} scope={scope} setScope={setScope} count={library.assets.filter((a) => !a.folder).length} />
        {folderRows(undefined, 0)}
      </div>
      {allTags.length > 0 && (
        <div className="cv-tags cv-pad">
          {allTags.map((t) => (
            <button key={t} type="button" className={cx('cv-tag', tags.includes(t) && 'is-active')} aria-pressed={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
          ))}
        </div>
      )}
      {list.length ? (
        <div className="cv-lib-grid cv-lib-grid--images">
          {list.map((a) => (
            <div
              key={a.id}
              className={cx('cv-lib-item', picked === a.id && 'is-active')}
              role="button"
              tabIndex={0}
              title={a.name}
              draggable
              onDragStart={(e) => { setDragPayload(e, { kind: 'asset', id: a.id }); e.dataTransfer.setData('application/x-pastel-asset', a.id); e.dataTransfer.effectAllowed = 'copyMove'; }}
              onClick={() => setPicked(a.id)}
              onDoubleClick={() => add({ kind: 'asset', id: a.id })}
            >
              <div className="cv-lib-thumb cv-lib-thumb--image"><ImageThumb asset={a} /></div>
              <span className="cv-lib-name">{a.name}</span>
              <button type="button" className={cx('cv-star', stars.includes(`asset:${a.id}`) && 'is-active')} aria-label="Star" onClick={(e) => { e.stopPropagation(); toggleStar(`asset:${a.id}`); }}><IconStar size={13} /></button>
            </div>
          ))}
        </div>
      ) : (
        <p className="cv-muted cv-pad">{library.assets.length ? 'No image here matches.' : 'Import images, or drop them here or on a frame.'}</p>
      )}
      {asset && <AssetDetails asset={asset} />}
    </div>
  );
}

type Kind = 'components' | 'icons' | 'tokens' | 'images';

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
          options={[{ value: 'components', label: 'Parts' }, { value: 'icons', label: 'Icons' }, { value: 'tokens', label: 'Tokens' }, { value: 'images', label: 'Images' }]}
        />
        <SearchField value={query} onChange={setQuery} placeholder={`Search ${kind === 'components' ? 'components' : kind}`} />
      </div>
      <div className="cv-scroll">
        {kind === 'components' && <ComponentsView query={query} />}
        {kind === 'icons' && <IconsView query={query} />}
        {kind === 'tokens' && <TokensView query={query} />}
        {kind === 'images' && <ImagesView query={query} />}
      </div>
    </div>
  );
}
