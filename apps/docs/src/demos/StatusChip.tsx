import React, { useState } from 'react';
import { IconPause, IconPlay, StatusChip } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const bar = (node: React.ReactNode) => <div className="docs-window-row">{node}</div>;

function Demo() {
  const [playing, setPlaying] = useState(true);
  return bar(
    <StatusChip
      tone={playing ? 'live' : 'paused'}
      label={playing ? 'Playing' : 'Paused'}
      value="1:12"
      onOpen={noop}
      openTitle="Go to the player"
      action={{ label: playing ? 'Pause' : 'Play', icon: playing ? <IconPause size={14} /> : <IconPlay size={14} />, onClick: () => setPlaying((p) => !p) }}
    />
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Idle: bar(<StatusChip tone="idle" label="Ready" onOpen={noop} />),
    Live: bar(<StatusChip tone="live" label="Focusing" onOpen={noop} />),
    Paused: bar(<StatusChip tone="paused" label="Paused" onOpen={noop} />),
    'With value and action': bar(<StatusChip tone="live" label="Focusing" value="18:06" onOpen={noop} action={{ label: 'Pause', icon: <IconPause size={14} />, onClick: noop }} />),
  },
  variants: {},
  dos: [
    'Say the status in the label; the dot only backs it up.',
    'Show the value and the action only away from the page the status belongs to (the timer on another page).',
  ],
  donts: [
    'Don\'t put more than one in the top bar.',
  ],
};
