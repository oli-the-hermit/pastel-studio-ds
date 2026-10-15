import React from 'react';
import { INITIAL_MEDIA_STATE, PipPlayer, type MediaController } from '@pastel-studio/react';
import { SimulatedVideo } from '../sim/SimulatedVideo';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

const noop = () => {};
const still = (over: Partial<MediaController> = {}): MediaController => ({
  ...INITIAL_MEDIA_STATE, currentTime: 52, duration: 150, buffered: 90,
  play: noop, pause: noop, toggle: noop, seek: noop, skip: noop, setVolume: noop, toggleMute: noop, setRate: noop, ...over,
});
const tile = (size: string, node: React.ReactNode) => <div className={`docs-pip-tile ${size}`}>{node}</div>;

function Demo() {
  const media = useSimulatedPlayback({ duration: 150, start: 20 });
  return tile('is-medium', (
    <PipPlayer media={media} title="Tidal Lines" onExpand={noop} onClose={noop} captions={{ active: false, onToggle: noop }} dragHandleProps={{ 'data-drag-region': '' }}>
      <SimulatedVideo time={media.currentTime} />
    </PipPlayer>
  ));
}

const pip = (over: Partial<MediaController> = {}) => (
  <PipPlayer media={still(over)} title="Tidal Lines" onExpand={noop} onClose={noop}><SimulatedVideo time={52} /></PipPlayer>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Controls showing': <div className="docs-gallery-span">{tile('is-small', pip({ playing: true }))}</div>,
  },
  variants: {
    Tiny: tile('is-tiny', pip()),
    Small: <div className="docs-gallery-span">{tile('is-small', pip())}</div>,
    Medium: <div className="docs-gallery-span">{tile('is-medium', pip())}</div>,
  },
  dos: [
    'Give it the whole window: it reads its own size and shows what fits.',
    'Pass your shell\'s drag attribute through `dragHandleProps`, so the window moves by its free space.',
  ],
  donts: [
    'Don\'t add controls of your own: at small sizes there is no room, and the player already folds.',
  ],
};
