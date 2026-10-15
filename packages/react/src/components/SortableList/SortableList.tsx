import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { IconGrip } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cssDurationMs, cssVar } from '../../lib/css';
import { cx } from '../../lib/cx';

/**
 * Moves the item with `sourceId` to where `targetId` is: the usual body of `onReorder`.
 * Returns null when nothing moves (the same id, or either id missing).
 */
export function moveById<T extends { id: string }>(items: readonly T[], sourceId: string, targetId: string): T[] | null {
  if (sourceId === targetId) return null;
  const from = items.findIndex((i) => i.id === sourceId);
  const to = items.findIndex((i) => i.id === targetId);
  if (from === -1 || to === -1) return null;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** True when a dragleave really leaves the element: moving onto one of its children fires it too. */
function isDragLeavingElement(e: React.DragEvent): boolean {
  const next = e.relatedTarget as Node | null;
  return !next || !(e.currentTarget as Node).contains(next);
}

/** What a sortable item needs: spread it onto the item's root element. */
export interface SortableItemProps {
  draggable: true;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export interface UseSortableOptions {
  /** The items' ids, in their current order. */
  ids: string[];
  /** Move `sourceId` to where `targetId` is (see `moveById`). */
  onReorder: (sourceId: string, targetId: string) => void;
  /** After a move from the keyboard, with the item's new index. */
  onKeyboardMove?: (id: string, index: number) => void;
}

/**
 * Drag to reorder, and Alt + ↑ / ↓ from anywhere inside an item, for a list of items with ids.
 * `itemProps(id)` wires an item; `isDragging` and `isDragOver` drive its look. Only this list's
 * own drags count: not a nested list's items, a selection dragged out of a field, or a file.
 */
export function useSortable({ ids, onReorder, onKeyboardMove }: UseSortableOptions) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const reset = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const itemProps = (id: string): SortableItemProps => ({
    draggable: true,
    onDragStart: (e) => {
      if (e.target !== e.currentTarget) return;
      setDraggedId(id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    },
    onDragOver: (e) => {
      if (!draggedId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverId !== id) setDragOverId(id);
    },
    onDragLeave: (e) => {
      if (isDragLeavingElement(e)) setDragOverId(null);
    },
    onDrop: (e) => {
      e.preventDefault();
      if (draggedId && draggedId !== id) onReorder(draggedId, id);
      reset();
    },
    onDragEnd: reset,
    onKeyDown: (e) => {
      if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      const from = ids.indexOf(id);
      const to = from + (e.key === 'ArrowUp' ? -1 : 1);
      if (from === -1 || to < 0 || to >= ids.length) return;
      e.preventDefault();
      e.stopPropagation();
      // Moving the row in the page can drop focus; give it back to what had it.
      const focused = document.activeElement as HTMLElement | null;
      onReorder(id, ids[to]);
      onKeyboardMove?.(id, to);
      requestAnimationFrame(() => {
        if (focused?.isConnected && document.activeElement !== focused) focused.focus();
      });
    },
  });

  return {
    itemProps,
    isDragging: (id: string) => draggedId === id,
    isDragOver: (id: string) => dragOverId === id && draggedId !== id,
  };
}

/** Ids that appeared after the first render: only rows created now play the enter animation. */
function useNewIds(ids: string[]): Set<string> {
  const seen = useRef<Set<string> | null>(null);
  const fresh = useRef(new Set<string>());
  if (seen.current === null) {
    seen.current = new Set(ids);
  } else {
    for (const id of ids) {
      if (!seen.current.has(id)) {
        seen.current.add(id);
        fresh.current.add(id);
      }
    }
  }
  return fresh.current;
}

/** When the order changes, rows glide to their new place instead of jumping (FLIP). Rows need a `data-id`. */
function useFlip(containerRef: React.RefObject<HTMLElement>, ids: string[]) {
  const positions = useRef(new Map<string, number>());
  const orderKey = ids.join('|');

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    if (base.height === 0) return; // a hidden page: measure the next time it shows
    const next = new Map<string, number>();
    const animate = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timing = { duration: cssDurationMs('--ps-dur-3'), easing: cssVar('--ps-ease-standard') || 'ease' };
    for (const child of Array.from(container.children) as HTMLElement[]) {
      const id = child.dataset.id;
      if (!id) continue;
      const top = child.getBoundingClientRect().top - base.top;
      next.set(id, top);
      const old = positions.current.get(id);
      if (animate && old !== undefined && Math.abs(old - top) > 1) {
        child.animate?.([{ transform: `translateY(${old - top}px)` }, { transform: 'none' }], timing);
      }
    }
    positions.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey]);
}

export interface SortableListProps<T extends { id: string }> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: T[];
  /** Move `sourceId` to where `targetId` is; `moveById` does it for an array. */
  onReorder: (sourceId: string, targetId: string) => void;
  /** A row's content, after its grip: text, controls and its tools (a ⋮ menu). */
  renderItem: (item: T) => React.ReactNode;
  /** Extra classes for a row, e.g. a finished task. */
  itemClassName?: (item: T) => string | undefined;
  /** Extra attributes for a row, e.g. a right-click menu. Its drag and key handlers can't be replaced. */
  itemProps?: (item: T) => React.HTMLAttributes<HTMLDivElement>;
  /** Shown instead of the rows when there are none. */
  empty?: React.ReactNode;
  /** The list's accessible name. */
  ariaLabel?: string;
  labels?: LabelOverrides<'dragToReorder' | 'reorderKeys' | 'movedTo'>;
}

/**
 * A list whose rows can be dragged into a new order by their grip, or moved with Alt + ↑ / ↓.
 * Rows glide to their place, new rows slide in, and a keyboard move is announced.
 */
export const SortableList = <T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  itemClassName,
  itemProps,
  empty,
  ariaLabel,
  labels: ownLabels,
  className,
  ...rest
}: SortableListProps<T>): React.ReactElement => {
  const labels = useLabels(ownLabels);
  const hintId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const ids = items.map((i) => i.id);
  const newIds = useNewIds(ids);
  useFlip(listRef, ids);
  const [announcement, setAnnouncement] = useState('');
  const sortable = useSortable({
    ids,
    onReorder,
    onKeyboardMove: (_, index) =>
      setAnnouncement(labels.movedTo.replace('{position}', String(index + 1)).replace('{total}', String(ids.length))),
  });

  return (
    <div className={cx('ps-sortable-list', className)} {...rest}>
      {items.length === 0 ? (
        empty
      ) : (
        <>
          <p id={hintId} className="ps-visually-hidden">{labels.reorderKeys}</p>
          <div ref={listRef} role="list" aria-label={ariaLabel} aria-describedby={hintId} className="ps-sortable-list-items">
            {items.map((item) => {
              const extra = itemProps?.(item);
              return (
                <div
                  key={item.id}
                  role="listitem"
                  data-id={item.id}
                  {...extra}
                  {...sortable.itemProps(item.id)}
                  className={cx(
                    'ps-sortable-item',
                    sortable.isDragging(item.id) && 'is-dragging',
                    sortable.isDragOver(item.id) && 'is-drag-over',
                    newIds.has(item.id) && 'is-new',
                    itemClassName?.(item),
                    extra?.className
                  )}
                >
                  <IconGrip className="ps-sortable-item-grip" title={labels.dragToReorder} />
                  {renderItem(item)}
                </div>
              );
            })}
          </div>
        </>
      )}
      <span role="status" className="ps-visually-hidden">{announcement}</span>
    </div>
  );
};
