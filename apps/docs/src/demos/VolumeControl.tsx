import React, { useState } from 'react';
import { VolumeControl } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  return (
    <div className="docs-demo-row">
      <VolumeControl volume={volume} muted={muted} onVolumeChange={(v) => { setVolume(v); setMuted(v === 0); }} onMuteToggle={() => setMuted((m) => !m)} />
      <span className="docs-demo-status" role="status">{muted ? 'Muted' : `Volume ${Math.round(volume * 100)}%`}. Hover or tab to the button to unfold the slider.</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    High: <VolumeControl layout="inline" volume={0.8} muted={false} onVolumeChange={noop} onMuteToggle={noop} />,
    Low: <VolumeControl layout="inline" volume={0.3} muted={false} onVolumeChange={noop} onMuteToggle={noop} />,
    Muted: <VolumeControl layout="inline" volume={0.6} muted onVolumeChange={noop} onMuteToggle={noop} />,
  },
  variants: {
    Expand: <VolumeControl volume={0.6} muted={false} onVolumeChange={noop} onMuteToggle={noop} />,
    Inline: <VolumeControl layout="inline" size="md" volume={0.6} muted={false} onVolumeChange={noop} onMuteToggle={noop} />,
    Button: <VolumeControl layout="button" volume={0.6} muted={false} onVolumeChange={noop} onMuteToggle={noop} />,
  },
  dos: [
    'Keep the level when muting, so unmuting brings it back.',
    'Use `expand` in a bar, where room is short, and `inline` in a full player.',
  ],
  donts: [
    'Don\'t start at full volume: begin where the person left it.',
  ],
};
