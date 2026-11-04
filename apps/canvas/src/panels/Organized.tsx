// The library's own collections, images and blocks, organized the same way: two libraries (this
// project's and the shared one every project sees), nested folders, tags with filters, search, stars,
// and how many times each item is used. Items move between folders by dragging, and between the two
// libraries from their details.
import React, { useMemo, useRef, useState } from 'react';
import * as PS from '@pastel-studio/react';
import { IconButton, IconFolder, IconFolderPlus, IconPlus, IconStar, IconTrash, SegmentedControl, cx } from '@pastel-studio/react';
import { insertNodes } from '../model/actions';
import { blockUsage, canPlaceBlock, deleteBlock, makeBlock, moveAsset, moveBlock, renameBlock } from '../model/blocks';
import { currentPage, editLibrary, getState, openBlock, useEditor, type LibrarySource } from '../model/store';
import { nodesFor, setDragPayload, type Payload } from '../model/payload';
import { walk } from '../model/tree';
import { uid, type Asset, type BlockRef, type CanvasNode, type LibraryFile, type Page } from '../model/types';
import { isVirtual } from '../model/virtual';
import { useAssetUrl } from '../canvas/assets';
import { RenderNode } from '../canvas/RenderNode';
import { fsApi, join } from '../storage/fs';
import { importImages, isImageFile } from '../storage/images';
import { noteUsed, toggleStar, usePref } from './prefs';

export type Collection = 'image' | 'block';
type Scope = 'all' | 'starred' | 'unfiled' | string;
const ITEM_MIME = 'application/x-pastel-item';
const SPECIAL = ['all', 'starred', 'unfiled'];

interface Item {
  id: string;
  name: string;
  folder?: string;
  tags: string[];
}

const itemsOf = (lib: LibraryFile, kind: Collection): Item[] => (kind === 'image' ? lib.assets : lib.blocks ?? []);
const starKey = (kind: Collection, id: string) => `${kind === 'image' ? 'asset' : 'block'}:${id}`;
const matches = (q: string, ...texts: (string | undefined)[]) => !q || texts.some((t) => t?.toLowerCase().includes(q.toLowerCase()));

function assetUsage(assetId: string, pages: Record<string, Page>): number {
  let n = 0;
  for (const page of Object.values(pages)) walk(page.frames, (node) => { if (node.asset === assetId) n++; });
  return n;
}

function payloadOf(kind: Collection, id: string): Payload {
  return kind === 'image' ? { kind: 'asset', id } : { kind: 'block', id };
}

function place(kind: Collection, id: string) {
  if (kind === 'block' && !canPlaceBlock(id)) return;
  noteUsed(starKey(kind, id));
  insertNodes(nodesFor(payloadOf(kind, id)));
}

function ImageThumb({ id }: { id: string }) {
  const url = useAssetUrl(id);
  return url ? <img src={url} alt="" draggable={false} /> : <PS.IconFileImage size={22} />;
}

/** A block's first variant, drawn small. */
function BlockThumb({ id }: { id: string }) {
  const variant = useEditor((s) => s.pages[id]?.frames[0]);
  if (!variant) return <PS.IconCopy size={22} />;
  const w = variant.width.mode === 'fixed' ? variant.width.value : 320;
  const h = variant.height.mode === 'fixed' ? variant.height.value : 200;
  const k = Math.min(1, 124 / w, 80 / h);
  const node: CanvasNode = { ...variant, x: 0, y: 0 };
  return (
    <div className="cv-block-thumb" style={{ width: w * k, height: h * k }} ref={(el) => el?.setAttribute('inert', '')}>
      <div style={{ transform: `scale(${k})`, transformOrigin: '0 0', position: 'relative' }}>
        <RenderNode node={{ ...node, id: `thumb-${variant.id}` }} />
      </div>
    </div>
  );
}

