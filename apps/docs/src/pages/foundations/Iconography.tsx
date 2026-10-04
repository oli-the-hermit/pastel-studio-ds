import React, { useId, useState } from 'react';
import * as PS from '@pastel-studio/react';
import type { IconProps } from '@pastel-studio/react';
import { Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';

const ICONS = Object.entries(PS)
  .filter(([name]) => /^Icon[A-Z]/.test(name))
  .map(([name, Icon]) => ({ name, Icon: Icon as React.FC<IconProps> }))
  .sort((a, b) => a.name.localeCompare(b.name));

const SIZES = [14, 18, 24, 32];
const COLORS = ['--ps-text-1', '--ps-text-2', '--ps-accent-text', '--ps-danger', '--ps-success'];

export function Iconography() {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const q = query.trim().toLowerCase();
  const shown = ICONS.filter((i) => i.name.slice(4).toLowerCase().includes(q));
  const { IconTimer } = PS;

  return (
    <Page
      overline="Foundations"
      title="Iconography"
      lead={`${ICONS.length} icons drawn on one 24 × 24 grid with 2px round strokes, in the current text color. Solid shapes are kept for media controls, where they read better small.`}
    >
      <Section title="The set">
        <div className="docs-filter">
          <label htmlFor={inputId} className="docs-filter-label">Filter icons</label>
          <input
            id={inputId}
            className="docs-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="calendar, check, play…"
            autoComplete="off"
          />
          <span className="docs-filter-count" aria-live="polite">{shown.length} of {ICONS.length}</span>
        </div>
        <Example>
          {shown.length ? (
            <ul className="docs-icons">
              {shown.map(({ name, Icon }) => (
                <li key={name} className="docs-icon-tile">
                  <Icon size={24} />
                  <span className="docs-icon-name">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="docs-empty">No icon matches “{query}”. Try a shorter word.</p>
          )}
        </Example>
      </Section>

      <Section title="Size" description={<>The default is 18px, set with the <Code>size</Code> prop. Keep to these steps: 14 inside chips and dense rows, 18 in buttons and menus, 24 for standalone icons, 32 for empty states.</>}>
        <Example>
          <ul className="docs-icon-sizes">
            {SIZES.map((s) => (
              <li key={s}><IconTimer size={s} /><span>{s}px</span></li>
            ))}
          </ul>
        </Example>
      </Section>

      <Section title="Color" description={<>Icons are drawn in <Code>currentColor</Code>, so they take the color of the text around them. Set the color on the parent with a role, never on the icon.</>}>
        <Example>
          <ul className="docs-icon-sizes">
            {COLORS.map((c) => (
              <li key={c} style={{ color: `var(${c})` }}><IconTimer size={24} /><Code>{c.replace('--ps-', '')}</Code></li>
            ))}
          </ul>
        </Example>
      </Section>

      <Section title="Accessibility">
        <ul className="docs-list">
          <li>Icons are decorative by default: they render with <Code>aria-hidden</Code>, and the text next to them does the talking.</li>
          <li>An icon-only button needs a name: put <Code>aria-label</Code> on the button, not on the icon.</li>
          <li>Never let an icon be the only sign of a state. Pair it with text or a change a screen reader can announce.</li>
        </ul>
      </Section>
    </Page>
  );
}
