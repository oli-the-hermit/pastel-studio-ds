import React, { useState } from 'react';
import { Equalizer, IconPause, IconPlay, IconSwap, PlayerControl } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="docs-demo-row">
      <PlayerControl size="sm" variant="primary" label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((on) => !on)}>
        <IconSwap on={playing} onIcon={<IconPause size={18} />} offIcon={<IconPlay size={18} />} />
      </PlayerControl>
      <span className="docs-demo-accent"><Equalizer playing={playing} size={16} /></span>
      <span className="docs-demo-status" role="status">{playing ? 'Now playing' : 'Paused'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Still: <Equalizer />,
    Playing: <span className="docs-demo-accent"><Equalizer playing /></span>,
  },
  variants: {
    Sizes: (
      <span className="docs-demo-accent docs-demo-row">
        <Equalizer playing size={12} />
        <Equalizer playing />
        <Equalizer playing size={20} />
      </span>
    ),
  },
  dos: [
    'Put it on the row or the cover of what is playing now, in the accent text color.',
    'Stop it when playback pauses, so it says the truth.',
  ],
  donts: [
    'Don\'t use it as a button or a loading sign: it only marks what is playing.',
    'Don\'t show more than one at a time.',
  ],
};
