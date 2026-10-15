import React, { useState } from 'react';
import { MediaTime, Slider, TransportControls, type RepeatMode } from '@pastel-studio/react';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

const noop = () => {};
const tracks = ['Signal Fires', 'Low Tide Radio', 'Copper Lights', 'Northbound'];

function Demo() {
  const [index, setIndex] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const next = () => setIndex((i) => (i + 1 < tracks.length ? i + 1 : repeat === 'all' ? 0 : i));
  const media = useSimulatedPlayback({ duration: 30, onEnded: () => (repeat === 'one' ? media.play() : next()) });
  const last = index === tracks.length - 1 && repeat !== 'all';
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <p className="docs-demo-status" role="status">Track {index + 1} of {tracks.length}: {tracks[index]}</p>
      <Slider label="Seek" value={media.currentTime} max={media.duration} onChange={media.seek} />
      <div className="docs-demo-row docs-demo-spread">
        <MediaTime current={media.currentTime} duration={media.duration} mode="elapsed" />
        <MediaTime current={media.currentTime} duration={media.duration} mode="total" />
      </div>
      <TransportControls
        layout="spread"
        playing={media.playing}
        onPlayPause={media.toggle}
        onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={next}
        hasPrevious={index > 0}
        hasNext={!last}
        shuffle={shuffle}
        onShuffleChange={setShuffle}
        repeat={repeat}
        onRepeatChange={setRepeat}
      />
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Paused: <TransportControls playing={false} onPlayPause={noop} onPrevious={noop} onNext={noop} />,
    Playing: <TransportControls playing onPlayPause={noop} onPrevious={noop} onNext={noop} />,
    'Shuffle and repeat on': <TransportControls size="sm" playing onPlayPause={noop} shuffle onShuffleChange={noop} repeat="one" onRepeatChange={noop} />,
    'At the ends': <TransportControls playing={false} onPlayPause={noop} onPrevious={noop} onNext={noop} hasPrevious={false} />,
  },
  variants: {
    Music: <div className="docs-gallery-span"><TransportControls playing={false} onPlayPause={noop} onPrevious={noop} onNext={noop} shuffle={false} onShuffleChange={noop} repeat="all" onRepeatChange={noop} /></div>,
    Movie: <div className="docs-gallery-span"><TransportControls playing onPlayPause={noop} onSkipBack={noop} onSkipForward={noop} variant="secondary" /></div>,
    Basic: <TransportControls playing={false} onPlayPause={noop} onStop={noop} />,
    sm: <TransportControls size="sm" playing={false} onPlayPause={noop} onPrevious={noop} onNext={noop} />,
    Spread: <div className="docs-demo-wide"><TransportControls layout="spread" size="sm" playing={false} onPlayPause={noop} onPrevious={noop} onNext={noop} /></div>,
  },
  dos: [
    'Pass only the handlers the player supports: the row builds itself from them.',
    'Grey out Previous and Next at the ends with `hasPrevious` and `hasNext` instead of hiding them, so the row keeps its shape.',
  ],
  donts: [
    'Don\'t put other actions in the row: like, queue and volume sit beside it.',
    'Don\'t mix sizes in one row.',
  ],
};
