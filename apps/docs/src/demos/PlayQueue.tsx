import React, { useState } from 'react';
import { moveById, PlayQueue, type Track } from '@pastel-studio/react';
import { album } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [current, setCurrent] = useState<Track>(album.tracks[0]);
  const [upNext, setUpNext] = useState<Track[]>(album.tracks.slice(1));
  const [history, setHistory] = useState<Track[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const play = (track: Track) => {
    setHistory((h) => [current, ...h]);
    setUpNext((list) => list.filter((t) => t.id !== track.id));
    setCurrent(track);
  };
  return (
    <div className="docs-page-patch">
      <PlayQueue
        className="docs-play-queue"
        current={current}
        playing
        upNext={upNext}
        history={history}
        source={album.title}
        onPlay={play}
        onRemove={(track) => setUpNext((list) => list.filter((t) => t.id !== track.id))}
        onReorder={(a, b) => setUpNext((list) => moveById(list, a, b) ?? list)}
        onShuffle={() => setUpNext((list) => [...list].reverse())}
        onClear={() => setUpNext([])}
        autoplay={{ value: autoplay, onChange: setAutoplay }}
      />
    </div>
  );
}

// A long queue, made up from the album's songs: enough for the list to draw only the rows on screen.
const long: Track[] = Array.from({ length: 1200 }, (_, i) => {
  const from = album.tracks[i % album.tracks.length];
  return { ...from, id: `long-${i}`, title: `${from.title} ${Math.floor(i / album.tracks.length) + 1}` };
});

const still = (props: Partial<React.ComponentProps<typeof PlayQueue>>) => (
  <div className="docs-page-patch">
    <PlayQueue className="docs-play-queue" current={album.tracks[0]} upNext={album.tracks.slice(1, 3)} onPlay={noop} {...props} />
  </div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Up next': still({}),
    History: still({ defaultTab: 'history', history: album.tracks.slice(3, 5) }),
    Empty: still({ upNext: [] }),
    'Long queue': still({ upNext: long, source: 'All songs', onRemove: noop, onReorder: noop }),
    Unavailable: still({ upNext: [album.tracks[1], { ...album.tracks[2], unavailable: "Can't find this file" }, album.tracks[3]], onRemove: noop, onReorder: noop }),
  },
  variants: {
    Full: still({ source: album.title, onClose: noop, onClear: noop, onShuffle: noop, onRemove: noop, onReorder: noop, autoplay: { value: true, onChange: noop } }),
  },
  dos: [
    'Show where the queue comes from with `source`: "Next from Midnight Static".',
    'Let people reorder and remove what is next; what plays now stays put.',
  ],
  donts: [
    'Don\'t hide the history: people often want the last song again.',
  ],
};
