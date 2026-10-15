import React, { forwardRef, useRef } from 'react';
import { IconGrip } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { useFlip, useNewIds } from '../../lib/listMotion';
import { Card, PanelHeader } from '../Card';
import { EmptyState } from '../EmptyState';
import { IconButton } from '../IconButton';
import type { SortableItemProps } from '../SortableList';

export interface QueuePanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title: React.ReactNode;
  /** Usually a small tonal "New …" button. */
  action?: React.ReactNode;
  /** The items' ids, in order: new ones slide in and reorders glide. */
  ids: string[];
  /** Shown when there are no items. */
  emptyMessage: React.ReactNode;
  /** An id for the list element. */
  listId?: string;
  /** Renders the rows (QueueItems); `isNew(id)` is true for a row just added. */
  children: (isNew: (id: string) => boolean) => React.ReactNode;
}

/** A side panel holding a queue of QueueItems: a header with its action, then the rows or an empty message. */
export const QueuePanel = forwardRef<HTMLElement, QueuePanelProps>(({ title, action, ids, emptyMessage, listId, className, children, ...rest }, ref) => {
  const listRef = useRef<HTMLDivElement>(null);
  const newIds = useNewIds(ids);
  useFlip(listRef, ids);
  return (
    <Card ref={ref} className={cx('ps-queue-panel', className)} {...rest}>
      <PanelHeader title={title} action={action} />
      <div className="ps-queue-panel-list" id={listId} ref={listRef}>
        {ids.length === 0 ? <EmptyState size="sm">{emptyMessage}</EmptyState> : children((id) => newIds.has(id))}
      </div>
    </Card>
  );
});
QueuePanel.displayName = 'QueuePanel';

export interface QueueAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

export interface QueueItemProps {
  id: string;
  title: string;
  /** The selected row: filled with the accent. */
  active: boolean;
  onSelect: () => void;
  /** Before the name, e.g. a "now playing" mark. */
  leading?: React.ReactNode;
  /** After the name, e.g. a count. */
  trailing?: React.ReactNode;
  /** A second row of details; the tools sit on it. Without it they float over the end of the row. */
  meta?: React.ReactNode;
  /** Tools shown on hover and focus. */
  actions: QueueAction[];
  /** From `useSortable().itemProps(id)`: drag and Alt + arrows. */
  drag?: SortableItemProps;
  isDragging?: boolean;
  isDragOver?: boolean;
  /** Just created: plays the enter animation. */
  isNew?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  labels?: LabelOverrides<'dragToReorder'>;
}

/** One detail on a row's meta line, e.g. a length or an icon with a count. */
export const QueueMetaItem = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <span className="ps-queue-item-meta-item" title={title}>{children}</span>
);

/**
 * A selectable, reorderable row in a queue (sessions, task lists): the name owns the first line,
 * and the tools appear on hover so they never crop it. A click selects; the grip drags.
 */
export const QueueItem = ({
  id,
  title,
  active,
  onSelect,
  leading,
  trailing,
  meta,
  actions,
  drag,
  isDragging,
  isDragOver,
  isNew,
  onContextMenu,
  labels: ownLabels,
}: QueueItemProps) => {
  const labels = useLabels(ownLabels);
  // The tools sit on the accent fill when the row is active, else on the raised row.
  const surface = active ? ('accent' as const) : 3;
  const tools = (
    <div className={cx('ps-queue-item-actions', !meta && 'ps-queue-item-actions--floating')}>
      {actions.map((a) => (
        <IconButton
          key={a.key}
          label={a.label}
          size="xs"
          surface={surface}
          tone={a.danger ? 'danger' : 'default'}
          onClick={(e) => {
            e.stopPropagation();
            a.onClick();
          }}
        >
          {a.icon}
        </IconButton>
      ))}
    </div>
  );

  return (
    <div
      className={cx(
        'ps-queue-item',
        !meta && 'ps-queue-item--single',
        active && 'is-active',
        isDragging && 'is-dragging',
        isDragOver && 'is-drag-over',
        isNew && 'is-new'
      )}
      data-id={id}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onContextMenu={onContextMenu}
      onClick={onSelect}
      {...drag}
      onKeyDown={(e) => {
        drag?.onKeyDown(e);
        if (e.defaultPrevented) return;
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <IconGrip title={labels.dragToReorder} className="ps-queue-item-grip" />

      <div className="ps-queue-item-name-row">
        {leading}
        <span className="ps-queue-item-name" title={title}>{title}</span>
        {trailing && <span className="ps-queue-item-trailing">{trailing}</span>}
        {!meta && tools}
      </div>

      {meta && (
        <div className="ps-queue-item-meta-row">
          <div className="ps-queue-item-meta">{meta}</div>
          {tools}
        </div>
      )}
    </div>
  );
};
