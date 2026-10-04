import React from 'react';
import { Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';
import { TokenTable } from '../../blocks/TokenTable';
import { scaleGroup, sentence } from '../../tokens';

export function Elevation() {
  const layers = scaleGroup('Layers');
  const sorted = [...layers.tokens].sort((a, b) => Number(a.value) - Number(b.value));
  return (
    <Page
      overline="Foundations"
      title="Elevation and layers"
      lead="Most of the interface is flat: depth comes from tone. Only layers that float over the page, like menus, popovers and dialogs, get a shadow, and they stack in a fixed order."
    >
      <Section title="On the page: tone" description={<>A card is one surface step above the page, and a field inside it one step above the card. No borders and no shadows, in either theme.</>}>
        <Example>
          <div className="docs-elev-page">
            <div className="docs-elev-card">
              <p className="docs-elev-title">Today</p>
              <p className="docs-elev-text">A card on <Code>--ps-surface-1</Code></p>
              <div className="docs-elev-field">A field on <Code>--ps-field-bg</Code></div>
            </div>
          </div>
        </Example>
      </Section>

      <Section title="Floating: one shadow" description={<>Anything that floats over the page uses <Code>--ps-elev-overlay</Code>, the only shadow in the system. Each theme defines its own, so it reads as depth on dark and on light.</>}>
        <Example>
          <div className="docs-elev-page">
            <div className="docs-elev-card">
              <p className="docs-elev-title">Session</p>
              <div className="docs-elev-menu" role="presentation">
                <span className="docs-elev-menu-item">Rename</span>
                <span className="docs-elev-menu-item is-hover">Duplicate</span>
                <span className="docs-elev-menu-item">Move to list</span>
              </div>
            </div>
          </div>
        </Example>
      </Section>

      <Section title="Behind a dialog: the scrim" description={<>A dialog dims the page with <Code>--ps-scrim</Code>, the one see-through color, so attention moves to the dialog without losing the context behind it.</>}>
        <Example flush>
          <div className="docs-elev-modal">
            <div className="docs-elev-behind">
              <p className="docs-elev-title">Today</p>
              <p className="docs-elev-text">The page behind stays visible, dimmed.</p>
            </div>
            <div className="docs-elev-scrim" />
            <div className="docs-elev-dialog">
              <p className="docs-elev-title">Delete this list?</p>
              <p className="docs-elev-text">Its tasks go with it.</p>
            </div>
          </div>
        </Example>
      </Section>

      <Section title="Stacking order" description="Floating layers stack in this order, lowest first. Use the token, never a number, so a toast always shows above a dialog and a dialog above a sticky header.">
        <TokenTable
          tokens={sorted}
          columns={[
            { header: 'z-index', render: (t) => t.value, numeric: true },
            { header: 'Layer', render: (t) => sentence(t.comment) },
          ]}
        />
      </Section>
    </Page>
  );
}
