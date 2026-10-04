import React from 'react';
import { Link } from 'react-router';
import { Callout, Code, Page, Section } from '../blocks/Page';

export function GettingStarted() {
  return (
    <Page
      overline="Start"
      title="Getting started"
      lead="Pastel Studio comes in two packages. Most apps use the React one, which brings the tokens with it."
    >
      <Callout title="Not published yet">
        Until the first release, apps in the family use the packages straight from this repository.
        The steps below stay the same once they're published.
      </Callout>

      <Section title="In a React app">
        <ol className="docs-steps">
          <li>
            <p className="docs-step-title">Add the package</p>
            <p>Add <Code>@pastel-studio/react</Code>. It depends on <Code>@pastel-studio/tokens</Code>, so you get both.</p>
          </li>
          <li>
            <p className="docs-step-title">Import the styles once</p>
            <p>
              At the top of your app's main stylesheet, import <Code>@pastel-studio/react/styles.css</Code>.
              It brings the Geist Variable font, the tokens, the foundation styles and every component's CSS.
            </p>
          </li>
          <li>
            <p className="docs-step-title">Keep your own styles on top</p>
            <p>
              Everything from Pastel Studio sits in one cascade layer called <Code>ps</Code>.
              Declare yours after it with <Code>@layer ps, app;</Code>, or leave your styles outside any layer.
              Either way they win over the library's, without <Code>!important</Code>.
            </p>
          </li>
          <li>
            <p className="docs-step-title">Pick a theme</p>
            <p>
              Dark is the default. Put <Code>data-theme="light"</Code> on <Code>&lt;html&gt;</Code> for light.
              Any element can switch its own part of the page the same way, in either direction.
            </p>
          </li>
          <li>
            <p className="docs-step-title">Use tokens, not values</p>
            <p>
              Write <Code>var(--ps-surface-1)</Code>, <Code>var(--ps-space-16)</Code> or <Code>var(--ps-dur-2)</Code>, never the color or the size itself.
              That's what lets a theme change the whole app at once. The repository's Stylelint setup enforces it.
            </p>
          </li>
        </ol>
      </Section>

      <Section title="Tokens only, without React">
        <p>
          The tokens are plain CSS custom properties and work with any framework.
          Import <Code>@pastel-studio/tokens/fonts.css</Code> for the font, then <Code>@pastel-studio/tokens</Code> for every token.
          See <Link to="/foundations/color">Color</Link> for how the palette, the roles and the themes fit together.
        </p>
      </Section>

      <Section title="Names at a glance">
        <ul className="docs-list">
          <li>Tokens start with <Code>--ps-</Code>: <Code>--ps-accent</Code>, <Code>--ps-font-size-md</Code>, <Code>--ps-radius-lg</Code>.</li>
          <li>Component classes start with <Code>ps-</Code>, and states use <Code>is-</Code>: <Code>ps-button is-selected</Code>.</li>
          <li>The reference palette (<Code>--ps-lime-85</Code> and friends) is for themes only. Components use roles like <Code>--ps-accent</Code>.</li>
        </ul>
      </Section>
    </Page>
  );
}