function FolderRow({ id, name, depth, scope, setScope, count, kind, source }: {
  id: Scope; name: string; depth: number; scope: Scope; setScope: (s: Scope) => void; count: number; kind: Collection; source: LibrarySource;
}) {
  const [renaming, setRenaming] = useState(false);
  const isFolder = !SPECIAL.includes(id);
  return (
    <div
      className={cx('cv-folder', scope === id && 'is-active')}
      style={{ paddingLeft: `calc(var(--ps-space-8) + ${depth} * var(--ps-tree-indent))` }}
      role="button"
      tabIndex={0}
      onClick={() => setScope(id)}
      onKeyDown={(e) => { if (e.key === 'Enter') setScope(id); if (e.key === 'F2' && isFolder) setRenaming(true); }}
      onDoubleClick={() => isFolder && setRenaming(true)}
      onDragOver={(e) => { if ((isFolder || id === 'unfiled') && e.dataTransfer.types.includes(ITEM_MIME)) { e.preventDefault(); e.currentTarget.classList.add('is-drop'); } }}
      onDragLeave={(e) => e.currentTarget.classList.remove('is-drop')}
      onDrop={(e) => {
        e.currentTarget.classList.remove('is-drop');
        const raw = e.dataTransfer.getData(ITEM_MIME);
        if (!raw) return;
        const { id: itemId } = JSON.parse(raw) as { id: string };
        editLibrary((lib) => {
          const item = itemsOf(lib, kind).find((x) => x.id === itemId);
          if (item) item.folder = isFolder ? id : undefined;
        }, source);
      }}
    >
      {id === 'starred' ? <IconStar size={15} /> : <IconFolder size={15} />}
      {renaming ? (
        <input
          className="ps-input cv-inline-input"
          autoFocus
          defaultValue={name}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => { const v = e.target.value.trim(); if (v) editLibrary((lib) => { const f = lib.folders.find((x) => x.id === id); if (f) f.name = v; }, source); setRenaming(false); }}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenaming(false); }}
        />
      ) : <span className="cv-folder-name">{name}</span>}
      <span className="cv-count">{count}</span>
    </div>
  );
}

function Tags({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [tag, setTag] = useState('');
  return (
    <div className="cv-tags">
      {tags.map((t) => <button key={t} type="button" className="cv-tag" title="Remove tag" onClick={() => onChange(tags.filter((x) => x !== t))}>{t} ✕</button>)}
      <input
        className="ps-input cv-tag-input"
        placeholder="Add a tag"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={(e) => {
          const v = tag.trim().toLowerCase();
          if (e.key === 'Enter' && v) { if (!tags.includes(v)) onChange([...tags, v]); setTag(''); }
        }}
      />
    </div>
  );
}

function Details({ kind, item, source }: { kind: Collection; item: Item; source: LibrarySource }) {
  const lib = useEditor((s) => (source === 'shared' ? s.shared : s.library));
  const pages = useEditor((s) => s.pages);
  const used = useMemo(() => (kind === 'image' ? assetUsage(item.id, pages) : blockUsage(item.id, pages)), [kind, item.id, pages]);
  const folders = lib.folders.filter((f) => (f.kind ?? 'image') === kind);
  const change = (fn: (x: Item) => void) => editLibrary((l) => { const x = itemsOf(l, kind).find((i) => i.id === item.id); if (x) fn(x); }, source);
  const other: LibrarySource = source === 'shared' ? 'project' : 'shared';
  const asset = kind === 'image' ? (item as Asset) : undefined;
  const block = kind === 'block' ? (item as BlockRef) : undefined;
  const variants = useEditor((s) => (block ? s.pages[block.id]?.frames.length ?? 0 : 0));

  const remove = async () => {
    if (used) return;
    if (block) return deleteBlock(block.id);
    const dir = source === 'shared' ? getState().sharedDir : getState().dir;
    if (dir && asset) await fsApi.remove(join(dir, asset.file)).catch(() => {});
    editLibrary((l) => { l.assets = l.assets.filter((a) => a.id !== item.id); }, source);
  };

  return (
    <div className="cv-asset-details">
      <input
        className="ps-input"
        aria-label="Name"
        defaultValue={item.name}
        key={item.id}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (!v || v === item.name) return;
          if (block) renameBlock(block.id, v);
          else change((x) => { x.name = v; });
        }}
      />
      <p className="cv-muted">
        {asset?.width && asset.height ? `${asset.width} × ${asset.height} · ` : ''}
        {block ? `${variants} variant${variants === 1 ? '' : 's'} · ` : ''}
        {used ? `used ${used} time${used === 1 ? '' : 's'}` : 'not used yet'}
      </p>
      {block && (
        <textarea
          className="ps-input cv-input cv-textarea"
          aria-label="What it's for"
          placeholder="What it's for (shown in the library)"
          defaultValue={block.description ?? ''}
          key={`d-${block.id}`}
          rows={2}
          onBlur={(e) => change((x) => { (x as BlockRef).description = e.target.value.trim() || undefined; })}
        />
      )}
      <label className="cv-field-label" htmlFor={`folder-${item.id}`}>Folder</label>
      <select id={`folder-${item.id}`} className="ps-input cv-input" value={item.folder ?? ''} onChange={(e) => change((x) => { x.folder = e.target.value || undefined; })}>
        <option value="">Unfiled</option>
        {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <span className="cv-field-label">Tags</span>
      <Tags tags={item.tags} onChange={(tags) => change((x) => { x.tags = tags; })} />
      <div className="cv-row">
        <PS.Button size="sm" variant="primary" onClick={() => place(kind, item.id)} icon={<IconPlus size={16} />}>Add to frame</PS.Button>
        {block && <PS.Button size="sm" onClick={() => openBlock(block.id)}>Edit block</PS.Button>}
      </div>
      <div className="cv-row">
        <PS.Button size="sm" onClick={() => void (block ? moveBlock(block.id, other) : moveAsset(item.id, other))}>
          {other === 'shared' ? 'Move to the shared library' : 'Move into this project'}
        </PS.Button>
        <IconButton size="sm" tone="danger" label={used ? 'In use: remove its copies from the frames first' : `Delete ${kind === 'image' ? 'image' : 'block'}`} disabled={!!used} onClick={() => void remove()}>
          <IconTrash size={16} />
        </IconButton>
      </div>
    </div>
  );
}

