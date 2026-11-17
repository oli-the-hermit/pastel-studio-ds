import React from 'react';
import { Link } from 'react-router';
import { ACCENT_GROUPS, ACCENT_PRESETS, accentTokens, type AccentId } from '@pastel-studio/react';
import { Code, Page, Section } from '../../blocks/Page';
import { CopyButton, CopyProvider } from '../../blocks/Copy';
import { colorCodes, inkOn } from '../../blocks/colorFormats';
import { tokens } from '../../tokens';
import { useDocsTheme } from '../../theme';
import type { PaletteColor, ThemeName } from '../../tokens/types';
import '../../styles/swatch-book.css';

// The palette as a swatch book: one chip per color, the way a printed color guide shows it,
// with every code a click away. The colors and their uses are read from the token files.

const INK_DARK = '#1A1C17';
const ink = (hex: string) => (inkOn(hex, INK_DARK) === INK_DARK ? 'var(--ps-stone-10)' : 'var(--ps-white)');

/** "--ps-lime-85" → "Lime 85", "--ps-white" → "White". */
const chipName = (name: string) => {
  const words = name.replace('--ps-', '').split('-');
  return words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
};

/** Two letters per family, for the chip code: PS 085 LM. */
const FAMILY_CODE: Record<string, string> = { Graphite: 'GR', Stone: 'ST', Lime: 'LM', Coral: 'CR', Amber: 'AM', Green: 'GN' };
const familyCode = (family: string) => FAMILY_CODE[family] ?? family.slice(0, 2).toUpperCase();
const chipCode = (c: PaletteColor) => `PS ${String(c.tone).padStart(3, '0')} ${familyCode(c.family)}`;

const allRoles = tokens.roles.flatMap((g) => g.tokens);
/** The roles a reference color fills in a theme: "accent", "focus-ring"… */
function usesOf(name: string, theme: ThemeName): string[] {
  const ref = `var(${name})`;
  return allRoles.filter((r) => (theme === 'dark' ? r.value : r.lightValue) === ref).map((r) => r.name.replace('--ps-', ''));
}

const accentName = (id: string) => {
  const words = id.replace(/-/g, ' ');
  return words[0].toUpperCase() + words.slice(1);
};

function Mark() {
  return <span className="docs-chip-brand"><span className="docs-chip-mark" aria-hidden="true" />Pastel Studio</span>;
}

function Codes({ hex, name, cssName, keyBase }: { hex: string; name: string; cssName?: string; keyBase: string }) {
  return (
    <dl className="docs-chip-codes">
      {colorCodes(hex).map((code) => (
        <div key={code.label} className="docs-chip-code-row">
          <dt>{code.label}</dt>
          <dd><CopyButton value={code.value} copyKey={`${keyBase}:${code.label}`} what={`the ${code.label} of ${name}`} /></dd>
        </div>
      ))}
      {cssName && (
        <div className="docs-chip-code-row is-token">
          <dt>CSS</dt>
          <dd><CopyButton value={`var(${cssName})`} copyKey={`${keyBase}:css`} what={`the token of ${name}`}>{cssName}</CopyButton></dd>
        </div>
      )}
    </dl>
  );
}

function Uses({ name }: { name: string }) {
  const dark = usesOf(name, 'dark');
  const light = usesOf(name, 'light');
  if (dark.length + light.length === 0) {
    return <p className="docs-chip-uses is-empty">No role yet: kept for themes to come.</p>;
  }
  return (
    <div className="docs-chip-uses">
      {([['Dark', dark], ['Light', light]] as const).map(([label, list]) => list.length > 0 && (
        <p key={label} className="docs-chip-use-line">
          <span className="docs-chip-use-theme">{label}</span>
          <span className="docs-chip-use-roles">{list.join(', ')}</span>
        </p>
      ))}
    </div>
  );
}

