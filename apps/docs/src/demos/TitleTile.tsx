import React, { useState } from 'react';
import { IconFileVideo, IconMusic, IconUser, TitleGrid, TitleTile } from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const albums = [
  { id: 'a1', title: 'Polar Nights', subtitle: 'Aurora Collective · 9 songs', image: covers.midnight },
  { id: 'a2', title: 'Orchard', subtitle: 'Velvet Orchard · 12 songs', image: covers.orchard },
  { id: 'a3', title: 'Tidal', subtitle: 'Harbour Moss · 8 songs', image: covers.tidal },
  { id: 'a4', title: 'Paper', subtitle: 'Inkwell · 10 songs', image: covers.paper },
  { id: 'a5', title: 'Neon', subtitle: 'Sodium · 11 songs', image: covers.neon },
  { id: 'a6', title: 'Dune', subtitle: 'Low Sun · 7 songs', image: covers.dune },
  { id: 'a7', title: 'Home recordings', subtitle: 'Unknown artist · 3 songs' },
];

function Demo() {
  const [current, setCurrent] = useState('a2');
  return (
    <div className="docs-gallery-span">
      <TitleGrid aria-label="Albums">
        {albums.map((album) => (
          <TitleTile
            key={album.id}
            title={album.title}
            subtitle={album.subtitle}
            image={album.image}
            icon={<IconMusic />}
            current={album.id === current}
            onClick={() => setCurrent(album.id)}
            data-tile-id={album.id}
          />
        ))}
      </TitleGrid>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Picture: <TitleTile title="Polar Nights" subtitle="Aurora Collective · 9 songs" image={covers.midnight} />,
    'No picture': <TitleTile title="Home recordings" subtitle="Unknown artist · 3 songs" icon={<IconMusic />} />,
    Mosaic: (
      <>
        <TitleTile title="Autumn evenings" subtitle="Playlist · 24 songs" images={[covers.orchard, covers.tidal, covers.paper, covers.neon, covers.dune]} icon={<IconMusic />} />
        <TitleTile title="Two albums" subtitle="Playlist · 5 songs" images={[covers.dune, covers.midnight, covers.dune]} icon={<IconMusic />} />
      </>
    ),
    'In progress': <TitleTile shape="wide" title="The long way down" subtitle="Season 1 · Episode 3" image={covers.tidal} progress={0.4} />,
    Watched: <TitleTile shape="wide" title="Pilot" subtitle="Season 1 · Episode 1" image={covers.dune} watched />,
    Current: <TitleTile title="Orchard" subtitle="Velvet Orchard · 12 songs" image={covers.orchard} current />,
    Unavailable: (
      <>
        <TitleTile title="Tidal" subtitle="Harbour Moss · 8 songs" image={covers.tidal} unavailable="Can't find this file" />
        <TitleTile shape="wide" title="The long way down" subtitle="Season 1 · Episode 3" icon={<IconFileVideo />} progress={0.4} unavailable="The drive is not connected" />
      </>
    ),
    'Long text': <TitleTile title="Symphony No. 9 in D minor, Op. 125, with the final chorus" subtitle="Orchestra of the Harbour, the City Choir and four soloists" image={covers.paper} />,
  },
  variants: {
    cover: <TitleTile title="Neon" subtitle="Sodium · 2025" image={covers.neon} />,
    poster: (
      <>
        <TitleTile shape="poster" title="Harbour at dusk" subtitle="2024 · 1 h 52 min" image={covers.midnight} progress={0.7} />
        <TitleTile shape="poster" title="Untitled film" subtitle="2019" icon={<IconFileVideo />} />
      </>
    ),
    wide: <TitleTile shape="wide" title="A walk in the dunes" subtitle="48 min" image={covers.dune} />,
    round: (
      <>
        <TitleTile shape="round" title="Velvet Orchard" subtitle="Artist" image={covers.orchard} />
        <TitleTile shape="round" title="Harbour Moss" subtitle="Artist" icon={<IconUser />} />
      </>
    ),
    'In a grid': (
      <div className="docs-gallery-span">
        <TitleGrid shape="poster" aria-label="Films">
          {albums.slice(0, 5).map((film, i) => (
            <TitleTile key={film.id} shape="poster" title={film.title} subtitle={`${2021 + i}`} image={film.image} watched={i === 0} progress={i === 1 ? 0.3 : undefined} />
          ))}
        </TitleGrid>
      </div>
    ),
  },
  dos: [
    'Lay tiles out with a TitleGrid of the same `shape`, and name the grid: "Albums", "Films".',
    'Give every tile an `icon` for its kind: it stands in when there is no picture or it fails to load.',
    'Use `progress` for what is half played and `watched` for what is done; `current` for the one playing now.',
    'Give `images` to a title made of others, like a playlist: its first four covers make the picture.',
    'Say why in `unavailable` when a title cannot be played, and open the way to fix it on click.',
    'Put the facts that tell titles apart in the subtitle: the artist, the year, the episode.',
  ],
  donts: [
    'Don\'t use it for files to select, copy and move: that is a MediaTile in a MediaGrid.',
    'Don\'t mix shapes in one grid: the rows stop lining up.',
    'Don\'t rely on the picture to name a title: the name is always the text under it.',
  ],
};