export function OrganizedView({ kind, query }: { kind: Collection; query: string }) {
  const [source, setSource] = usePref<LibrarySource>(`${kind}:source`, 'project');
  const lib = useEditor((s) => (source === 'shared' ? s.shared : s.library));
  const projectCount = useEditor((s) => itemsOf(s.library, kind).length);
  const sharedCount = useEditor((s) => itemsOf(s.shared, kind).length);
  const canMake = useEditor((s) => s.selection.length === 1 && !isVirtual(s.selection[0]));
  const [stars] = usePref<string[]>('stars', []);
  const [scope, setScope] = usePref<Scope>(`${kind}:${source}:scope`, 'all');
  const [tags, setTags] = useState<string[]>([]);
  const [picked, setPicked] = useState<string>();
  const file = useRef<HTMLInputElement>(null);

  const folders = lib.folders.filter((f) => (f.kind ?? 'image') === kind);
  const items = itemsOf(lib, kind);
  const folderId = !SPECIAL.includes(scope) && folders.some((f) => f.id === scope) ? scope : undefined;
  const effectiveScope = SPECIAL.includes(scope) || folderId ? scope : 'all';
  const descendants = (id: string): string[] => [id, ...folders.filter((f) => f.parent === id).flatMap((f) => descendants(f.id))];
  const inScope = (x: Item) =>
    effectiveScope === 'all' ? true
      : effectiveScope === 'starred' ? stars.includes(starKey(kind, x.id))
        : effectiveScope === 'unfiled' ? !x.folder
          : !!x.folder && descendants(effectiveScope).includes(x.folder);
  const list = items.filter((x) => inScope(x) && tags.every((t) => x.tags.includes(t)) && matches(query, x.name, ...x.tags, (x as BlockRef).description));
  const allTags = [...new Set(items.flatMap((x) => x.tags))].sort();
  const item = items.find((x) => x.id === picked);

  const folderRows = (parent: string | undefined, depth: number): React.ReactNode[] =>
    folders.filter((f) => f.parent === parent).sort((a, b) => a.name.localeCompare(b.name)).flatMap((f) => [
      <FolderRow key={f.id} id={f.id} name={f.name} depth={depth} scope={effectiveScope} setScope={setScope} kind={kind} source={source} count={items.filter((x) => x.folder && descendants(f.id).includes(x.folder)).length} />,
      ...folderRows(f.id, depth + 1),
    ]);

  const newFolder = () => {
    const id = uid();
    editLibrary((l) => { l.folders.push({ id, name: 'New folder', parent: folderId, kind: kind === 'block' ? 'block' : undefined }); }, source);
    setScope(id);
  };
  const deleteFolder = () => {
    if (!folderId) return;
    const parent = folders.find((f) => f.id === folderId)?.parent;
    editLibrary((l) => {
      l.folders = l.folders.filter((f) => f.id !== folderId).map((f) => (f.parent === folderId ? { ...f, parent } : f));
      itemsOf(l, kind).forEach((x) => { if (x.folder === folderId) x.folder = parent; });
    }, source);
    setScope(parent ?? 'all');
  };
  const make = () => {
    const id = makeBlock();
    if (!id) return;
    if (source === 'shared') void moveBlock(id, 'shared');
    else if (folderId) editLibrary((l) => { const b = l.blocks?.find((x) => x.id === id); if (b) b.folder = folderId; });
    setPicked(id);
  };

  const label = kind === 'image' ? 'image' : 'block';
  const empty = items.length
    ? `No ${label} here matches.`
    : kind === 'image'
      ? 'Import images, or drop them here or on a frame.'
      : 'Select something on a frame and make it a block: a piece you can reuse, with variants.';

  return (
    <div
      className="cv-images"
      onDragOver={(e) => { if (kind === 'image' && e.dataTransfer.types.includes('Files')) e.preventDefault(); }}
      onDrop={(e) => { if (kind === 'image' && e.dataTransfer.files.length) { e.preventDefault(); void importImages([...e.dataTransfer.files].filter(isImageFile), folderId, source); } }}
    >
      <div className="cv-pad cv-stack-8">
        <SegmentedControl<LibrarySource>
          ariaLabel="Which library"
          value={source}
          onChange={(v) => { setSource(v); setPicked(undefined); }}
          options={[{ value: 'project', label: `This project · ${projectCount}` }, { value: 'shared', label: `Shared · ${sharedCount}` }]}
        />
        <div className="cv-row">
          {kind === 'image'
            ? <PS.Button size="sm" icon={<IconPlus size={16} />} onClick={() => file.current?.click()}>Import images</PS.Button>
            : <PS.Button size="sm" icon={<IconPlus size={16} />} disabled={!canMake} title={canMake ? undefined : 'Select an element on a frame first'} onClick={make}>Make a block</PS.Button>}
          <IconButton size="sm" label="New folder" onClick={newFolder}><IconFolderPlus size={16} /></IconButton>
          {folderId && <IconButton size="sm" label="Delete folder (what's in it moves up a level)" onClick={deleteFolder}><IconTrash size={16} /></IconButton>}
          {kind === 'image' && <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => { void importImages([...(e.target.files ?? [])], folderId, source); e.target.value = ''; }} />}
        </div>
      </div>
      <div className="cv-folders">
        <FolderRow id="all" name={kind === 'image' ? 'All images' : 'All blocks'} depth={0} scope={effectiveScope} setScope={setScope} kind={kind} source={source} count={items.length} />
        <FolderRow id="starred" name="Starred" depth={0} scope={effectiveScope} setScope={setScope} kind={kind} source={source} count={items.filter((x) => stars.includes(starKey(kind, x.id))).length} />
        <FolderRow id="unfiled" name="Unfiled" depth={0} scope={effectiveScope} setScope={setScope} kind={kind} source={source} count={items.filter((x) => !x.folder).length} />
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
          {list.map((x) => (
            <div
              key={x.id}
              className={cx('cv-lib-item', picked === x.id && 'is-active')}
              role="button"
              tabIndex={0}
              title={(x as BlockRef).description ?? x.name}
              draggable
              onDragStart={(e) => { setDragPayload(e, payloadOf(kind, x.id)); e.dataTransfer.setData(ITEM_MIME, JSON.stringify({ kind, id: x.id })); e.dataTransfer.effectAllowed = 'copyMove'; }}
              onClick={() => setPicked(x.id)}
              onDoubleClick={() => place(kind, x.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') place(kind, x.id); }}
            >
              <div className="cv-lib-thumb cv-lib-thumb--image">{kind === 'image' ? <ImageThumb id={x.id} /> : <BlockThumb id={x.id} />}</div>
              <span className="cv-lib-name">{x.name}</span>
              <button type="button" className={cx('cv-star', stars.includes(starKey(kind, x.id)) && 'is-active')} aria-label="Star" aria-pressed={stars.includes(starKey(kind, x.id))} onClick={(e) => { e.stopPropagation(); toggleStar(starKey(kind, x.id)); }}><IconStar size={13} /></button>
            </div>
          ))}
        </div>
      ) : (
        <p className="cv-muted cv-pad">{empty}</p>
      )}
      {item && <Details kind={kind} item={item} source={source} />}
      {currentPage()?.kind === 'block' && kind === 'block' && <p className="cv-hint cv-pad">A block can't contain itself, so this block isn't offered inside its own variants.</p>}
    </div>
  );
}
