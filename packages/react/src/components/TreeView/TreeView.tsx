import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { IconChevronRight } from '../../icons';
import { cx } from '../../lib/cx';
import { useControllable } from '../../lib/useControllable';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  /** Shows a chevron before the children are loaded. */
  hasChildren?: boolean;
  /** At the end of the row: a pin, a count, a drive meter. */
  trailing?: React.ReactNode;
  /** A heading between groups; it is not focusable. */
  heading?: boolean;
  /** A gap between groups. */
  separator?: boolean;
}

export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  nodes: TreeNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Controlled open nodes; or leave it out and start from `defaultExpanded`. */
  expanded?: ReadonlySet<string>;
  defaultExpanded?: Iterable<string>;
  onExpandedChange?: (expanded: Set<string>) => void;
  /** Called when a node opens: load its children here. */
  onExpand?: (id: string) => void;
  /** Accessible name, e.g. "Folders". */
  label: string;
  /** `md` rows for a navigation pane; `sm` denser rows for a dialog's sidebar. */
  size?: 'md' | 'sm';
}

interface Flat {
  node: TreeNode;
  level: number;
  parent?: string;
}

const expandable = (n: TreeNode) => !!(n.children?.length || n.hasChildren);

/**
 * A navigation tree of folders and places. One tab stop; ↑ and ↓ move, → opens or enters,
 * ← closes or goes to the parent, Enter or Space opens the folder.
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(({ nodes, selectedId, onSelect, expanded, defaultExpanded, onExpandedChange, onExpand, label, size = 'md', className, ...rest }, ref) => {
  const [open, setOpen] = useControllable<ReadonlySet<string>>(expanded, new Set(defaultExpanded ?? []), (v) => onExpandedChange?.(new Set(v)));
  const [focusId, setFocusId] = useState(selectedId);
  const listRef = useRef<HTMLUListElement | null>(null);

  const flat = useMemo(() => {
    const out: Flat[] = [];
    const walk = (list: TreeNode[], level: number, parent?: string) => {
      for (const node of list) {
        out.push({ node, level, parent });
        if (node.children && open.has(node.id)) walk(node.children, level + 1, node.id);
      }
    };
    walk(nodes, 1);
    return out;
  }, [nodes, open]);
  const focusable = flat.filter((f) => !f.node.heading && !f.node.separator);
  const tabStop = focusable.find((f) => f.node.id === (focusId ?? selectedId))?.node.id ?? focusable[0]?.node.id;

  const toggle = (id: string, to?: boolean) => {
    const next = new Set(open);
    if (to ?? !next.has(id)) {
      next.add(id);
      onExpand?.(id);
    } else next.delete(id);
    setOpen(next);
  };
  const focus = (id: string) => {
    setFocusId(id);
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus());
  };

  const onKeyDown = (e: React.KeyboardEvent, f: Flat) => {
    const i = focusable.indexOf(f);
    const n = f.node;
    const go = (j: number) => {
      e.preventDefault();
      const t = focusable[Math.max(0, Math.min(focusable.length - 1, j))];
      if (t) focus(t.node.id);
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(focusable.length - 1);
    else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (expandable(n) && !open.has(n.id)) toggle(n.id, true);
      else if (open.has(n.id) && n.children?.[0]) focus(n.children[0].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (open.has(n.id)) toggle(n.id, false);
      else if (f.parent) focus(f.parent);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(n.id);
    } else if (e.key === '*') {
      e.preventDefault();
      const siblings = flat.filter((x) => x.parent === f.parent && expandable(x.node)).map((x) => x.node.id);
      siblings.filter((id) => !open.has(id)).forEach((id) => onExpand?.(id));
      setOpen(new Set([...open, ...siblings]));
    }
  };

  return (
    <ul
      ref={(el) => {
        listRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      role="tree"
      aria-label={label}
      className={cx('ps-tree-view', size === 'sm' && 'ps-tree-view--sm', className)}
      {...rest}
    >
      {flat.map((f) => {
        const n = f.node;
        if (n.separator) return <li key={n.id} role="none" className="ps-tree-view-separator" />;
        if (n.heading) return <li key={n.id} role="none" className="ps-tree-view-heading">{n.label}</li>;
        const isOpen = open.has(n.id);
        const selected = n.id === selectedId;
        return (
          <li
            key={n.id}
            data-id={n.id}
            role="treeitem"
            aria-level={f.level}
            aria-expanded={expandable(n) ? isOpen : undefined}
            aria-selected={selected}
            tabIndex={n.id === tabStop ? 0 : -1}
            className={cx('ps-tree-view-item', selected && 'is-selected')}
            style={{ '--ps-tree-view-level': f.level - 1 } as React.CSSProperties}
            onClick={() => {
              setFocusId(n.id);
              onSelect(n.id);
            }}
            onKeyDown={(e) => onKeyDown(e, f)}
          >
            <span
              className={cx('ps-tree-view-twisty', !expandable(n) && 'is-leaf', isOpen && 'is-open')}
              aria-hidden="true"
              onClick={(e) => {
                if (!expandable(n)) return;
                e.stopPropagation();
                toggle(n.id);
              }}
            >
              <IconChevronRight size={14} />
            </span>
            {n.icon && <span className="ps-tree-view-icon">{n.icon}</span>}
            <span className="ps-tree-view-label">{n.label}</span>
            {n.trailing && <span className="ps-tree-view-trailing">{n.trailing}</span>}
          </li>
        );
      })}
    </ul>
  );
});
TreeView.displayName = 'TreeView';
