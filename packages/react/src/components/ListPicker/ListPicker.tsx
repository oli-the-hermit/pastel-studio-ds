import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconPlus } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { useBlockingOverlay } from '../../lib/overlays';
import { Checkbox } from '../Checkbox';
import { Popover } from '../Popover';
import { SearchField } from '../SearchField';

export interface ListPickerOption {
  value: string;
  label: string;
  /** At the end of the row: a count. */
  meta?: React.ReactNode;
  /** At the start, after the check: a cover or a color. */
  leading?: React.ReactNode;
}

/** An option's state: checked, not, or checked for part of what the picker applies to. */
export type ListPickerState = boolean | 'mixed';

type ListPickerWord = 'noMatches' | 'recent' | 'allItems' | 'createNamed';

export interface ListPickerPanelProps {
  /** What is being picked, "Tags": the search field's placeholder and the list's name. */
  label: string;
  options: readonly ListPickerOption[];
  stateOf: (value: string) => ListPickerState;
  /** Checking a mixed option checks it for all. */
  onChange: (value: string, checked: boolean) => void;
  /** Values picked lately, shown first under "Recent" until the person searches. */
  recent?: readonly string[];
  /** Offers to create what was typed when nothing has exactly that name. */
  onCreate?: (name: string) => void;
  /** Focus the search field when it appears. */
  autoFocus?: boolean;
  /** The search it starts with. */
  defaultQuery?: string;
  className?: string;
  labels?: LabelOverrides<ListPickerWord>;
}

export interface ListPickerProps extends Omit<ListPickerPanelProps, 'autoFocus' | 'className' | 'defaultQuery'> {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  align?: 'start' | 'end';
}

const norm = (text: string) => text.trim().toLocaleLowerCase();

/**
 * The content of a ListPicker without its popover: the search field and the check boxes, to put
 * in a panel or a page of its own.
 */
export function ListPickerPanel({ label, options, stateOf, onChange, recent, onCreate, autoFocus = false, defaultQuery = '', className, labels: ownLabels }: ListPickerPanelProps) {
  const labels = useLabels(ownLabels);
  const listId = useId();
  const [query, setQuery] = useState(defaultQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [autoFocus]);

  const q = norm(query);
  const { top, rest } = useMemo(() => {
    const matches = options.filter((o) => !q || norm(o.label).includes(q));
    if (q || !recent?.length) return { top: [], rest: matches };
    const firsts = recent.map((v) => matches.find((o) => o.value === v)).filter((o): o is ListPickerOption => o !== undefined);
    return { top: firsts, rest: matches.filter((o) => !recent.includes(o.value)) };
  }, [options, q, recent]);
  const canCreate = onCreate !== undefined && q !== '' && !options.some((o) => norm(o.label) === q);

  const create = () => {
    if (!canCreate) return;
    onCreate(query.trim());
    setQuery('');
  };

  const rows = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('input, button') ?? []);
  const move = (from: HTMLElement | null, step: number) => {
    const all = rows();
    if (!all.length) return;
    const i = from ? all.indexOf(from) : -1;
    if (i + step < 0) return searchRef.current?.focus();
    all[Math.min(all.length - 1, i + step)]?.focus();
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(target, e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const all = rows();
      (e.key === 'Home' ? all[0] : all[all.length - 1])?.focus();
    } else if (e.key === 'Enter' && target instanceof HTMLInputElement) {
      e.preventDefault();
      target.click();
    }
  };

  const row = (o: ListPickerOption) => {
    const state = stateOf(o.value);
    return (
      <label key={o.value} className={cx('ps-list-picker-row', state === true && 'is-checked')}>
        <Checkbox
          checked={state === true}
          mixed={state === 'mixed'}
          onChange={(checked) => onChange(o.value, state === 'mixed' ? true : checked)}
        />
        {o.leading && <span className="ps-list-picker-leading">{o.leading}</span>}
        <span className="ps-list-picker-label">{o.label}</span>
        {o.meta !== undefined && <span className="ps-list-picker-meta">{o.meta}</span>}
      </label>
    );
  };

  return (
    <div className={cx('ps-list-picker', className)}>
      <div className="ps-list-picker-search">
        <SearchField
          ref={searchRef}
          value={query}
          onChange={setQuery}
          placeholder={label}
          aria-controls={listId}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              move(null, 1);
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              const only = top.length + rest.length === 1 ? (top[0] ?? rest[0]) : undefined;
              // The one match is what was meant; with none, what was typed is new.
              if (only) onChange(only.value, stateOf(only.value) !== true);
              else if (canCreate && top.length + rest.length === 0) create();
            }
          }}
        />
      </div>
      <div ref={listRef} id={listId} role="group" aria-label={label} className="ps-list-picker-list" onKeyDown={onListKeyDown}>
        {top.length > 0 && <p className="ps-list-picker-heading">{labels.recent}</p>}
        {top.map(row)}
        {top.length > 0 && rest.length > 0 && <p className="ps-list-picker-heading">{labels.allItems}</p>}
        {rest.map(row)}
        {top.length + rest.length === 0 && !canCreate && <p className="ps-list-picker-empty">{labels.noMatches}</p>}
        {canCreate && (
          <button type="button" className="ps-list-picker-create" onClick={create}>
            <IconPlus size={16} />
            <span>{labels.createNamed.replace('{name}', query.trim())}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A searchable list to check items off, anchored to its button: tags or collections for one item
 * or a whole selection (where an option can be mixed). Recent picks come first, and what was typed
 * can be created. Each row is a real check box, so it reads out and toggles as one.
 */
export function ListPicker({ open, anchorRef, onClose, align = 'start', ...panel }: ListPickerProps) {
  // The app's shortcuts pause while it is open: its rows take arrows, Space and Enter.
  useBlockingOverlay(open);
  // A fresh panel each time it opens (an empty search), kept while the popover leaves.
  const [session, setSession] = useState(0);
  useEffect(() => {
    if (open) setSession((n) => n + 1);
  }, [open]);
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align={align} matchWidth={false} ariaLabel={panel.label} role="dialog">
      <ListPickerPanel key={session} {...panel} autoFocus={open} />
    </Popover>
  );
}
