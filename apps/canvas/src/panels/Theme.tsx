// The theme editor: proposed changes to the design system's colors, shown on every frame at once.
// Pick an accent preset, or change any theme color for dark or light. Nothing here touches the
// design system itself: the changes live in project.json, where Claude reads them as proposals.
import { useMemo } from 'react';
import { ACCENT_PRESETS, accentTokens, type AccentId } from '@pastel-studio/react';
import * as PS from '@pastel-studio/react';
import { COLOR_GROUPS, shortName } from '../data/tokens';
import { editProject, useEditor } from '../model/store';
import type { ThemeOverrides } from '../model/types';
import { Buttons, Row } from './controls';
import { usePref } from './prefs';

type ThemeName = 'dark' | 'light';
const NO_THEME: ThemeOverrides = {};

/** The CSS for a project's theme changes, scoped to the frames (and the preview), never the editor. */
export function themeCss(theme: ThemeOverrides | undefined): string {
  if (!theme) return '';
  return (['dark', 'light'] as const).map((name) => {
    const values = { ...(theme.accent ? accentTokens(theme.accent as AccentId, name) : {}), ...(theme[name] ?? {}) };
    const body = Object.entries(values).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return body ? `:is(.cv-world, .cv-preview) [data-theme='${name}'] {\n${body}\n}` : '';
  }).filter(Boolean).join('\n');
}

/** Applies the project's theme changes to the frames. */
export function ThemeStyle() {
  const theme = useEditor((s) => s.project?.theme);
  const css = useMemo(() => themeCss(theme), [theme]);
  return css ? <style>{css}</style> : null;
}

/** The proposal as CSS for the design system's theme files: what changed, per theme. */
function proposalCss(theme: ThemeOverrides): string {
  const lines: string[] = [];
  if (theme.accent) lines.push(`/* Accent preset: ${theme.accent} */`);
  for (const name of ['dark', 'light'] as const) {
    const values = theme[name];
    if (!values || !Object.keys(values).length) continue;
    lines.push(`/* themes/${name}.css */`, `[data-theme='${name}'] {`, ...Object.entries(values).map(([k, v]) => `  ${k}: ${v};`), '}');
  }
  return lines.join('\n');
}

export function ThemePanel() {
  const theme = useEditor((s) => s.project?.theme ?? NO_THEME);
  const [which, setWhich] = usePref<ThemeName>('theme-editor', 'dark');
  const accent = theme.accent ? accentTokens(theme.accent as AccentId, which) : {};
  const changed = Object.keys(theme.dark ?? {}).length + Object.keys(theme.light ?? {}).length + (theme.accent ? 1 : 0);

  const setToken = (name: string, value: string | undefined) => editProject((p) => {
    const t = (p.theme ??= {});
    const map = (t[which] ??= {});
    if (value) map[name] = value;
    else delete map[name];
    if (!Object.keys(map).length) delete t[which];
  });
  const setAccent = (id: string) => editProject((p) => {
    const t = (p.theme ??= {});
    if (id) t.accent = id;
    else delete t.accent;
  });

  return (
    <div className="cv-inspector cv-scroll">
      <div className="cv-insp-head"><span className="cv-name">Theme</span></div>
      <section className="cv-insp-section">
        <p className="cv-muted">Proposed changes to the design system, shown on every frame. They're saved with the project for Claude to turn into token changes.</p>
        <Row label="Editing"><Buttons label="Theme" value={which} onChange={setWhich} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} /></Row>
        <Row label="Accent">
          <select className="ps-input cv-input" aria-label="Accent preset" value={theme.accent ?? ''} onChange={(e) => setAccent(e.target.value)}>
            <option value="">Default (solar lime)</option>
            {ACCENT_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.id.replace(/-/g, ' ')}</option>)}
          </select>
        </Row>
        <div className="cv-row">
          <PS.Button size="sm" disabled={!changed} onClick={() => void navigator.clipboard?.writeText(proposalCss(theme))}>Copy as CSS</PS.Button>
          <PS.Button size="sm" disabled={!changed} onClick={() => editProject((p) => { delete p.theme; })}>Reset all</PS.Button>
          <span className="cv-hint">{changed ? `${changed} change${changed === 1 ? '' : 's'}` : 'No changes'}</span>
        </div>
      </section>
      {COLOR_GROUPS.map((g) => (
        <section key={g.title} className="cv-insp-section">
          <div className="cv-panel-head"><span className="ps-overline">{g.title}</span></div>
          {g.tokens.map((t) => {
            const own = theme[which]?.[t.name];
            const value = own ?? accent[t.name] ?? (which === 'light' ? t.light : t.dark);
            const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#888888';
            return (
              <div key={t.name} className="cv-theme-token" data-changed={own ? true : undefined}>
                <input type="color" aria-label={`${t.name}, ${which}`} value={hex} onChange={(e) => setToken(t.name, e.target.value)} />
                <span className="cv-theme-name" title={t.comment ?? t.name}>{shortName(t.name)}</span>
                <input className="ps-input cv-input cv-theme-value" aria-label={`${t.name} value`} defaultValue={value} key={`${which}-${value}`} onChange={(e) => { const v = e.target.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) setToken(t.name, v); }} />
                {own && <button type="button" className="cv-layer-toggle is-on" aria-label={`Reset ${t.name}`} title="Back to the design system's value" onClick={() => setToken(t.name, undefined)}>↺</button>}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
