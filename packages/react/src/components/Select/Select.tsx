import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconCheck, IconChevronDown, IconPlus, IconSearch } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { Popover } from '../Popover';

export interface SelectOption<T = string> {
  value: T;
  label: React.ReactNode;
  /** Secondary text shown right-aligned in the row (e.g. "3 left"). */
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Plain text used for search when `label` is not a string. */
  searchText?: string;
}

export interface SelectCreateOption<T = string> {
  /** The text of the row that starts creating, e.g. "New list". */
  label: string;
  placeholder?: string;
  /** Return a value to have it selected through `onChange`; return nothing to handle selection yourself. */
  onCreate: (name: string) => T | void;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Adds a hidden input with the value, for a form that submits natively. */
  name?: string;
  className?: string;
  ariaLabel?: string;
  /** `field` for forms, `header` for a large title-style trigger. */
  variant?: 'field' | 'header';
  /** Icon at the start of the trigger, shown instead of the selected option's own. */
  icon?: React.ReactNode;
  /** Inside the trigger, right after the value (e.g. a count chip). */
  valueAddon?: React.ReactNode;
  /**
   * Options used lately, newest first: the first 3 that match show on top under `label`,
   * then a separator and the rest. Without a match among them, only the rest shows.
   */
  recent?: { values: T[]; label: string };
  /** A last row that creates a new option from a typed name. */
  createOption?: SelectCreateOption<T>;
  /** A search box over the options. Defaults to on when there are more than 8. */
  searchable?: boolean;
  labels?: LabelOverrides<'selectPlaceholder' | 'options' | 'search' | 'searchOptions' | 'noMatches' | 'create' | 'newItemName'>;
}

const SEARCH_THRESHOLD = 8;
const RECENT_MAX = 3;

function optionText<T>(opt: SelectOption<T>): string {
  if (opt.searchText) return opt.searchText;
  return typeof opt.label === 'string' || typeof opt.label === 'number' ? String(opt.label) : '';
}

