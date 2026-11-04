// The inspector's small controls. Values are token-first: a picker lists the tokens, and a raw value is
// still allowed but marked "off-system", the sign of a proposed change to the design system.
import React, { useEffect, useState } from 'react';
import { Select, cx, type SelectOption } from '@pastel-studio/react';
import { COLOR_GROUPS, shortName } from '../data/tokens';
import { isToken, type Value } from '../model/types';

export function Row({ label, children, off, hint }: { label: string; children: React.ReactNode; off?: boolean; hint?: string }) {
  return (
    <div className="cv-prop" title={hint}>
      <span className="cv-prop-label">
        {label}
        {off && <span className="cv-off" title="Off-system: a raw value, not a token">off-system</span>}
      </span>
      <div className="cv-prop-control">{children}</div>
    </div>
  );
}

/** A number field that commits as you type, and on Enter or blur when the text isn't a number yet. */
export function NumberInput({ value, onChange, min, max, step = 1, label, suffix }: { value: number | undefined; onChange: (v: number) => void; min?: number; max?: number; step?: number; label: string; suffix?: string }) {
  const [text, setText] = useState(value === undefined ? '' : String(value));
  useEffect(() => setText(value === undefined ? '' : String(value)), [value]);
  const commit = (t: string) => {
    const n = Number(t);
    if (t.trim() === '' || Number.isNaN(n)) return;
    onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)));
  };
  return (
    <label className="cv-number">
      <span className="cv-number-label">{label}</span>
      <input
        className="ps-input cv-input"
        inputMode="decimal"
        value={text}
        onChange={(e) => { setText(e.target.value); commit(e.target.value); }}
        onBlur={() => setText(value === undefined ? '' : String(value))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const d = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? step * 10 : step);
            commit(String((value ?? 0) + d));
          }
        }}
      />
      {suffix && <span className="cv-number-suffix">{suffix}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, label, multiline, placeholder }: { value: string; onChange: (v: string) => void; label: string; multiline?: boolean; placeholder?: string }) {
  return multiline ? (
    <textarea className="ps-input cv-input cv-textarea" aria-label={label} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={3} />
  ) : (
    <input className="ps-input cv-input" aria-label={label} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}

export function Choice<T extends string>({ value, options, onChange, label }: { value: T | undefined; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <select className="ps-input cv-input" aria-label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value as T)}>
      {value === undefined && <option value="">—</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** A row of small toggle buttons for a few choices. */
export function Buttons<T extends string>({ value, options, onChange, label }: { value: T | undefined; options: { value: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="cv-buttons" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className={cx('cv-buttons-option', value === o.value && 'is-active')} aria-pressed={value === o.value} title={o.title} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const NONE = '__none';
const RAW = '__raw';

/** A token from a scale (space, radius, type), or a raw value. */
export function TokenField({ value, tokens, onChange, label, allowNone = true, rawPlaceholder = '12px' }: {
  value: Value | undefined;
  tokens: { name: string; value: string }[];
  onChange: (v: Value | undefined) => void;
  label: string;
  allowNone?: boolean;
  rawPlaceholder?: string;
}) {
  const raw = value !== undefined && !isToken(value);
  const [custom, setCustom] = useState(raw);
  useEffect(() => setCustom(raw), [raw]);
  const selectValue = custom ? RAW : value ?? NONE;
  return (
    <div className="cv-token-field">
      <select
        className="ps-input cv-input"
        aria-label={label}
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === RAW) { setCustom(true); return; }
          setCustom(false);
          onChange(v === NONE ? undefined : v);
        }}
      >
        {allowNone && <option value={NONE}>None</option>}
        {tokens.map((t) => <option key={t.name} value={t.name}>{shortName(t.name)} · {t.value.replace(/\s*\/\*.*$/, '')}</option>)}
        <option value={RAW}>Custom value…</option>
      </select>
      {custom && <input className="ps-input cv-input cv-raw" aria-label={`${label}, custom value`} placeholder={rawPlaceholder} defaultValue={raw ? value : ''} onChange={(e) => onChange(e.target.value.trim() || undefined)} />}
    </div>
  );
}

/** A theme color, picked from swatches, or a raw color. */
export function ColorField({ value, onChange, label, theme }: { value: Value | undefined; onChange: (v: Value | undefined) => void; label: string; theme: 'dark' | 'light' }) {
  const raw = value !== undefined && !isToken(value);
  const [custom, setCustom] = useState(raw);
  useEffect(() => setCustom(raw), [raw]);
  const swatch = (color: string) => <span className="cv-mini-swatch" style={{ background: color }} />;
  const options: SelectOption<string>[] = [
    { value: NONE, label: 'None' },
    ...COLOR_GROUPS.flatMap((g) => g.tokens.map((t) => ({ value: t.name, label: shortName(t.name), meta: g.title, icon: swatch(theme === 'light' ? t.light : t.dark), searchText: `${t.name} ${g.title}` }))),
    { value: RAW, label: 'Custom color…' },
  ];
  return (
    <div className="cv-token-field">
      <Select<string>
        className="cv-color-select"
        ariaLabel={label}
        searchable
        value={custom ? RAW : value ?? NONE}
        options={options}
        onChange={(v) => {
          if (v === RAW) { setCustom(true); return; }
          setCustom(false);
          onChange(v === NONE ? undefined : v);
        }}
      />
      {custom && (
        <div className="cv-raw-color">
          <input type="color" aria-label={`${label}, color`} value={/^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#888888'} onChange={(e) => onChange(e.target.value)} />
          <input className="ps-input cv-input" aria-label={`${label}, custom value`} placeholder="#rrggbb" defaultValue={raw ? value : ''} key={raw ? 'raw' : 'empty'} onChange={(e) => onChange(e.target.value.trim() || undefined)} />
        </div>
      )}
    </div>
  );
}

/** A JSON value (lists, objects) for props with no simpler control. Commits only valid JSON. */
export function JsonField({ value, onChange, label }: { value: unknown; onChange: (v: unknown) => void; label: string }) {
  const text = value === undefined ? '' : JSON.stringify(value, null, 2);
  const [draft, setDraft] = useState(text);
  const [error, setError] = useState<string>();
  useEffect(() => { setDraft(text); setError(undefined); }, [text]);
  return (
    <>
      <textarea
        className={cx('ps-input cv-input cv-textarea cv-json', error && 'is-invalid')}
        aria-label={label}
        aria-invalid={!!error}
        value={draft}
        rows={Math.min(10, Math.max(3, draft.split('\n').length))}
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim() === '') { onChange(undefined); return; }
          try { onChange(JSON.parse(draft)); setError(undefined); } catch (e) { setError(e instanceof Error ? e.message : 'Not valid JSON'); }
        }}
      />
      {error && <span className="cv-error">{error}</span>}
    </>
  );
}
