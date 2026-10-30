import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { gridLayout, visibleRows } from '../../lib/gridLayout';
import type { SelectMode } from '../../lib/useFileBrowser';
import { EmptyState } from '../EmptyState';
import type { FileCommand } from '../FileView';

/** What the grid tells `renderTile` about a tile. */
export interface MediaGridTileState {
  index: number;
  selected: boolean;
  /** Anything in the grid is selected: tiles show their checks. */
  selecting: boolean;
}

export interface MediaGridProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onContextMenu' | 'children'> {
  items: readonly T[];
  /** A stable key per item: it names the item in `selection` and keeps its tile (and loaded thumbnail) when it moves. */
  getKey: (item: T) => string;
  /** The tile for an item, usually a MediaTile. */
  renderTile: (item: T, state: MediaGridTileState) => React.ReactNode;
  selection: ReadonlySet<string>;
  /** A click, Ctrl + click, Shift + click, a click on a tile's check, or the arrows. The app applies it. */
  onSelect: (key: string, mode: SelectMode) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  /** Double-click or Enter. */
  onOpen: (item: T) => void;
  /** Delete, F2, Ctrl + C / X / V, Backspace and Alt + arrows, for the app to carry out. */
  onCommand?: (command: FileCommand) => void;
  /** A right-click on a tile, or on the empty space (`null`). */
  onContextMenu?: (event: React.MouseEvent, item: T | null) => void;
  /** The tile with the keyboard focus changed, e.g. for a details pane that follows it. */
  onFocusItem?: (item: T) => void;
  /** Extra attributes for a tile's cell: drag and drop, pointer handlers. */
  itemProps?: (item: T) => React.HTMLAttributes<HTMLDivElement>;
  /** Called once per length of `items` when the last rows come into view, to load the next page. */
  onEndReached?: () => void;
  /** The narrowest tile: s 150px, m 200px, l 280px, xl 380px; tiles stretch to fill each row. */
  size?: 's' | 'm' | 'l' | 'xl';
  /** Above the tiles, scrolling with them: folders, a banner. */
  header?: React.ReactNode;
  /** In place of the tiles when there are none. */
  empty?: React.ReactNode;
  /** Accessible name of the grid: "Media in Pictures". */
  label: string;
  /** Rows drawn above and below the visible ones. */
  overscan?: number;
  labels?: LabelOverrides<'mediaEmpty'>;
}

interface Box {
  width: number;
  viewport: number;
  /** Where the tiles start inside the scrolling grid, below the header. */
  offset: number;
  min: number;
  gap: number;
  caption: number;
}

const NO_BOX: Box = { width: 0, viewport: 0, offset: 0, min: 0, gap: 0, caption: 0 };
// The tokens' values, for a first measure before the stylesheet has arrived (a dev server injects it late).
const FALLBACK = { min: { s: 150, m: 200, l: 280, xl: 380 }, gap: 16, caption: 44 };
// Before the grid has been measured (or without a layout, as in tests) it draws this many tiles in a plain CSS grid.
const UNMEASURED_COUNT = 48;

const sameBox = (a: Box, b: Box) =>
  a.width === b.width && a.viewport === b.viewport && a.offset === b.offset && a.min === b.min && a.gap === b.gap && a.caption === b.caption;

