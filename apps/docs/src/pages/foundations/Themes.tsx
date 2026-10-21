import React, { useState } from 'react';
import {
  ACCENT_GROUPS, ACCENT_PRESETS, ACCENT_TOKENS, BASE_ACCENT, accentTokens, Button, Chip, ProgressBar, Switch, TextButton,
  type AccentId, type ResolvedTheme,
} from '@pastel-studio/react';
import { Callout, Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';

const nameOf = (id: string) => {
  const words = id.replace(/-/g, ' ');
  return words[0].toUpperCase() + words.slice(1);
};
const GROUP_TITLE = { vibrant: 'Vibrant', calm: 'Calm', muted: 'Muted' } as const;
const styleOf = (tokens: Record<string, string>) => tokens as React.CSSProperties;

/** The accent's tokens set inline on a wrapper, the way applyTheme sets them on the page. */
function Sample({ accent, theme }: { accent: AccentId; theme: ResolvedTheme }) {
  const [on, setOn] = useState(true);
  return (
    <div className="docs-theme-sample" style={styleOf(accentTokens(accent, theme))}>
      <div className="docs-demo-row">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <TextButton>Text button</TextButton>
        <Chip tone="accent">Accent chip</Chip>
      </div>
      <ProgressBar value={60} label="Progress" />
      <Switch label="A setting" checked={on} onChange={setOn} />
      <p className="docs-theme-sample-text">The accent as text: <span className="docs-theme-accent-text">a highlighted word</span>. Tab to a button for the focus ring.</p>
    </div>
  );
}

function Picker({ accent, onChange, theme }: { accent: AccentId; onChange: (id: AccentId) => void; theme: ResolvedTheme }) {
  return (
    <div className="docs-accent-groups">
      {ACCENT_GROUPS.map((group) => (
        <div key={group} className="docs-accent-group" role="group" aria-label={GROUP_TITLE[group]}>
          <span className="docs-accent-group-title" aria-hidden="true">{GROUP_TITLE[group]}</span>
          <div className="docs-accent-swatches">
            {ACCENT_PRESETS.filter((p) => p.group === group).map((p) => (
              <button
                key={p.id}
                type="button"
                className="docs-accent-swatch"
                aria-label={nameOf(p.id)}
                aria-pressed={accent === p.id}
                title={nameOf(p.id)}
                style={{ background: accentTokens(p.id, theme)['--ps-accent'] }}
                onClick={() => onChange(p.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Chooser({ theme }: { theme: ResolvedTheme }) {
  const [accent, setAccent] = useState<AccentId>(BASE_ACCENT);
  return (
    <div className="docs-accent-demo">
      <Picker accent={accent} onChange={setAccent} theme={theme} />
      <p className="docs-accent-current" role="status">{nameOf(accent)}</p>
      <Sample accent={accent} theme={theme} />
    </div>
  );
}

function Roles({ id, theme }: { id: AccentId; theme: ResolvedTheme }) {
  const tokens = accentTokens(id, theme);
  return (
    <span className="docs-accent-roles">
      {ACCENT_TOKENS.map((name) => (
        <span key={name} className="docs-accent-role" style={{ background: tokens[name] }} title={`${name} ${tokens[name]}`} />
      ))}
    </span>
  );
}

export function Themes() {
  return (
    <Page
      overline="Foundations"
      title="Themes and accents"
      lead="A theme is light or dark; an accent is one of 32 presets. The theme module applies both, remembers them on the device so every window paints right on its first frame, and lets each app choose its own default accent."
    >
      <Section
        id="choose"
        title="Choosing"
        description={<>Pick an accent: every role below is the preset's, in the theme the example is shown in. <Code>applyTheme</Code> sets the same tokens on the whole page.</>}
      >
        <Example>{(theme) => <Chooser theme={theme} />}</Example>
      </Section>

      <Section
        id="applying"
        title="Applying and remembering"
        description={
          <>
            <Code>applyTheme(mode, accent)</Code> resolves <Code>system</Code> against the OS, sets <Code>data-theme</Code> and <Code>color-scheme</Code> on the
            root, and sets the accent's eight tokens inline over the stylesheet's. It takes a document, so a second window gets the same call.
            {' '}<Code>createThemeStore{'({ prefix, defaultAccent })'}</Code> keeps the last mode, the last accent and the recent accents on the device,
            under the app's own prefix (<Code>focusspace_theme_cache</Code>), and never throws when storage is blocked.
            {' '}<Code>useThemeSync(mode, accent, store)</Code> paints the remembered look first, then the saved one, and follows the OS live in <Code>system</Code> mode.
          </>
        }
      >
        <Callout title="The default accent is the app's">
          The store takes a <Code>defaultAccent</Code> and never picks one itself, so a new default in the library never repaints an app that did not ask.
          <Code>{BASE_ACCENT}</Code> is the preset whose tokens are the themes' own; an unknown id falls back to it.
        </Callout>
      </Section>

      <Section
        id="presets"
        title="The 32 presets"
        description={<>Each preset lists its eight roles, in order: fill, hover, text on the fill, secondary text on the fill, container, text on the container, accent as text, focus ring. Hover a square for its token and value.</>}
      >
        {ACCENT_GROUPS.map((group) => (
          <div key={group} className="docs-accent-table-group">
            <h3 className="docs-accent-group-heading">{GROUP_TITLE[group]}</h3>
            <table className="docs-tokens docs-accent-table">
              <thead><tr><th>Preset</th><th>Dark</th><th>Light</th></tr></thead>
              <tbody>
                {ACCENT_PRESETS.filter((p) => p.group === group).map((p) => (
                  <tr key={p.id}>
                    <td><Code>{p.id}</Code></td>
                    <td><Roles id={p.id} theme="dark" /></td>
                    <td><Roles id={p.id} theme="light" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Section>

      <Section
        id="generating"
        title="How a preset is made"
        description={
          <>
            A preset is a target in OKLCH (lightness, chroma, hue). <Code>npm run accents</Code> fits it into sRGB and derives the eight roles for each theme,
            moving only lightness until every pairing passes WCAG 2.2 AA: text 4.5:1 on its fill, container and the four surfaces, the focus ring 3:1.
            It writes <Code>palette.json</Code>; a test fails when that file is out of date, and the run fails when a preset cannot pass.
            An app with a partner family of colors that must never look like its accent (Focus Space's break colors) asks the generator for it; the library's own palette has none.
          </>
        }
      />
    </Page>
  );
}
