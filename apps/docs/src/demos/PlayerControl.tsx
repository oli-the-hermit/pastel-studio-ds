import React, { useState } from 'react';
import { IconPause, IconPlay, IconReset, IconSkip, IconSoundOff, IconSoundOn, IconSwap, PlayerControl } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
  const [skipped, setSkipped] = useState(0);
  const reset = () => {
    setPlaying(false);
    setSkipped(0);
  };
  return (
    <div className="docs-demo-stack">
      <div className="docs-demo-row">
        <PlayerControl label="Reset" onClick={reset}><IconReset size={22} /></PlayerControl>
        <PlayerControl variant="primary" label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((on) => !on)}>
          <IconSwap on={playing} onIcon={<IconPause size={28} />} offIcon={<IconPlay size={28} />} />
        </PlayerControl>
        <PlayerControl label="Skip to the next phase" onClick={() => setSkipped((n) => n + 1)}><IconSkip size={22} /></PlayerControl>
        <PlayerControl variant="ghost" label="Sound" pressed={sound} onClick={() => setSound((on) => !on)}>
          <IconSwap on={sound} onIcon={<IconSoundOn size={20} />} offIcon={<IconSoundOff size={20} />} />
        </PlayerControl>
      </div>
      <span className="docs-demo-status" role="status">{playing ? 'Running' : 'Paused'}, skipped {skipped}, sound {sound ? 'on' : 'off'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Default: <PlayerControl label="Skip"><IconSkip size={22} /></PlayerControl>,
    Pressed: <PlayerControl variant="ghost" label="Sound" pressed><IconSoundOn size={20} /></PlayerControl>,
    Disabled: <PlayerControl label="Skip" disabled><IconSkip size={22} /></PlayerControl>,
  },
  variants: {
    primary: <PlayerControl variant="primary" label="Play"><IconPlay size={28} /></PlayerControl>,
    secondary: <PlayerControl label="Reset"><IconReset size={22} /></PlayerControl>,
    ghost: <PlayerControl variant="ghost" label="Sound"><IconSoundOn size={20} /></PlayerControl>,
    sm: (
      <>
        <PlayerControl size="sm" label="Reset"><IconReset size={16} /></PlayerControl>
        <PlayerControl size="sm" variant="primary" label="Play"><IconPlay size={18} /></PlayerControl>
        <PlayerControl size="sm" label="Skip"><IconSkip size={16} /></PlayerControl>
      </>
    ),
    Retinted: <PlayerControl variant="primary" label="Play" className="docs-player-break"><IconPlay size={28} /></PlayerControl>,
  },
  dos: [
    'Make play and pause the one primary control, with the others around it.',
    'Change the `label` of play and pause with the state; use `pressed` for toggles like sound.',
    'Use `sm` for every control in a bar or a mini player, so the sizes keep their steps.',
  ],
  donts: [
    'Don\'t use it outside a player: IconButton is the round button for everything else.',
    'Don\'t put two primaries in one player.',
  ],
};
