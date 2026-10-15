import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { IconChevronRight, IconMore } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { Menu } from '../Menu';

export interface Crumb {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AddressBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** From the root to the current folder. */
  path: Crumb[];
  onNavigate: (id: string) => void;
  /** The folders inside a crumb, for the chevron menus between crumbs. */
  childrenOf?: (id: string) => Crumb[];
  /** The text shown when editing ("C:\\Users\\San\\Music"); defaults to the labels joined by "\\". */
  pathText?: string;
  /** Turns on the editable path (a click in the empty end, or F4); Enter calls it. */
  onSubmitPath?: (text: string) => void;
  /** Crumbs shown before the earlier ones fold into a menu. */
  maxVisible?: number;
  labels?: LabelOverrides<'address' | 'foldersIn' | 'earlierFolders' | 'editPath'>;
}

/**
 * The location field of a file browser: breadcrumbs you can click, chevrons that list a folder's
 * subfolders and, with `onSubmitPath`, an editable path on a click in the empty end or F4.
 */
export const AddressBar = forwardRef<HTMLElement, AddressBarProps>(({ path, onNavigate, childrenOf, pathText, onSubmitPath, maxVisible = 4, labels: ownLabels, className, onKeyDown, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  // Leaving the path by key puts focus back on its button, not on the page.
  const refocus = useRef(false);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (refocus.current) {
      refocus.current = false;
      editRef.current?.focus();
    }
  }, [editing]);
  const startEditing = () => {
    setText(pathText ?? path.map((p) => p.label).join('\\'));
    setEditing(true);
  };
  const stopEditing = () => {
    refocus.current = true;
    setEditing(false);
  };

  if (editing && onSubmitPath) {
    return (
      <div className={cx('ps-address-bar', 'is-editing', className)}>
        <input
          ref={inputRef}
          className="ps-address-bar-input"
          aria-label={labels.address}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmitPath(text);
              stopEditing();
            }
            if (e.key === 'Escape') {
              e.stopPropagation();
              stopEditing();
            }
          }}
        />
      </div>
    );
  }

  const hidden = path.length > maxVisible ? path.slice(0, path.length - maxVisible) : [];
  const shown = path.slice(hidden.length);
  const separator = <span className="ps-address-bar-separator" aria-hidden="true"><IconChevronRight size={14} /></span>;
  const toMenu = (list: Crumb[]) => list.map((c) => ({ key: c.id, label: c.label, icon: c.icon, onSelect: () => onNavigate(c.id) }));

  return (
    <nav
      ref={ref}
      className={cx('ps-address-bar', className)}
      aria-label={labels.address}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === 'F4' && onSubmitPath) {
          e.preventDefault();
          startEditing();
        }
      }}
      {...rest}
    >
      <ol className="ps-address-bar-crumbs">
        {hidden.length > 0 && (
          <li className="ps-address-bar-crumb is-overflow">
            <Menu items={toMenu(hidden)} align="start" ariaLabel={labels.earlierFolders} triggerClassName="ps-address-bar-segment" trigger={<IconMore size={14} className="ps-address-bar-overflow-icon" />} />
            {separator}
          </li>
        )}
        {shown.map((c, i) => {
          const last = i === shown.length - 1;
          const kids = childrenOf?.(c.id) ?? [];
          return (
            <li key={c.id} className="ps-address-bar-crumb">
              <button type="button" className={cx('ps-address-bar-segment', last && 'is-current')} aria-current={last ? 'location' : undefined} onClick={() => onNavigate(c.id)}>
                {c.icon}
                <span className="ps-address-bar-label">{c.label}</span>
              </button>
              {kids.length > 0 ? (
                <Menu items={toMenu(kids)} align="start" ariaLabel={labels.foldersIn.replace('{name}', c.label)} triggerClassName="ps-address-bar-chevron" trigger={<IconChevronRight size={14} />} />
              ) : !last && separator}
            </li>
          );
        })}
      </ol>
      {onSubmitPath && <button ref={editRef} type="button" className="ps-address-bar-edit" aria-label={labels.editPath} title={`${labels.editPath} (F4)`} onClick={startEditing} />}
    </nav>
  );
});
AddressBar.displayName = 'AddressBar';
