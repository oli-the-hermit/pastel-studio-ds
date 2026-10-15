import React, { useState } from 'react';
import { IconPlaylistAdd, INITIAL_MEDIA_STATE, MusicPlayer, type MediaController, type RepeatMode } from '@pastel-studio/react';
import { album } from '../fixtures/music';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

/** A controller standing still while playing, so a gallery example looks the same every time. */
const frozen = (duration: number): MediaController => {
  const noop = () => {};
  return { ...INITIAL_MEDIA_STATE, playing: true, currentTime: 64, duration, buffered: 150, play: noop, pause: noop, toggle: noop, seek: noop, skip: noop, setVolume: noop, toggleMute: noop, setRate: noop };
};

function Player({ layout, playing = false }: { layout?: 'stack' | 'row'; playing?: boolean }) {
  const [index, setIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [liked, setLiked] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const track = album.tracks[index];
  const next = () => setIndex((i) => (i + 1) % album.tracks.length);
  const simulated = useSimulatedPlayback({ duration: track.duration, start: 64, onEnded: next });
  const media = playing ? frozen(track.duration) : simulated;
  return (
    <MusicPlayer
      layout={layout}
      media={media}
      track={track}
      source={`Album · ${album.title}`}
      onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
      onNext={next}
      hasPrevious={index > 0}
      shuffle={shuffle}
      onShuffleChange={setShuffle}
      repeat={repeat}
      onRepeatChange={setRepeat}
      liked={liked}
      onLikedChange={setLiked}
      queueOpen={queueOpen}
      onQueueToggle={() => setQueueOpen((o) => !o)}
      actions={[{ key: 'add', label: 'Add to playlist', icon: <IconPlaylistAdd size={15} />, onSelect: () => {} }]}
    />
  );
}

function Demo() {
  return (
    <div className="docs-page-patch">
      <div className="docs-player-stage"><Player /></div>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Paused: <div className="docs-page-patch"><div className="docs-player-stage is-narrow"><Player layout="stack" /></div></div>,
    Playing: <div className="docs-page-patch"><div className="docs-player-stage"><Player layout="row" playing /></div></div>,
  },
  variants: {
    Stack: <div className="docs-page-patch"><div className="docs-player-stage is-narrow"><Player /></div></div>,
    Row: <div className="docs-page-patch"><div className="docs-player-stage is-wide"><Player /></div></div>,
    'Side panel': <div className="docs-page-patch"><div className="docs-player-stage is-panel"><Player /></div></div>,
  },
  dos: [
    'Give it the width it has: it picks the column or the row by itself.',
    'Pass only the tools the app supports; the foot row builds itself from the handlers.',
  ],
  donts: [
    'Don\'t put two players on one screen: use the NowPlayingBar elsewhere.',
  ],
};
