import React from 'react';
import { Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';
import { TokenTable } from '../../blocks/TokenTable';
import { fmt, scaleGroup, sentence, toPx, tokensWith } from '../../tokens';

const SAMPLE = 'Focus on one thing at a time';

export function Typography() {
  const type = scaleGroup('Type');
  const family = type.tokens.find((t) => t.name === '--ps-font-family');
  const sizes = tokensWith(type, '--ps-font-size-').filter((t) => t.name !== '--ps-font-size-root');
  const weights = tokensWith(type, '--ps-font-weight-');
  const leading = tokensWith(type, '--ps-leading-');
  const tracking = tokensWith(type, '--ps-tracking-');

  return (
    <Page
      overline="Foundations"
      title="Typography"
      lead="One typeface, Geist Variable, in eight sizes. Hierarchy comes from size steps that are far enough apart to see, and from weight and color."
    >
      <Section title="Typeface" description={<>Geist Variable is bundled with the tokens, so it works offline and looks the same on every system. The stack falls back to the system's own UI font: <Code>{family?.value}</Code>.</>}>
        <Example>
          <div className="docs-specimen">
            <p className="docs-specimen-hero">Aa</p>
            <div>
              <p className="docs-specimen-line">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="docs-specimen-line">abcdefghijklmnopqrstuvwxyz</p>
              <p className="docs-specimen-line">0123456789 · 25:00 · 1,250 · ¿?¡!&amp;@</p>
            </div>
          </div>
        </Example>
      </Section>

      <Section title="Type scale" description={<>Eight sizes, set in rem so they follow the root size (<Code>1rem</Code> is {fmt(toPx('1rem'))}px). Pick a step by its role, as listed. When something needs to stand out within a size, raise the weight or the color, not the size by half a pixel.</>}>
        <Example flush>
          <ul className="docs-type-scale">
            {sizes.map((t) => (
              <li key={t.name} className="docs-type-row">
                <span className="docs-type-meta">
                  <Code>{t.name.replace('--ps-font-size-', '')}</Code>
                  <span>{fmt(toPx(t.value))}px</span>
                </span>
                <span className="docs-type-sample" style={{ fontSize: `var(${t.name})` }}>{SAMPLE}</span>
                <span className="docs-type-use">{sentence(t.comment)}</span>
              </li>
            ))}
          </ul>
        </Example>
        <TokenTable
          tokens={sizes}
          columns={[
            { header: 'rem', render: (t) => t.value, numeric: true },
            { header: 'px', render: (t) => fmt(toPx(t.value)), numeric: true },
            { header: 'Use', render: (t) => sentence(t.comment) },
          ]}
        />
      </Section>

      <Section title="Weights" description="Geist is variable, so any weight is available; these five are the ones the system uses. Emphasis inside a size is a weight step, never a bigger size.">
        <Example>
          <ul className="docs-samples">
            {weights.map((t) => (
              <li key={t.name}>
                <span className="docs-sample-label"><Code>{t.name}</Code> {t.value}</span>
                <span className="docs-sample-text" style={{ fontWeight: `var(${t.name})` }}>{SAMPLE}</span>
              </li>
            ))}
          </ul>
        </Example>
      </Section>

      <Section title="Line height" description="Normal for paragraphs, tighter for titles and single lines, none for numbers and icons set in a box.">
        <Example>
          <ul className="docs-leading">
            {leading.map((t) => (
              <li key={t.name}>
                <span className="docs-sample-label"><Code>{t.name}</Code> {t.value}</span>
                <p className="docs-leading-text" style={{ lineHeight: `var(${t.name})` }}>
                  Plan the session, start the timer and let everything else wait. When it ends, take the break: it's part of the work.
                </p>
              </li>
            ))}
          </ul>
        </Example>
      </Section>

      <Section title="Letter spacing" description="Large digits and titles tighten; small uppercase labels open up so they stay legible.">
        <Example>
          <ul className="docs-samples">
            {tracking.map((t) => {
              const caps = t.name.includes('caps') || t.name.endsWith('wide');
              return (
                <li key={t.name}>
                  <span className="docs-sample-label"><Code>{t.name}</Code> {t.value}{t.comment ? ` · ${t.comment}` : ''}</span>
                  <span
                    className={caps ? 'docs-tracking-caps' : 'docs-tracking-large'}
                    style={{ letterSpacing: `var(${t.name})` }}
                  >
                    {caps ? 'Today’s focus' : '25:00 Focus'}
                  </span>
                </li>
              );
            })}
          </ul>
        </Example>
      </Section>
    </Page>
  );
}