/** One choice from a list: a field-shaped trigger that opens the options, with search and create when needed. */
export const Select = <T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  id,
  name,
  className,
  ariaLabel,
  variant = 'field',
  icon,
  valueAddon,
  recent,
  createOption,
  searchable,
  labels: ownLabels,
}: SelectProps<T>): React.ReactElement => {
  const labels = useLabels(ownLabels);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState('');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const autoId = useId();
  const selectId = id || autoId;
  const listboxId = `${selectId}-listbox`;
  const optionId = (index: number) => `${selectId}-option-${index}`;

  const showSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  // The matching options, the recent ones first; recentCount of them form the top group.
  const [visibleOptions, recentCount] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? options.filter((o) => optionText(o).toLowerCase().includes(q)) : options;
    if (!recent) return [matches, 0] as const;
    const top = recent.values
      .map((v) => matches.find((o) => o.value === v))
      .filter((o): o is SelectOption<T> => !!o)
      .slice(0, RECENT_MAX);
    return [[...top, ...matches.filter((o) => !top.includes(o))], top.length] as const;
  }, [options, query, recent]);

  // The create row is a virtual last item for keyboard navigation.
  const itemCount = visibleOptions.length + (createOption ? 1 : 0);
  const createIndex = createOption ? visibleOptions.length : -1;
  const createId = `${selectId}-create`;

  const selectedOption = options.find((opt) => opt.value === value);

  const close = () => {
    setIsOpen(false);
    setIsCreating(false);
    setDraftName('');
    setQuery('');
    setHighlightedIndex(-1);
  };

  const open = () => {
    if (disabled || isOpen) return;
    setIsOpen(true);
    const idx = visibleOptions.findIndex((opt) => opt.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
  };

  const selectValue = (optValue: T) => {
    onChange(optValue);
    close();
    triggerRef.current?.focus();
  };

  const startCreate = () => {
    setIsCreating(true);
    setDraftName(query.trim());
  };

  const commitCreate = () => {
    const nameVal = draftName.trim();
    if (!nameVal || !createOption) return;
    const created = createOption.onCreate(nameVal);
    if (created !== undefined && created !== null) onChange(created as T);
    close();
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      if (isCreating) createInputRef.current?.focus();
      else if (showSearch) searchRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, isCreating, showSearch]);

  // Keep the highlighted row in view while navigating with the keyboard.
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const el = listRef.current?.parentElement?.querySelector<HTMLElement>(`[data-index="${highlightedIndex}"]`);
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const moveHighlight = (dir: 1 | -1) => {
    if (itemCount === 0) return;
    let next = highlightedIndex;
    for (let i = 0; i < itemCount; i++) {
      next = (next + dir + itemCount) % itemCount;
      if (next === createIndex || !visibleOptions[next]?.disabled) break;
    }
    setHighlightedIndex(next);
  };

  const handleNavKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveHighlight(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveHighlight(-1);
        break;
      case 'Enter': {
        e.preventDefault();
        if (highlightedIndex === createIndex) {
          startCreate();
        } else {
          const opt = visibleOptions[highlightedIndex];
          if (opt && !opt.disabled) selectValue(opt.value);
        }
        break;
      }
      case ' ':
        // Space types into the search box; on the trigger it selects.
        if (e.target === triggerRef.current) {
          e.preventDefault();
          const opt = visibleOptions[highlightedIndex];
          if (highlightedIndex === createIndex) startCreate();
          else if (opt && !opt.disabled) selectValue(opt.value);
        }
        break;
      case 'Tab':
        close();
        break;
    }
  };

  // The row the arrow keys are on, for screen readers: focus stays on the trigger or the search box.
  const activeId = !isOpen || isCreating || highlightedIndex < 0 ? undefined : highlightedIndex === createIndex ? createId : optionId(highlightedIndex);

  const triggerIcon = icon ?? selectedOption?.icon;

  return (
    <div className={cx('ps-select', variant === 'header' && 'ps-select--header', isOpen && 'is-open', className)}>
      {name && <input type="hidden" name={name} value={value !== undefined && value !== null ? String(value) : ''} />}

      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        className="ps-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={showSearch ? undefined : activeId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleNavKeyDown}
      >
        {triggerIcon && <span className="ps-select-option-icon">{triggerIcon}</span>}
        <span className={cx('ps-select-value', !selectedOption && 'is-placeholder')}>
          {selectedOption ? selectedOption.label : placeholder ?? labels.selectPlaceholder}
        </span>
        {valueAddon && <span className="ps-select-value-addon">{valueAddon}</span>}
        <span className="ps-select-chevron" aria-hidden="true">
          <IconChevronDown size={variant === 'header' ? 18 : 16} />
        </span>
      </button>

      <Popover
        open={isOpen}
        anchorRef={triggerRef}
        onClose={close}
        onEscape={() => {
          if (isCreating) {
            setIsCreating(false);
            setDraftName('');
          } else {
            close();
            triggerRef.current?.focus();
          }
        }}
        className="ps-select-menu"
      >
        {showSearch && !isCreating && (
          <div className="ps-select-search">
            <IconSearch size={15} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              placeholder={labels.search}
              role="combobox"
              aria-expanded
              aria-controls={listboxId}
              aria-activedescendant={activeId}
              aria-label={labels.searchOptions}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleNavKeyDown}
            />
          </div>
        )}

        <ul ref={listRef} id={listboxId} role="listbox" aria-label={ariaLabel || labels.options} className="ps-select-options">
          {visibleOptions.length === 0 && !createOption && <li className="ps-select-empty">{labels.noMatches}</li>}
          {recent && recentCount > 0 && <li role="presentation" className="ps-select-group-label">{recent.label}</li>}
          {visibleOptions.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <React.Fragment key={String(option.value)}>
                {index === recentCount && recentCount > 0 && <li role="separator" className="ps-select-separator" />}
                <li role="presentation">
                  <button
                    type="button"
                    role="option"
                    id={optionId(index)}
                    tabIndex={-1}
                    data-index={index}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    disabled={option.disabled}
                    className={cx('ps-select-option', isSelected && 'is-selected', index === highlightedIndex && 'is-highlighted')}
                    onClick={() => !option.disabled && selectValue(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="ps-select-option-check" aria-hidden="true">
                      {isSelected && <IconCheck size={15} strokeWidth={2.6} />}
                    </span>
                    {option.icon && <span className="ps-select-option-icon">{option.icon}</span>}
                    <span className="ps-select-option-label">{option.label}</span>
                    {option.meta && <span className="ps-select-option-meta">{option.meta}</span>}
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        {createOption && (
          <div className="ps-select-create">
            {isCreating ? (
              <div className="ps-select-create-form">
                <input
                  ref={createInputRef}
                  type="text"
                  value={draftName}
                  placeholder={createOption.placeholder || labels.newItemName}
                  aria-label={createOption.label}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      commitCreate();
                    }
                  }}
                />
                <button
                  type="button"
                  className="ps-select-create-confirm"
                  onClick={commitCreate}
                  disabled={!draftName.trim()}
                  aria-label={labels.create}
                >
                  <IconCheck size={16} strokeWidth={2.6} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id={createId}
                tabIndex={-1}
                data-index={createIndex}
                className={cx('ps-select-create-button', highlightedIndex === createIndex && 'is-highlighted')}
                onClick={startCreate}
                onMouseEnter={() => setHighlightedIndex(createIndex)}
              >
                <IconPlus size={16} strokeWidth={2.4} />
                {createOption.label}
              </button>
            )}
          </div>
        )}
      </Popover>
    </div>
  );
};
