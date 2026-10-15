import React, { useState } from 'react';
import { NowPlayingBar } from '@pastel-studio/react';
import { album } from '../fixtures/music';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

const noop = () => {};

function Bar({ empty = false }: { empty?: boolean }) {
  const [index, setIndex] = useState(1);
  const [liked, setLiked] = useState(true);
  const [queueOpen, setQueueOpen] = useState(false);
  const track = album.tracks[index];
  const media = useSimulatedPlayback({ duration: track.duration, start: 40 });
  return (
    <NowPlayingBar
      media={media}
      track={empty ? undefined : track}
      liked={liked}
      onLikedChange={setLiked}
      onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
      onNext={() => setIndex((i) => (i + 1) % album.tracks.length)}
      queueOpen={queueOpen}
      onQueueToggle={() => setQueueOpen((o) => !o)}
      onLyricsToggle={noop}
      onMiniPlayer={noop}
      onExpand={noop}
    />
  );
}

function Demo() {
  return <div className="docs-page-patch"><div className="docs-player-stage is-bar"><Bar /></div></div>;
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Playing: <div className="docs-page-patch"><div className="docs-player-stage is-bar"><Bar /></div></div>,
    'Nothing playing': <div className="docs-page-patch"><div className="docs-player-stage is-bar"><Bar empty /></div></div>,
  },
  variants: {
    Medium: <div className="docs-page-patch"><div className="docs-player-stage is-bar"><Bar /></div></div>,
    Narrow: <div className="docs-page-patch"><div className="docs-player-stage is-narrow"><Bar /></div></div>,
  },
  dos: [
    'Keep it along the bottom of every screen of a music app, so playback is always in reach.',
  ],
  donts: [
    'Don\'t show it on the full player screen: the MusicPlayer already has everything.',
  ],
};
