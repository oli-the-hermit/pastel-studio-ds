import React from 'react';
import { Link } from 'react-router';
import { Callout, Code, Page, Section } from '../blocks/Page';
import { PAGES } from '../registry';

export function Home() {
  const foundations = PAGES.filter((p) => p.section === 'Foundations');
  return (
    <Page
      overline="Overview"
      title="Pastel Studio Design System"
      lead="The shared look and behavior of the Pastel Studio apps: design tokens, React components, and the guidelines that tie them together. Everything here is what the apps themselves use."
    >
      <Callout title="Version 0.1: foundations">
        Colors, type, spacing, shape, elevation, motion and icons are ready, in a dark and a light theme.
        Components are added one by one, each with live examples of every state.
      </Callout>

      <Section title="What's inside">
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr><th scope="col">Package</th><th scope="col">What it holds</th></tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row"><Code>@pastel-studio/tokens</Code></th>
                <td>Every design value as a CSS custom property: the palette, the dark and light themes, and the type, space, shape, motion and layer scales. Plain CSS, no framework needed.</td>
              </tr>
              <tr>
                <th scope="row"><Code>@pastel-studio/react</Code></th>
                <td>React components and icons, plus the foundation styles every app starts from: reset, document defaults, focus ring, scrollbars and reduced motion.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Foundations" description="The building blocks every component is made from. Each page shows the real tokens, read straight from the token files.">
        <ul className="docs-cards">
          {foundations.map((p) => (
            <li key={p.path}>
              <Link to={p.path} className="docs-card">
                <span className="docs-card-title">{p.title}</span>
                <span className="docs-card-summary">{p.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Reading these pages">
        <ul className="docs-list">
          <li>Use <strong>Dark</strong> and <strong>Light</strong> at the top to switch the whole site's theme.</li>
          <li>Turn on <strong>Compare</strong> to see every example in both themes, side by side.</li>
          <li>Token names, like <Code>--ps-surface-1</Code>, are what you use in code. Values are shown so you know what you get, not to be copied.</li>
        </ul>
      </Section>
    </Page>
  );
}