function PaletteChip({ color }: { color: PaletteColor }) {
  const name = chipName(color.name);
  return (
    <li className="docs-chip">
      <CopyButton
        className="docs-chip-field"
        style={{ background: color.hex, color: ink(color.hex) }}
        value={color.hex.toUpperCase()}
        copyKey={`${color.name}:field`}
        what={`the hex of ${name}`}
      >
        <span className="docs-chip-tone" aria-hidden="true">{color.tone}</span>
        <span className="docs-chip-hint" aria-hidden="true">Copy hex</span>
      </CopyButton>
      <div className="docs-chip-band">
        <Mark />
        <h4 className="docs-chip-name">{name}</h4>
        <p className="docs-chip-number">{chipCode(color)}</p>
      </div>
      <Codes hex={color.hex} name={name} cssName={color.name} keyBase={color.name} />
      <Uses name={color.name} />
    </li>
  );
}

/** Each family's colors in one band, lightest last: the family at a glance. */
function FamilyStrip({ colors }: { colors: PaletteColor[] }) {
  return (
    <div className="docs-family-strip" aria-hidden="true">
      {colors.map((c) => <span key={c.name} style={{ background: c.hex }} />)}
    </div>
  );
}

/** Every color placed on one lightness scale, 0 to 100: same tone, same lightness, whatever the hue. */
function ToneScale() {
  const families = tokens.paletteGroups.map((g) => g.title.split(':')[0]);
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <figure className="docs-tone-scale">
      <div className="docs-tone-rows">
        {families.map((family) => (
          <div key={family} className="docs-tone-row">
            <span className="docs-tone-family">{family}</span>
            <span className="docs-tone-track">
              {tokens.palette.filter((c) => c.family === family).map((c) => (
                <span
                  key={c.name}
                  className="docs-tone-dot"
                  style={{ left: `${c.tone}%`, background: c.hex }}
                  title={`${chipName(c.name)} · ${c.hex}`}
                />
              ))}
            </span>
          </div>
        ))}
        <div className="docs-tone-row is-axis" aria-hidden="true">
          <span className="docs-tone-family" />
          <span className="docs-tone-track">
            {ticks.map((t) => <span key={t} className="docs-tone-tick" style={{ left: `${t}%` }}>{t}</span>)}
          </span>
        </div>
      </div>
      <figcaption className="docs-tone-caption">
        Every reference color on the CIELAB L* scale. Read across a column: colors at the same tone are equally light, whatever their family.
      </figcaption>
    </figure>
  );
}

const ACCENT_PARTS = [
  ['--ps-accent-hover', 'hover'],
  ['--ps-accent-container', 'container'],
  ['--ps-on-accent-container', 'on container'],
  ['--ps-on-accent', 'on accent'],
] as const;

function AccentChip({ id, index, theme }: { id: AccentId; index: number; theme: ThemeName }) {
  const values = accentTokens(id, theme);
  const hex = values['--ps-accent'];
  const name = accentName(id);
  const key = `accent:${id}:${theme}`;
  return (
    <li className="docs-chip is-accent">
      <CopyButton
        className="docs-chip-field"
        style={{ background: hex, color: values['--ps-on-accent'] }}
        value={hex.toUpperCase()}
        copyKey={`${key}:field`}
        what={`the hex of ${name}`}
      >
        <span className="docs-chip-tone is-word" aria-hidden="true">Aa</span>
        <span className="docs-chip-hint" aria-hidden="true">Copy hex</span>
      </CopyButton>
      <div className="docs-chip-parts">
        {ACCENT_PARTS.map(([token, label]) => (
          <CopyButton
            key={token}
            className="docs-chip-part"
            style={{ background: values[token] }}
            value={values[token].toUpperCase()}
            copyKey={`${key}:${token}`}
            what={`${name}'s ${label} color`}
            title={`${label} · ${values[token]}`}
          >
            <span className="docs-visually-hidden">{label}</span>
          </CopyButton>
        ))}
      </div>
      <div className="docs-chip-band">
        <Mark />
        <h4 className="docs-chip-name">{name}</h4>
        <p className="docs-chip-number">PS A{String(index + 1).padStart(2, '0')} · {theme === 'dark' ? 'Dark' : 'Light'}</p>
      </div>
      <Codes hex={hex} name={name} keyBase={key} />
      <CopyButton className="docs-chip-id" value={id} copyKey={`${key}:id`} what={`the preset id of ${name}`}>
        <span className="docs-chip-id-label">Preset</span>{id}
      </CopyButton>
    </li>
  );
}

