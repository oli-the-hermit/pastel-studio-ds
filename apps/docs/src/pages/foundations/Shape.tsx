import React from 'react';
import { Button, Card, CardHeader, Chip, Field, TextInput } from '@pastel-studio/react';
import { Anatomy } from '../../blocks/Anatomy';
import { Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';
import { scaleGroup } from '../../tokens';

export function Shape() {
  const radius = scaleGroup('Radius');
  const lines = scaleGroup('Lines and rings');
  return (
    <Page
      overline="Foundations"
      title="Shape"
      lead="Soft corners, and the thin lines and rings that outline focus and selection. Bigger things get rounder corners: chips are small, cards and dialogs are generous, buttons are pills."
    >
      <Section title="Corner radius" description={<>Pick the radius by the size of the thing: <Code>xs</Code>–<Code>sm</Code> for small parts inside a control, <Code>md</Code> for fields, <Code>lg</Code>–<Code>xl</Code> for cards, <Code>2xl</Code> and up for dialogs and large panels, <Code>pill</Code> for buttons and chips, <Code>round</Code> for avatars and dots.</>}>
        <Example>
          <ul className="docs-shapes">
            {radius.tokens.map((t) => (
              <li key={t.name} className="docs-shape">
                <span
                  className={t.name.endsWith('pill') ? 'docs-shape-tile is-wide' : 'docs-shape-tile'}
                  style={{ borderRadius: `var(${t.name})` }}
                />
                <Code>{t.name.replace('--ps-radius-', '')}</Code>
                <span className="docs-shape-value">{t.value}</span>
              </li>
            ))}
          </ul>
        </Example>
      </Section>

      <Section title="Corners in a component" description="The radius of each, measured from the live component and named after its token. Pills stay pills at any height.">
        <div className="docs-anatomy-pair">
          <Anatomy example={<Button variant="primary">Save</Button>} show={['radius', 'size']} prefer={['--ps-button-height']} maxScale={2.4} />
          <Anatomy example={<Chip tone="accent">3 tasks left</Chip>} show={['radius', 'size']} prefer={['--ps-chip-height']} maxScale={2.4} />
          <Anatomy example={<Field label="List name"><TextInput defaultValue="Weekend errands" /></Field>} target="input" show={['radius', 'size']} prefer={['--ps-field-height']} width={260} maxScale={1.4} />
          <Anatomy example={<Card><CardHeader title="Weekend errands" /><p>Three things left.</p></Card>} show={['radius']} width={260} maxScale={1.2} />
        </div>
      </Section>

      <Section title="Lines and rings" description={<>Widths only; the color comes from the theme. Rings are drawn with <Code>box-shadow</Code> or <Code>outline</Code>, so they never change a component's size. They outline focus and selection, not areas: areas are separated by tone.</>}>
        <Example>
          <ul className="docs-shapes">
            {lines.tokens.map((t) => (
              <li key={t.name} className="docs-shape">
                <span className="docs-shape-tile is-ring" style={{ boxShadow: `0 0 0 var(${t.name}) var(--ps-focus-ring)` }} />
                <Code>{t.name.replace('--ps-', '')}</Code>
                <span className="docs-shape-value">{t.value}{t.comment ? ` · ${t.comment}` : ''}</span>
              </li>
            ))}
          </ul>
        </Example>
      </Section>
    </Page>
  );
}
