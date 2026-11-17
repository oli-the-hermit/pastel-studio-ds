import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconClose, IconSearch } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { mergeRefs } from '../../lib/mergeRefs';
import { IconButton } from '../IconButton';
import { Popover } from '../Popover';

/** One suggestion. Suggestions with the same `group` are listed together under its name. */
export interface ComboboxOption {
  id: string;
  label: string;
  /** A second, quieter line: a folder's path, a count. */
  detail?: string;
  icon?: React.ReactNode;
  group?: string;
  /** The text the field takes when it is picked or completed. Defaults to `label`. */
  value?: string;
}

export interface ComboboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSubmit' | 'type' | 'size' | 'onSelect'> {
  value: string;
  onChange: (value: string) => void;
  /** Enter with no suggestion highlighted: use the text as typed. */
  onSubmit?: (value: string) => void;
  /** A suggestion was picked (click or Enter). Without it, picking puts its `value` in the field. */
  onPick?: (option: ComboboxOption) => void;
  /** Suggestions for the current text, worked out by the caller. */
  suggestions?: ComboboxOption[];
  /**
   * Or fetched: called after the typing pauses, with a signal that aborts when the text changes
   * again; a stale answer is never shown.
   */
  loadSuggestions?: (text: string, signal: AbortSignal) => Promise<ComboboxOption[]>;
  /** How long the typing pauses before `loadSuggestions`, in ms. */
  debounce?: number;
  /** Shown while the field is empty, e.g. the places used last. */
  recent?: { label: string; items: ComboboxOption[] };
  /** `search` is the pill of SearchField with its icon and clear button; `field` matches TextInput. */
  variant?: 'field' | 'search';
  /** Inside the field at its end, e.g. an IconButton that opens a native picker. */
  endAdornment?: React.ReactNode;
  /** The field's accessible name when no Field label points at it. Defaults to the placeholder. */
  ariaLabel?: string;
  /** Classes on the field's box. */
  className?: string;
  labels?: LabelOverrides<'suggestions' | 'clearSearch' | 'loading'>;
}

