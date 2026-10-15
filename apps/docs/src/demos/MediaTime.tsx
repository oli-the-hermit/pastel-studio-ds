import React from 'react';
import { IconPause, IconPlay, IconSwap, MediaTime, PlayerControl, Slider } from '@pastel-studio/react';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';
import { OnVideo } from '../blocks/OnVideo';

const noop = () => {};

function Demo() {
  const media = useSimulatedPlayback({ duration: 200, start: 64 });
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <Slider label="Seek" value={media.currentTime} max={media.duration} onChange={media.seek} />
      <div className="docs-demo-row docs-demo-spread">
        <MediaTime current={media.currentTime} duration={media.duration} defaultMode="elapsed" toggleable />
        <PlayerControl size="sm" variant="primary" label={media.playing ? 'Pause' : 'Play'} onClick={media.toggle}>
          <IconSwap on={media.playing} onIcon={<IconPause size={18} />} offIcon={<IconPlay size={18} />} />
        </PlayerControl>
        <MediaTime current={media.currentTime} duration={media.duration} mode="total" />
      </div>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Toggle: <MediaTime current={64} duration={200} toggleable />,
  },
  variants: {
    pair: <MediaTime current={64} duration={200} />,
    elapsed: <MediaTime current={64} duration={200} mode="elapsed" />,
    remaining: <MediaTime current={64} duration={200} mode="remaining" />,
    total: <MediaTime current={64} duration={200} mode="total" />,
    sm: <MediaTime current={64} duration={200} size="sm" onModeChange={noop} />,
    'On video': <OnVideo><MediaTime current={64} duration={200} surface="overlay" toggleable /></OnVideo>,
  },
  dos: [
    'Put the elapsed time at the start of a seek bar and the total or the remaining time at its end.',
    'Make one of them `toggleable` for people who prefer the time left.',
  ],
  donts: [
    'Don\'t round to minutes: songs are counted in seconds.',
    'Don\'t show the pair beside a seek bar that already has times at its ends.',
  ],
};
