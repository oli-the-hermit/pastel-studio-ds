import React from 'react';
import { Callout, Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';
import { TokenTable } from '../../blocks/TokenTable';
import { sentence, tokens } from '../../tokens';
import { useExampleThemes } from '../../theme';
import type { ContrastPair, RoleToken, ThemeName } from '../../tokens/types';

/** "var(--ps-lime-85)" → "--ps-lime-85"; raw values pass through. */
const refName = (value: string) => value.replace(/^var\((--ps-[a-z0-9-]+)\)$/, '$1');

/** What each role group is for. The roles themselves (and their notes) come from themes/dark.css. */
const GROUP_INTRO: Record<string, string> = {
  Surfaces: 'Backgrounds, from the page itself up to the most raised surface. In dark, each step is lighter than the one below. In light, cards are white on a soft background, and surfaces 2 to 4 shade down from white for fields and hovers.',
  Text: 'Three levels of text, all readable on every surface. Most text is text-1; text-2 for supporting text; text-3, the quietest, for hints and meta.',
  Accent: 'The solar lime and the colors that sit on it. "On" colors are for text and icons placed on the matching fill.',
  Status: 'Danger, warning, success and live, each with a container for calmer, tinted backgrounds.',
  Structure: 'Grid lines, the focus ring and the scrim behind dialogs.',
};

const SURFACES = ['--ps-bg', '--ps-surface-1', '--ps-surface-2', '--ps-surface-3', '--ps-surface-4'];

function SurfaceLadder() {
  const step = (i: number): React.ReactNode => i >= SURFACES.length ? null : (
    <div className="docs-ladder-step" style={{ background: `var(${SURFACES[i]})` }}>
      <Code>{SURFACES[i]}</Code>
      {step(i + 1)}
    </div>
  );
  return <div className="docs-ladder">{step(0)}</div>;
}

function RoleList({ roles, theme }: { roles: RoleToken[]; theme: ThemeName }) {
  return (
    <ul className="docs-roles">
      {roles.map((r) => (
        <li key={r.name} className="docs-role">
          <span className="docs-swatch" style={{ background: `var(${r.name})` }} />
          <span className="docs-role-text">
            <Code>{r.name}</Code>
            <span className="docs-role-meta">{refName(theme === 'dark' ? r.value : r.lightValue)} · {r[theme]}</span>
            {r.comment && <span className="docs-role-use">{sentence(r.comment)}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The lowest ratio of a pair in one theme, and the background it happens on. */
function worst(pair: ContrastPair, theme: ThemeName) {
  return pair.results.filter((r) => r.theme === theme).reduce((a, b) => (b.ratio < a.ratio ? b : a));
}

function ContrastCell({ pair, theme }: { pair: ContrastPair; theme: ThemeName }) {
  const w = worst(pair, theme);
  return (
    <span className="docs-contrast-cell">
      <span data-theme={theme} className="docs-contrast-sample" style={{ background: `var(${w.bg})`, color: `var(${pair.fg})` }}>Aa</span>
      <span className="docs-contrast-ratio">{w.ratio.toFixed(2)}:1</span>
      <span className={`docs-badge ${w.pass ? 'is-pass' : 'is-below'}`}>{w.pass ? 'Pass' : 'Below'}</span>
    </span>
  );
}

function ContrastTable() {
  const themes = useExampleThemes();
  const { pairs, rules, surfaces } = tokens.contrast;
  const onLabel = (on: string[]) => on.join(',') === surfaces.join(',')
    ? 'bg and surfaces 1–3'
    : <span className="docs-chips">{on.map((bg) => <Code key={bg}>{bg.replace('--ps-', '')}</Code>)}</span>;
  return (
    <div className="docs-table-wrap">
      <table className="docs-table docs-contrast">
        <thead>
          <tr>
            <th scope="col">Use</th>
            <th scope="col">Color</th>
            <th scope="col">On</th>
            <th scope="col">Needs</th>
            {themes.map((t) => <th key={t} scope="col">{t === 'dark' ? 'Dark' : 'Light'}</th>)}
          </tr>
        </thead>
        {/* One tbody per pairing, so an exception note can sit in its own row under it. */}
        {pairs.map((p) => (
          <tbody key={`${p.fg}|${p.on.join()}`}>
            <tr className={p.exception ? 'has-note' : undefined}>
              <th scope="row">{p.use}</th>
              <td><Code>{p.fg}</Code></td>
              <td className="docs-contrast-on">{onLabel(p.on)}</td>
              <td className="is-numeric">{p.min}:1 {rules[p.rule].label.toLowerCase()}</td>
              {themes.map((t) => <td key={t}><ContrastCell pair={p} theme={t} /></td>)}
            </tr>
            {p.exception && (
              <tr className="docs-note-row">
                <td colSpan={4 + themes.length}><span className="docs-exception">Known exception: {p.exception}</span></td>
              </tr>
            )}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function Palette() {
  return (
    <div className="docs-palette">
      {tokens.paletteGroups.map((group) => {
        const family = group.title.split(':')[0];
        const colors = tokens.palette.filter((c) => c.family === family);
        return (
          <div key={family} className="docs-palette-family">
            <p className="docs-palette-title">{group.title}</p>
            <ul className="docs-palette-strip">
              {colors.map((c) => (
                <li key={c.name} className="docs-palette-chip">
                  <span className="docs-palette-color" style={{ background: `var(${c.name})` }} />
                  <span className="docs-palette-tone">{c.name.replace('--ps-', '')}</span>
                  <span className="docs-palette-hex">{c.hex}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function Color() {
  const colorGroups = tokens.roles.filter((g) => GROUP_INTRO[g.title]);
  const exceptions = tokens.contrast.pairs.filter((p) => p.exception);
  return (
    <Page
      overline="Foundations"
      title="Color"
      lead="Pastel Studio has one palette and two themes. Components never use palette colors directly: they use roles, and each theme decides which color fills each role."
    >
      <Section title="How color is organized">
        <ol className="docs-tiers">
          <li className="docs-tier">
            <span className="ps-overline">1 · Reference</span>
            <Code>--ps-lime-85</Code>
            <span>The raw palette. The number is the color's lightness, 0 to 100.</span>
          </li>
          <li className="docs-tier">
            <span className="ps-overline">2 · Role</span>
            <Code>--ps-accent</Code>
            <span>What the color is for. Themes set these, and only these.</span>
          </li>
          <li className="docs-tier">
            <span className="ps-overline">3 · Component</span>
            <Code>--ps-button-bg</Code>
            <span>Optional, per component, for theming one part without the rest.</span>
          </li>
        </ol>
      </Section>

      <Section title="Surfaces" description="Depth comes from tone, not from lines or shadows. Each surface is one step up from the one it sits on.">
        <Example><SurfaceLadder /></Example>
      </Section>

      {colorGroups.map((group) => (
        <Section key={group.title} title={group.title === 'Surfaces' ? 'Surface roles' : group.title} description={GROUP_INTRO[group.title]}>
          <Example>{(theme) => <RoleList roles={group.tokens} theme={theme} />}</Example>
        </Section>
      ))}

      <Section
        title="Derived roles"
        description={tokens.aliases[0]?.description ?? 'Roles built from other roles.'}
      >
        <TokenTable tokens={tokens.aliases.flatMap((g) => g.tokens)} columns={[{ header: 'Defaults to', render: (t) => <Code>{refName(t.value)}</Code> }]} />
      </Section>

      <Section
        title="Contrast"
        description={<>Every intended pairing, measured in each theme against WCAG 2.2 AA: <strong>4.5:1</strong> for text, <strong>3:1</strong> for focus rings and markers. Each cell shows the lowest ratio across the backgrounds listed. The ratios are computed from the token files whenever the docs are built.</>}
      >
        {exceptions.length > 0 && (
          <Callout tone="warning" title={`${exceptions.length} pairings are below AA`}>
            Each is recorded in <Code>contrast.json</Code> as a known exception with its reason, and is listed below.
          </Callout>
        )}
        <ContrastTable />
      </Section>

      <Section title="Reference palette" description={<>The raw colors themes are built from. Each name ends in the color's tone, its lightness from 0 (black) to 100 (white): two colors far apart in tone contrast well. For themes only: components use the roles above.</>}>
        <Palette />
      </Section>
    </Page>
  );
}