/**
 * A text field that suggests as you type: a list under it, grouped, with what was used recently
 * while it's empty. ↑ and ↓ move through the list, Enter picks (or submits the text), Tab
 * completes the field with the highlighted suggestion, Escape closes the list and then clears.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      onPick,
      suggestions,
      loadSuggestions,
      debounce = 150,
      recent,
      variant = 'field',
      endAdornment,
      ariaLabel,
      placeholder,
      className,
      labels: ownLabels,
      id,
      disabled,
      onKeyDown,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const autoId = useId();
    const inputId = id ?? autoId;
    const listId = `${inputId}-list`;
    const boxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const setRefs = useMemo(() => mergeRefs(ref, inputRef), [ref]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [loaded, setLoaded] = useState<{ text: string; options: ComboboxOption[] } | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetched suggestions, for the text as it is once the typing pauses.
    useEffect(() => {
      if (!loadSuggestions || !value) {
        setLoaded(null);
        setLoading(false);
        return;
      }
      const controller = new AbortController();
      setLoading(true);
      const t = window.setTimeout(() => {
        loadSuggestions(value, controller.signal).then(
          (options) => {
            if (controller.signal.aborted) return;
            setLoaded({ text: value, options });
            setLoading(false);
          },
          () => {
            if (!controller.signal.aborted) setLoading(false);
          }
        );
      }, debounce);
      return () => {
        window.clearTimeout(t);
        controller.abort();
      };
    }, [value, loadSuggestions, debounce]);

    const showingRecent = !value && !!recent?.items.length;
    const options = useMemo(() => {
      if (!value) return recent?.items.map((o) => ({ ...o, group: o.group ?? recent.label })) ?? [];
      const own = suggestions ?? [];
      const fetched = loaded && loaded.text === value ? loaded.options : [];
      const seen = new Set(own.map((o) => o.id));
      return [...own, ...fetched.filter((o) => !seen.has(o.id))];
    }, [value, suggestions, loaded, recent]);

    // The list follows what there is to show; the highlight starts over when the options change.
    useEffect(() => setActive(-1), [options]);
    const listShown = open && !disabled && (options.length > 0 || (loading && !!value));

    const pick = (option: ComboboxOption) => {
      setOpen(false);
      if (onPick) onPick(option);
      else onChange(option.value ?? option.label);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      const n = options.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!listShown) {
          setOpen(true);
          return;
        }
        if (!n) return;
        setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % n : i <= 0 ? n - 1 : i - 1));
      } else if (e.key === 'Enter') {
        if (listShown && active >= 0 && options[active]) {
          e.preventDefault();
          pick(options[active]);
        } else {
          setOpen(false);
          onSubmit?.(value);
        }
      } else if (e.key === 'Tab' && !e.shiftKey && listShown && active >= 0 && options[active]) {
        // Completes the text and keeps typing here, as a shell completes a path.
        e.preventDefault();
        onChange(options[active].value ?? options[active].label);
      } else if (e.key === 'Escape') {
        // The list closes first (Popover catches that Escape); then the text clears.
        if (!listShown && value) {
          e.stopPropagation();
          e.preventDefault();
          onChange('');
        }
      }
    };

    // Groups in the order they first appear.
    const groups: { name: string | undefined; items: { option: ComboboxOption; index: number }[] }[] = [];
    options.forEach((option, index) => {
      const last = groups[groups.length - 1];
      if (last && last.name === option.group) last.items.push({ option, index });
      else groups.push({ name: option.group, items: [{ option, index }] });
    });
    const optionId = (i: number) => `${listId}-${i}`;

    return (
      <>
        <div
          ref={boxRef}
          className={cx('ps-combobox', `ps-combobox--${variant}`, value && 'is-filled', disabled && 'is-disabled', className)}
          onMouseDown={(e) => {
            // A press on the box (not on a button in it) focuses the text.
            if (e.target === e.currentTarget) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          {variant === 'search' && (
            <span className="ps-combobox-icon" aria-hidden="true">
              <IconSearch size={16} />
            </span>
          )}
          <input
            ref={setRefs}
            id={inputId}
            type="text"
            role="combobox"
            className="ps-combobox-input"
            autoComplete="off"
            spellCheck={false}
            aria-label={rest['aria-labelledby'] ? undefined : ariaLabel ?? placeholder}
            aria-autocomplete="list"
            aria-expanded={listShown}
            aria-controls={listId}
            aria-activedescendant={listShown && active >= 0 ? optionId(active) : undefined}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={(e) => {
              onFocus?.(e);
              setOpen(true);
            }}
            onBlur={(e) => {
              onBlur?.(e);
              setOpen(false);
            }}
            onKeyDown={handleKeyDown}
            {...rest}
          />
          {variant === 'search' && value && (
            <IconButton label={labels.clearSearch} size="xs" className="ps-combobox-clear" onClick={() => onChange('')} tooltip={false}>
              <IconClose size={14} />
            </IconButton>
          )}
          {endAdornment && <span className="ps-combobox-end">{endAdornment}</span>}
        </div>
        <Popover
          open={listShown}
          anchorRef={boxRef}
          onClose={() => setOpen(false)}
          className="ps-combobox-popover"
          offset={4}
        >
          <div id={listId} role="listbox" aria-label={labels.suggestions} className="ps-combobox-list">
            {groups.map((group, g) => (
              <div key={`${group.name ?? ''}-${g}`} role="group" aria-label={group.name}>
                {group.name && (
                  <div className="ps-combobox-group" aria-hidden="true">
                    {group.name}
                  </div>
                )}
                {group.items.map(({ option, index }) => (
                  <div
                    key={option.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    className={cx('ps-combobox-option', index === active && 'is-active')}
                    // Keeps focus in the field, so picking doesn't blur it first.
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => pick(option)}
                  >
                    {option.icon && <span className="ps-combobox-option-icon">{option.icon}</span>}
                    <span className="ps-combobox-option-text">
                      <span className="ps-combobox-option-label">{option.label}</span>
                      {option.detail && <span className="ps-combobox-option-detail">{option.detail}</span>}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            {loading && !!value && !options.length && <div className="ps-combobox-status">{labels.loading}…</div>}
          </div>
        </Popover>
        {/* Screen readers hear when the empty field offers recent places. */}
        <span className="ps-visually-hidden" aria-live="polite">
          {listShown && showingRecent ? recent?.label : ''}
        </span>
      </>
    );
  }
);
Combobox.displayName = 'Combobox';
