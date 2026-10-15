import React, { useState } from 'react';
import { AlbumHeader, IconPlaylistAdd } from '@pastel-studio/react';
import { album } from '../fixtures/music';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <AlbumHeader
      album={album}
      playing={playing}
      onPlayPause={() => setPlaying((on) => !on)}
      shuffle={shuffle}
      onShuffleChange={setShuffle}
      saved={saved}
      onSavedChange={setSaved}
      onShare={noop}
      onDownload={noop}
      actions={[{ key: 'add', label: 'Add to playlist', icon: <IconPlaylistAdd size={15} />, onSelect: noop }]}
    />
  );
}

const still = (props: Partial<React.ComponentProps<typeof AlbumHeader>>) => (
  <div className="docs-gallery-span"><AlbumHeader album={album} onPlayPause={noop} onSavedChange={noop} onShuffleChange={noop} {...props} /></div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Not playing': still({}),
    Playing: still({ playing: true }),
    Saved: still({ saved: true }),
  },
  variants: {
    Album: still({ onArtistClick: noop, onShare: noop }),
    Narrow: <div className="docs-player-stage is-narrow"><AlbumHeader album={album} onPlayPause={noop} /></div>,
  },
  dos: [
    'Keep play as the first and biggest action; the rest follow in the order people use them.',
  ],
  donts: [
    'Don\'t put more than four actions in the row: the rest go in the ⋮ menu.',
  ],
};
