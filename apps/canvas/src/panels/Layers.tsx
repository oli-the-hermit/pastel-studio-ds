// The pages of the project and the layers of the current page. Layers select, rename (double-click or
// F2), hide, lock, and reorder by dragging: on the upper or lower edge of a row to go before or after
// it, on the middle of a frame or stack to go inside.
import React, { useState } from 'react';
import { IconButton, IconChevronDown, IconEye, IconLock, IconPlus, IconTrash, cx } from '@pastel-studio/react';
import * as PS from '@pastel-studio/react';
import { updateNode } from '../model/actions';
import { addPage, currentPage, edit, getState, removePage, renamePage, select, setHover, setPage, useEditor } from '../model/store';
import { find, isContainer, isInside, move } from '../model/tree';
import type { CanvasNode } from '../model/types';

const registry = PS as unknown as Record<string, React.ComponentType<{ size?: number }> | undefined>;

function typeIcon(n: CanvasNode): string {
  if (n.type === 'stack') return n.stack?.direction === 'row' ? 'IconViewTiles' : 'IconViewList';
  return { frame: 'IconMonitor', text: 'IconFont', rect: 'IconLayers', image: 'IconFileImage', icon: 'IconStar', component: 'IconApp' }[n.type] ?? 'IconFile';
}

const LAYER_MIME = 'application/x-pastel-layer';

function Rename({ value, onDone }: { value: string; onDone: (v?: string) => void }) {
  return (
    <input
      className="ps-input cv-inline-input"
      autoFocus
      defaultValue={value}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.target.select()}
      onBlur={(e) => onDone(e.target.value.trim() || undefined)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') onDone();
      }}
    />
  );
}

const NO_PAGES: { id: string; name: string }[] = [];

function Pages() {
  const pages = useEditor((s) => s.project?.pages ?? NO_PAGES);
  const pageId = useEditor((s) => s.pageId);
  const [renaming, setRenaming] = useState<string>();
  return (
    <section className="cv-pages">
      <div className="cv-panel-head">
        <span className="ps-overline">Pages</span>
        <IconButton size="xs" label="Add page" onClick={addPage}><IconPlus size={14} /></IconButton>
      </div>
      {pages.map((p) => (
        <div
          key={p.id}
          className={cx('cv-layer', p.id === pageId && 'is-active')}
          role="button"
          tabIndex={0}
          onClick={() => setPage(p.id)}
          onDoubleClick={() => setRenaming(p.id)}
          onKeyDown={(e) => { if (e.key === 'F2') setRenaming(p.id); }}
        >
          {renaming === p.id ? <Rename value={p.name} onDone={(v) => { if (v) renamePage(p.id, v); setRenaming(undefined); }} /> : <span className="cv-layer-name">{p.name}</span>}
          {pages.length > 1 && p.id === pageId && (
            <button type="button" className="cv-layer-toggle" aria-label="Remove page from the project" title="Remove page (its file stays on disk)" onClick={(e) => { e.stopPropagation(); removePage(p.id); }}>
              <IconTrash size={14} />
            </button>
          )}
        </div>
      ))}
    </section>
  );
}

type Place = 'before' | 'after' | 'inside';