function MediaGridInner<T>({
  items, getKey, renderTile, selection, onSelect, onSelectAll, onClearSelection, onOpen, onCommand, onContextMenu, onFocusItem,
  itemProps, onEndReached, size = 'm', header, empty, label, overscan = 3, labels: ownLabels, className, onScroll, ...rest
}: MediaGridProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  const labels = useLabels(ownLabels);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>(NO_BOX);
  const [scrollTop, setScrollTop] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const pendingFocus = useRef(false);
  const endCalledFor = useRef(-1);
  const n = items.length;
  const hasHeader = header !== undefined;

  const setRoot = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;
    const style = getComputedStyle(root);
    const px = (name: string, fallback: number) => {
      const value = parseFloat(style.getPropertyValue(name));
      return Number.isNaN(value) ? fallback : value;
    };
    const next: Box = {
      width: list.clientWidth,
      viewport: root.clientHeight,
      offset: list.offsetTop,
      min: px('--ps-media-grid-min', FALLBACK.min[size]),
      gap: px('--ps-media-grid-gap', FALLBACK.gap),
      caption: px('--ps-media-tile-caption', FALLBACK.caption),
    };
    setBox((prev) => (sameBox(prev, next) ? prev : next));
  }, [size]);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    for (const node of [rootRef.current, listRef.current, rootRef.current?.firstElementChild]) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [measure, size, hasHeader]);

  useEffect(() => setFocusIndex((i) => Math.min(i, Math.max(0, n - 1))), [n]);

  const measured = box.width > 0 && box.min > 0;
  const layout = gridLayout(box.width, box.min || 1, box.gap, box.caption, n);
  const { first, last } = measured ? visibleRows(layout, scrollTop - box.offset, box.viewport, overscan) : { first: 0, last: -1 };
  const start = measured ? first * layout.columns : 0;
  const end = measured ? Math.min(n, (last + 1) * layout.columns) : Math.min(n, UNMEASURED_COUNT);

  // Load the next page once the last rows are on screen.
  useEffect(() => {
    if (!onEndReached || !measured || !n || last < layout.rows - 2 || endCalledFor.current === n) return;
    endCalledFor.current = n;
    onEndReached();
  }, [onEndReached, measured, n, last, layout.rows]);

  // Moves the keyboard focus after the tile it goes to has been drawn.
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${focusIndex}"]`)?.focus({ preventScroll: true });
  });

  const reveal = (index: number) => {
    const root = rootRef.current;
    if (!root || !measured) return;
    const top = box.offset + Math.floor(index / layout.columns) * layout.stride;
    if (top < root.scrollTop) root.scrollTop = top;
    else if (top + layout.rowHeight > root.scrollTop + box.viewport) root.scrollTop = top + layout.rowHeight - box.viewport;
    setScrollTop(root.scrollTop);
  };

  const focusAt = (index: number) => {
    setFocusIndex(index);
    pendingFocus.current = true;
    reveal(index);
    onFocusItem?.(items[index]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return;
    const mod = e.ctrlKey || e.metaKey;
    const cols = measured ? layout.columns : 1;
    const page = cols * Math.max(1, Math.floor((box.viewport || 1) / (layout.stride || 1)));
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, PageDown: page, PageUp: -page };
    const command = (c: FileCommand) => {
      e.preventDefault();
      onCommand?.(c);
    };
    if (e.altKey && e.key === 'ArrowUp') return command('up');
    if (e.altKey && e.key === 'ArrowLeft') return command('back');
    if (e.altKey && e.key === 'ArrowRight') return command('forward');
    if (e.key in step || e.key === 'Home' || e.key === 'End') {
      if (!n) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : Math.max(0, Math.min(n - 1, focusIndex + step[e.key]));
      focusAt(next);
      if (!mod) onSelect(getKey(items[next]), e.shiftKey ? 'range' : 'replace');
      return;
    }
    const focused = items[focusIndex];
    if (e.key === 'Enter' && focused !== undefined) {
      e.preventDefault();
      onOpen(focused);
      return;
    }
    if (e.key === ' ' && focused !== undefined) {
      e.preventDefault();
      onSelect(getKey(focused), mod ? 'toggle' : 'replace');
      return;
    }
    const key = e.key.toLowerCase();
    if (mod && key === 'a') {
      e.preventDefault();
      onSelectAll?.();
      return;
    }
    if (mod && key === 'c') return command('copy');
    if (mod && key === 'x') return command('cut');
    if (mod && key === 'v') return command('paste');
    if (e.key === 'F2') return command('rename');
    // Shift + Delete is left to the app (it usually means "delete for good").
    if (e.key === 'Delete' && !e.shiftKey) return command('delete');
    if (e.key === 'Backspace') return command('up');
    if (e.key === 'Escape' && selection.size) {
      e.preventDefault();
      onClearSelection?.();
    }
  };

  const indices: number[] = [];
  for (let i = start; i < end; i++) indices.push(i);
  // The focused tile stays drawn, so the focus isn't lost while it scrolls away.
  if (n && (focusIndex < start || focusIndex >= end)) indices.push(focusIndex);

  const selecting = selection.size > 0;
  const onEmpty = (target: EventTarget) => target === rootRef.current || target === listRef.current;

  return (
    <div
      ref={setRoot}
      className={cx('ps-media-grid', `ps-media-grid--${size}`, className)}
      onScroll={(e) => {
        onScroll?.(e);
        // A grid drawn before its size was known measures again as soon as it moves.
        if (!measured) measure();
        setScrollTop(e.currentTarget.scrollTop);
      }}
      onClick={(e) => onEmpty(e.target) && onClearSelection?.()}
      onContextMenu={(e) => {
        if (!onEmpty(e.target) || !onContextMenu) return;
        e.preventDefault();
        onContextMenu(e, null);
      }}
      {...rest}
    >
      {hasHeader && <div className="ps-media-grid-header">{header}</div>}
      {n === 0 && <div className="ps-media-grid-empty">{empty ?? <EmptyState>{labels.mediaEmpty}</EmptyState>}</div>}
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-multiselectable="true"
        aria-orientation="horizontal"
        className={cx('ps-media-grid-items', measured && 'is-measured')}
        style={measured ? { height: layout.height } : undefined}
        tabIndex={n ? -1 : 0}
        onKeyDown={onKeyDown}
      >
        {indices.map((i) => {
          const item = items[i];
          const key = getKey(item);
          const selected = selection.has(key);
          const extra = itemProps?.(item) ?? {};
          const style: React.CSSProperties | undefined = measured
            ? {
                width: layout.tileWidth,
                height: layout.rowHeight,
                transform: `translate(${(i % layout.columns) * (layout.tileWidth + box.gap)}px, ${Math.floor(i / layout.columns) * layout.stride}px)`,
              }
            : undefined;
          return (
            <div
              {...extra}
              key={key}
              role="option"
              aria-selected={selected}
              aria-posinset={i + 1}
              aria-setsize={n}
              data-index={i}
              tabIndex={i === focusIndex ? 0 : -1}
              className={cx('ps-media-grid-cell', extra.className)}
              style={{ ...extra.style, ...style }}
              onFocus={(e) => {
                extra.onFocus?.(e);
                if (e.target !== e.currentTarget || i === focusIndex) return;
                setFocusIndex(i);
                onFocusItem?.(item);
              }}
              onClick={(e) => {
                extra.onClick?.(e);
                setFocusIndex(i);
                const onCheck = (e.target as HTMLElement).closest('[data-media-check]') !== null;
                onSelect(key, e.shiftKey ? 'range' : onCheck || e.ctrlKey || e.metaKey ? 'toggle' : 'replace');
              }}
              onDoubleClick={(e) => {
                extra.onDoubleClick?.(e);
                if ((e.target as HTMLElement).closest('[data-media-check]')) return;
                onOpen(item);
              }}
              onContextMenu={(e) => {
                extra.onContextMenu?.(e);
                if (!onContextMenu) return;
                e.preventDefault();
                if (!selected) onSelect(key, 'replace');
                onContextMenu(e, item);
              }}
            >
              {renderTile(item, { index: i, selected, selecting })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A scrolling grid of media tiles that draws only the rows on screen, so a folder of tens of
 * thousands of files scrolls like one of ten. Tiles are square with a caption and stretch to fill
 * each row. It has a desktop's selection (click, Ctrl + click, Shift + click, the check on a tile,
 * the arrows by row and column, Ctrl + A) and reports it: the app keeps the selection.
 */
export const MediaGrid = forwardRef(MediaGridInner) as <T>(
  props: MediaGridProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;
(MediaGrid as { displayName?: string }).displayName = 'MediaGrid';
