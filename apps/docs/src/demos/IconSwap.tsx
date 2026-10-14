import React, { useState } from 'react';
import { IconButton, IconPause, IconPlay, IconSoundOff, IconSoundOn, IconSwap } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
  return (
    <div className="docs-demo-row">
      <IconButton label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((on) => !on)}>
        <IconSwap on={playing} onIcon={<IconPause />} offIcon={<IconPlay />} />
      </IconButton>
      <IconButton label="Sound" pressed={sound} onClick={() => setSound((on) => !on)}>
        <IconSwap on={sound} onIcon={<IconSoundOn />} offIcon={<IconSoundOff />} />
      </IconButton>
      <span className="docs-demo-status" role="status">{playing ? 'Playing' : 'Paused'}, sound {sound ? 'on' : 'off'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Off: <IconSwap on={false} onIcon={<IconPause size={28} />} offIcon={<IconPlay size={28} />} />,
    On: <IconSwap on onIcon={<IconPause size={28} />} offIcon={<IconPlay size={28} />} />,
  },
  variants: {},
  dos: [
    'Use it inside a button for a toggle whose icon changes: play and pause, sound on and off.',
    'Give both icons the same size.',
  ],
  donts: [
    'Don\'t use it alone: it is hidden from screen readers, so the button around it must say what it does.',
    'Don\'t swap icons that mean unrelated things; the turn reads as one thing changing state.',
  ],
};