function Row({ node, depth, collapsed, toggle }: { node: CanvasNode; depth: number; collapsed: Set<string>; toggle: (id: string) => void }) {
  const selected = useEditor((s) => s.selection.includes(node.id));
  const hovered = useEditor((s) => s.hover === node.id);
  const [renaming, setRenaming] = useState(false);
  const [place, setPlace] = useState<Place>();
  const Icon = registry[typeIcon(node)];
  const kids = node.children ?? [];
  const open = !collapsed.has(node.id);

  const placeFor = (e: React.DragEvent): Place => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = (e.clientY - r.top) / r.height;
    if (isContainer(node) && t > 0.28 && t < 0.72) return 'inside';
    return t < 0.5 ? 'before' : 'after';
  };

  const onDrop = (e: React.DragEvent) => {
    const id = e.dataTransfer.getData(LAYER_MIME);
    const where = placeFor(e);
    setPlace(undefined);
    const page = currentPage();
    if (!id || !page || isInside(page, node.id, id)) return;
    e.preventDefault();
    edit((draft) => {
      const target = find(draft, node.id);
      const dragged = find(draft, id);
      if (!target || !dragged) return;
      // Frames stay at the top level; everything else stays inside a frame.
      if (where === 'inside') move(draft, id, node.id, node.children?.length ?? 0);
      else if (!target.parent && dragged.node.type !== 'frame') move(draft, id, node.id, where === 'before' ? 0 : node.children?.length ?? 0);
      else move(draft, id, target.parent?.id, target.index + (where === 'after' ? 1 : 0));
    });
  };

  return (
    <>
      <div
        className={cx('cv-layer', selected && 'is-active', hovered && 'is-hover', node.hidden && 'is-hidden', place && `is-drop-${place}`)}
        style={{ paddingLeft: `calc(var(--ps-space-4) + ${depth} * var(--ps-tree-indent))` }}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={kids.length ? open : undefined}
        tabIndex={0}
        draggable={!renaming}
        onDragStart={(e) => { e.dataTransfer.setData(LAYER_MIME, node.id); e.dataTransfer.effectAllowed = 'move'; }}
        onDragOver={(e) => { if (e.dataTransfer.types.includes(LAYER_MIME)) { e.preventDefault(); setPlace(placeFor(e)); } }}
        onDragLeave={() => setPlace(undefined)}
        onDrop={onDrop}
        onPointerEnter={() => setHover(node.id)}
        onPointerLeave={() => setHover(undefined)}
        onClick={(e) => {
          const sel = getState().selection;
          select(e.shiftKey || e.ctrlKey ? (sel.includes(node.id) ? sel.filter((s) => s !== node.id) : [...sel, node.id]) : [node.id]);
        }}
        onDoubleClick={() => setRenaming(true)}
        onKeyDown={(e) => { if (e.key === 'F2') { e.stopPropagation(); setRenaming(true); } }}
      >
        {kids.length ? (
          <button type="button" className="cv-disclosure" aria-label={open ? 'Collapse' : 'Expand'} onClick={(e) => { e.stopPropagation(); toggle(node.id); }}>
            <IconChevronDown size={13} className={cx('cv-chevron', !open && 'is-closed')} />
          </button>
        ) : <span className="cv-disclosure" />}
        {Icon && <Icon size={14} />}
        {renaming ? (
          <Rename value={node.name} onDone={(v) => { if (v) updateNode(node.id, (n) => { n.name = v; }); setRenaming(false); }} />
        ) : <span className="cv-layer-name">{node.name}</span>}
        <button type="button" className={cx('cv-layer-toggle', node.locked && 'is-on')} aria-label={node.locked ? 'Unlock' : 'Lock'} aria-pressed={!!node.locked} onClick={(e) => { e.stopPropagation(); updateNode(node.id, (n) => { n.locked = !n.locked || undefined; }); }}>
          <IconLock size={13} />
        </button>
        <button type="button" className={cx('cv-layer-toggle', node.hidden && 'is-on')} aria-label={node.hidden ? 'Show' : 'Hide'} aria-pressed={!!node.hidden} onClick={(e) => { e.stopPropagation(); updateNode(node.id, (n) => { n.hidden = !n.hidden || undefined; }); }}>
          <IconEye size={13} />
        </button>
      </div>
      {open && kids.map((k) => <Row key={k.id} node={k} depth={depth + 1} collapsed={collapsed} toggle={toggle} />)}
    </>
  );
}

export function Layers() {
  const page = useEditor((s) => currentPage(s));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setCollapsed((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <div className="cv-layers">
      <Pages />
      <div className="cv-panel-head"><span className="ps-overline">Layers</span></div>
      <div className="cv-scroll" role="tree" aria-label="Layers">
        {page?.frames.map((f) => <Row key={f.id} node={f} depth={0} collapsed={collapsed} toggle={toggle} />)}
        {!page?.frames.length && <p className="cv-muted cv-pad">Add a frame from the library to start.</p>}
      </div>
    </div>
  );
}
