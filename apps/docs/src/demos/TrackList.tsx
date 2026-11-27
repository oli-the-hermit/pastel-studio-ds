import React, { useState } from 'react';
import { IconCopy, IconPlaylistAdd, moveById, TrackList, type MenuItem, type Track } from '@pastel-studio/react';
import { album, playlist } from '@pastel-studio/catalog/fixtures';
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

// A library's worth of songs, made up from the playlist's: enough for the list to draw only the rows on screen.
const library: Track[] = Array.from({ length: 3000 }, (_, i) => {
  const from = playlist[i % playlist.length];
  return { ...from, id: `library-${i}`, title: `${from.title} ${Math.floor(i / playlist.length) + 1}`, duration: 150 + ((i * 37) % 200), addedAt: undefined };
});

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
    'Long list': (
      <div className="docs-gallery-span docs-long-list">
        <TrackList ariaLabel="All songs" tracks={library} onPlay={noop} onLikedChange={noop} rowActions={actions} columns={{ cover: true, album: true }} currentId="library-4" />
      </div>
    ),
    Unavailable: still({
      tracks: playlist.map((t, i) => (i % 2 ? { ...t, unavailable: i === 1 ? "Can't find this file" : 'The drive is not connected' } : t)),
      columns: { cover: true, album: true },
    }),
  },
  variants: {
    Album: still({ tracks: album.tracks }),
    Playlist: still({ tracks: playlist, columns: { cover: true, album: true, added: true }, onReorder: noop }),
    'No header': still({ header: false }),
  },
  dos: [
    'Use the album layout for an album and add columns for a playlist, where tracks come from many places.',
    'Give the list an `ariaLabel` with the album or playlist name.',
    'Pass a whole library as it is: a long list draws only the rows near the screen, and follows whatever scrolls it, the page or a panel.',
    'Set `unavailable` on a track that cannot be played, with the reason, and open the way to fix it from `onUnavailable`.',
  ],
  donts: [
    'Don\'t add columns that repeat what the page already says, like the album on an album page.',
    'Don\'t make some rows of a long list taller than others: the rows left out are counted at the height of the ones drawn.',
  ],
};
