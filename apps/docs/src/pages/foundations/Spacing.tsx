import React from 'react';
import { Button, Card, CardHeader, Chip, IconPlus, ListRow, IconBug } from '@pastel-studio/react';
import { Anatomy } from '../../blocks/Anatomy';
import { Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';
import { TokenTable } from '../../blocks/TokenTable';
import { scaleGroup, sentence, toPx } from '../../tokens';
import type { Token } from '../../tokens/types';

/** The widest shape the table draws to scale; a dialog's width would push the other columns out. */
const WIDEST_SHAPE_PX = 240;

/** How to draw a component size: a bar for heights and widths, a square for -size tokens. */
function SizePreview({ token }: { token: Token }) {
  if (toPx(token.value) > WIDEST_SHAPE_PX) return null;
  const v = `var(${token.name})`;
  if (token.name.endsWith('-size') || token.name.includes('-size-')) return <span className="docs-size-box" style={{ width: v, height: v }} />;
  if (token.name.includes('height')) return <span className="docs-size-box is-wide" style={{ height: v }} />;
  return <span className="docs-space-bar" style={{ width: v }} />;
}

export function Spacing() {
  const space = scaleGroup('Space');
  const sizes = scaleGroup('Component sizes');
  return (
    <Page
      overline="Foundations"
      title="Spacing and sizing"
      lead="Space follows a 2px grid, and every token is named after its size: --ps-space-16 is 16px. Controls have fixed heights, so a row of mixed controls always lines up."
    >
      <Section title="Space" description={<>For padding, margins and gaps. Inside a component, keep to the small steps (4 to 16); between groups and sections, use the larger ones. {space.title.split(':')[1]?.trim()}.</>}>
        <Example flush>
          <TokenTable
            tokens={space.tokens}
            columns={[
              { header: 'px', render: (t) => t.value.replace('px', ''), numeric: true },
              { header: 'Size', render: (t) => <span className="docs-space-bar" style={{ width: `var(${t.name})` }} /> },
              { header: 'Use', render: (t) => sentence(t.comment) },
            ]}
          />
        </Example>
      </Section>

      <Section title="Reading spacing in a component" description="Measured from the live components: padding in amber, the space between parts in green, sizes in grey. Every value lands on a step of the scale above.">
        <Anatomy
          example={<Card><CardHeader title="Weekend errands" titleAddon={<Chip tone="accent">3 left</Chip>} /><p>Groceries, the bike, and the parcel at the post office.</p></Card>}
          width={340}
          maxScale={1.4}
          show={['padding', 'gap', 'size', 'parts']}
          caption="Between groups, the steps are large: a card pads its content evenly, and its header stands apart from its body."
        />
        <Anatomy
          example={<ListRow icon={<IconBug size={20} />} title="Report a problem" description="Opens an issue on GitHub" external />}
          width={360}
          maxScale={1.6}
          show={['padding', 'gap', 'size']}
          caption="Inside a component the steps are small: a row's padding and the space between its icon, text and trailing mark."
        />
        <Anatomy
          example={<Button variant="primary" icon={<IconPlus />}>Add task</Button>}
          show={['padding', 'gap', 'size']}
          prefer={['--ps-button-height']}
          caption="Controls have a fixed height, so the padding is only on the sides."
        />
      </Section>

      <Section title="Component sizes" description={<>Fixed heights and sizes for controls. A field and a button side by side share a baseline because both come from here: <Code>--ps-field-height</Code> and <Code>--ps-button-height</Code>.</>}>
        <Example flush>
          <TokenTable
            tokens={sizes.tokens}
            columns={[
              { header: 'Value', render: (t) => t.value, numeric: true },
              { header: 'Shape', render: (t) => <SizePreview token={t} /> },
              { header: 'Use', render: (t) => sentence(t.comment) },
            ]}
          />
        </Example>
      </Section>
    </Page>
  );
}
