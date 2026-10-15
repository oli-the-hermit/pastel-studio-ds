import React, { useState } from 'react';
import { TrackInfo } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-demo-wide">{node}</div>;

function Demo() {
  const [opened, setOpened] = useState('Nothing opened yet');
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <TrackInfo
        size="lg"
        headingLevel={3}
        title="Copper Lights (feat. Ana Rey)"
        artist="Glass Harbor"
        album="Midnight Static"
        year={2026}
        explicit
        onArtistClick={() => setOpened('Opened the artist: Glass Harbor')}
        onAlbumClick={() => setOpened('Opened the album: Midnight Static')}
      />
      <span className="docs-demo-status" role="status">{opened}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Full: wide(<TrackInfo title="Signal Fires" artist="Glass Harbor" album="Midnight Static" year={2026} />),
    Explicit: wide(<TrackInfo title="Copper Lights" artist="Glass Harbor" explicit />),
    Links: wide(<TrackInfo title="Low Tide Radio" artist="Glass Harbor" album="Midnight Static" onArtistClick={noop} onAlbumClick={noop} />),
    'Long title': wide(<TrackInfo size="lg" title="The Long Way Home Is Still the Way Home, Even in the Rain" artist="Glass Harbor" album="Midnight Static" />),
  },
  variants: {
    lg: wide(<TrackInfo size="lg" title="Northbound" artist="Glass Harbor" album="Midnight Static" />),
    md: wide(<TrackInfo title="Northbound" artist="Glass Harbor" album="Midnight Static" />),
    sm: wide(<TrackInfo size="sm" title="Northbound" artist="Glass Harbor" />),
    Centered: wide(<TrackInfo align="center" size="lg" title="Paper Satellites" artist="Glass Harbor" year={2026} />),
  },
  dos: [
    'Pass only the parts the place needs: a row may show the artist alone.',
    'Make the title a heading in a player with `headingLevel`.',
  ],
  donts: [
    'Don\'t write the artist into the title: give each its own prop, so they truncate and link on their own.',
    'Don\'t use `lg` in a list: two-line titles break the rhythm of the rows.',
  ],
};
