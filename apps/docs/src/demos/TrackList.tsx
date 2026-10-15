import React, { useState } from 'react';
import { IconCopy, IconPlaylistAdd, moveById, TrackList, type MenuItem, type Track } from '@pastel-studio/react';
import { album, playlist } from '../fixtures/music';
import type { ComponentDemo } from './types';

const noop = () => {};
const actions = (t: Track): MenuItem[] => [
  { key: 'queue', label: 'Add to queue', icon: <IconPlaylistAdd size={15} />, onSelect: noop },
  { key: 'copy', label: `Copy link to ${t.title}`, icon: <IconCopy size={15} />, onSelect: noop },
];

function Demo() {
  const [tracks, setTracks] = useState(playlist);
  const [currentId, setCurrentId] = useState<string | undefined>('p2');
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set(['p3']));
  return (
    <div className="docs-demo-wide">
      <TrackList
        ariaLabel="Autumn playlist"
        tracks={tracks}
        currentId={currentId}
        playing={playing}
        onPlay={(t) => { setCurrentId(t.id); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        likedIds={liked}
        onLikedChange={(t, on) => setLiked((s) => { const next = new Set(s); if (on) next.add(t.id); else next.delete(t.id); return next; })}
        rowActions={actions}
        columns={{ cover: true, album: true, added: true }}
        onReorder={(a, b) => setTracks((list) => moveById(list, a, b) ?? list)}
      />
    </div>
  );
}

const still = (props: Partial<React.ComponentProps<typeof TrackList>>) => (
  <div className="docs-gallery-span">
    <TrackList tracks={album.tracks.slice(0, 3)} onPlay={noop} onLikedChange={noop} rowActions={actions} {...props} />
  </div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Rows: still({}),
    Current: still({ currentId: 't2', playing: true }),
    Liked: still({ likedIds: new Set(['t1', 't3']) }),
  },
  variants: {
    Album: still({ tracks: album.tracks }),
    Playlist: still({ tracks: playlist, columns: { cover: true, album: true, added: true }, onReorder: noop }),
    'No header': still({ header: false }),
  },
  dos: [
    'Use the album layout for an album and add columns for a playlist, where tracks come from many places.',
    'Give the list an `ariaLabel` with the album or playlist name.',
  ],
  donts: [
    'Don\'t add columns that repeat what the page already says, like the album on an album page.',
  ],
};
