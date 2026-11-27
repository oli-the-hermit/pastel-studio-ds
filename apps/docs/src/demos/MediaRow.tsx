import React, { useState } from 'react';
import { IconFileVideo, IconMusic, MediaRow, TitleTile } from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const noop = () => {};
const art = [covers.midnight, covers.orchard, covers.tidal, covers.paper, covers.neon, covers.dune];
const albumNames = ['Polar Nights', 'Orchard', 'Tidal', 'Paper', 'Neon', 'Dune', 'Low Sun', 'Harbour', 'Inkwell', 'Sodium', 'Velvet', 'Moss'];
const albums = (count: number) => albumNames.slice(0, count).map((title, i) => (
  <TitleTile key={title} title={title} subtitle={`${2014 + i} · ${7 + (i % 5)} songs`} image={art[i % art.length]} icon={<IconMusic />} />
));
const episodes = (count: number) => Array.from({ length: count }, (_, i) => (
  <TitleTile
    key={i}
    shape="wide"
    title={`Episode ${i + 1}`}
    subtitle={`Season 1 · ${42 + i} min`}
    image={art[(i + 2) % art.length]}
    icon={<IconFileVideo />}
    watched={i < 2}
    progress={i === 2 ? 0.4 : undefined}
  />
));

function Demo() {
  const [message, setMessage] = useState('Scroll the row, or move in it with the arrow keys.');
  return (
    <div className="docs-gallery-span docs-demo-stack">
      <div className="docs-media-row">
        <MediaRow title="Recently added" onSeeAll={() => setMessage('See all: the app would open every album.')}>
          {albumNames.map((title, i) => (
            <TitleTile
              key={title}
              title={title}
              subtitle={`${2014 + i} · ${7 + (i % 5)} songs`}
              image={art[i % art.length]}
              icon={<IconMusic />}
              onClick={() => setMessage(`Opened ${title}.`)}
            />
          ))}
        </MediaRow>
      </div>
      <span className="docs-demo-status" role="status">{message}</span>
    </div>
  );
}

const frame = (row: React.ReactNode) => <div className="docs-gallery-span"><div className="docs-media-row">{row}</div></div>;

export const demo: ComponentDemo = {
  Demo,
  states: {
    Scrolls: frame(<MediaRow title="Recently added" headingLevel={3}>{albums(12)}</MediaRow>),
    'At an end': frame(<MediaRow title="At the start: Previous is disabled" headingLevel={3}>{albums(12)}</MediaRow>),
    'Everything fits': frame(<MediaRow title="Two albums" headingLevel={3}>{albums(2)}</MediaRow>),
    'With See all': frame(<MediaRow title="Albums" headingLevel={3} onSeeAll={noop}>{albums(12)}</MediaRow>),
  },
  variants: {
    Covers: frame(<MediaRow title="Jump back in" headingLevel={3}>{albums(8)}</MediaRow>),
    'Wide tiles': frame(<MediaRow title="Continue watching" headingLevel={3} onSeeAll={noop}>{episodes(8)}</MediaRow>),
  },
  dos: [
    'Use it for one shelf of a home page: a handful to a few dozen items of the same kind and shape.',
    'Give it `onSeeAll` when the row is only part of what there is, and open the full grid from it.',
    'Put one focusable element in each item, like a TitleTile, so the arrow keys can move between them.',
  ],
  donts: [
    'Don\'t put a whole library in a row: that is a TitleGrid on its own page.',
    'Don\'t mix shapes in one row: the items stop lining up.',
    'Don\'t stack two rows with the same title: the title names the region for screen readers.',
  ],
};