const ACCENT_GROUP_INTRO = {
  vibrant: 'As saturated as each hue allows. For apps that want their accent to lead.',
  calm: 'Pastel and low in chroma: present, never loud.',
  muted: 'Nearly grey. The accent steps back and the content leads.',
} as const;

export function SwatchBook() {
  const { theme } = useDocsTheme();
  return (
    <CopyProvider>
      <Page
        overline="Foundations"
        title="Swatch book"
        lead={<>Every color in Pastel Studio, one chip each, the way a printed color guide shows them. Click any code to copy it: the chip's color copies its hex. For how the colors become themes, see <Link to="/foundations/color">Color</Link>.</>}
      >
        <section className="docs-swatch-intro" aria-label="About the palette">
          <div className="docs-swatch-intro-text">
            <p className="ps-overline">The palette</p>
            <p className="docs-swatch-intro-lead">{tokens.palette.length} reference colors in {tokens.paletteGroups.length} families, and {ACCENT_PRESETS.length} accents.</p>
            <p>
              Each name ends in its <strong>tone</strong>: its lightness from 0, black, to 100, white. <Code>lime-85</Code> is a light lime,
              {' '}<Code>lime-10</Code> nearly black. The further apart two tones, the stronger their contrast, so the names alone hint at whether a pair will read.
            </p>
            <p>
              Neutrals carry the surfaces and the text; lime is the accent; coral, amber and green speak for danger, warning and success.
              Components never use these chips directly: themes assign them to roles.
            </p>
          </div>
          <ul className="docs-swatch-fan" aria-hidden="true">
            {['--ps-graphite-8', '--ps-stone-95', '--ps-lime-85', '--ps-coral-64', '--ps-amber-78', '--ps-green-79'].map((n) => {
              const c = tokens.palette.find((p) => p.name === n);
              return c && (
                <li key={n} className="docs-swatch-fan-chip">
                  <span className="docs-swatch-fan-color" style={{ background: c.hex }} />
                  <span className="docs-swatch-fan-label">{chipName(n)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <Section title="The tone scale" description="The tone is CIELAB L*, measured from each hex when the docs are built, so the numbers can't drift from the colors.">
          <ToneScale />
        </Section>

        {tokens.paletteGroups.map((group) => {
          const [family, about] = group.title.split(':').map((s) => s.trim());
          const colors = tokens.palette.filter((c) => c.family === family);
          return (
            <Section
              key={family}
              id={`family-${family.toLowerCase()}`}
              title={family}
              description={<>{about ? about[0].toUpperCase() + about.slice(1) + '.' : null} {colors.length} colors, from tone {colors[0]?.tone} to {colors[colors.length - 1]?.tone}.</>}
            >
              <FamilyStrip colors={colors} />
              <ul className="docs-chips">{colors.map((c) => <PaletteChip key={c.name} color={c} />)}</ul>
            </Section>
          );
        })}

        <Section
          id="accents"
          title="Accents"
          description={<>The {ACCENT_PRESETS.length} accent presets, in the site's {theme} theme (switch the theme to see the other). Under each chip: hover, container, text on the container and text on the accent. Every one passes WCAG AA; see <Link to="/foundations/themes">Themes and accents</Link>.</>}
        >
          {ACCENT_GROUPS.map((group) => (
            <div key={group} className="docs-accent-book">
              <h3 className="docs-accent-book-title">{group[0].toUpperCase() + group.slice(1)}</h3>
              <p className="docs-accent-book-about">{ACCENT_GROUP_INTRO[group]}</p>
              <ul className="docs-chips">
                {ACCENT_PRESETS.map((p, i) => ({ p, i })).filter(({ p }) => p.group === group).map(({ p, i }) => (
                  <AccentChip key={p.id} id={p.id} index={i} theme={theme} />
                ))}
              </ul>
            </div>
          ))}
        </Section>
      </Page>
    </CopyProvider>
  );
}
