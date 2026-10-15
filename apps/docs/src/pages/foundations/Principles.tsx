import React from 'react';
import { Link } from 'react-router';
import { Code, Page } from '../../blocks/Page';

const PRINCIPLES: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Flat, with depth from tone',
    body: <>Surfaces sit apart by tonal steps, from <Code>--ps-bg</Code> up to <Code>--ps-surface-4</Code>. No borders between areas, no gradients, no decorative shadows, and nothing see-through except the scrim behind dialogs and the dock of controls over video. Only things that float above the page, like menus and dialogs, cast a shadow. See <Link to="/foundations/elevation">Elevation</Link>.</>,
  },
  {
    title: 'One accent, used with intent',
    body: <>The solar lime marks the one thing that matters most on a screen: the main action, the current selection, the focus ring. When everything is lime, nothing stands out.</>,
  },
  {
    title: 'Tokens, never raw values',
    body: <>Every color, size, radius, duration and layer comes from a token. That's what lets a theme restyle a whole app, and why two apps in the family feel like one.</>,
  },
  {
    title: 'Calm, purposeful motion',
    body: <>Motion explains a change: where something came from, where it went. It is short, can be interrupted, and stops when the system asks for reduced motion. See <Link to="/foundations/motion">Motion</Link>.</>,
  },
  {
    title: 'Readable by everyone',
    body: <>Text meets WCAG AA contrast, and the contrast is measured, not guessed: <Link to="/foundations/color#contrast">Color</Link> lists every pairing in both themes. Every control has a visible focus ring, works from the keyboard, and has a name a screen reader can say.</>,
  },
  {
    title: 'Calm words',
    body: <>Sentence case. Plain, kind wording that never blames the person. When something goes wrong, say what happened, that their data is safe if it is, and what to do next.</>,
  },
  {
    title: 'Made to be themed',
    body: <>Components only use semantic roles (<Code>--ps-surface-1</Code>, <Code>--ps-accent</Code>), never palette colors. A new theme redefines the roles, and every component follows.</>,
  },
];

export function Principles() {
  return (
    <Page overline="Foundations" title="Principles" lead="The few rules every screen in the family follows. When in doubt, these decide.">
      <ol className="docs-principles">
        {PRINCIPLES.map((p, i) => (
          <li key={p.title} className="docs-principle">
            <span className="docs-principle-number" aria-hidden="true">{i + 1}</span>
            <div>
              <h2 className="docs-principle-title">{p.title}</h2>
              <p>{p.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Page>
  );
}
