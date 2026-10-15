import React, { useState } from 'react';
import { buildMediaSettings, INITIAL_MEDIA_STATE, speedChoices, useLabels, VideoPlayer, type MediaController } from '@pastel-studio/react';
import { SimulatedVideo } from '../sim/SimulatedVideo';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

const noop = () => {};
const chapters = [{ start: 0, title: 'Low tide' }, { start: 40, title: 'The turn' }, { start: 95, title: 'High water' }];
const lines = ['The tide comes in twice a day.', 'Twelve hours and twenty-five minutes apart.'];
const still = (over: Partial<MediaController> = {}): MediaController => ({
  ...INITIAL_MEDIA_STATE, currentTime: 52, duration: 150, buffered: 90,
  play: noop, pause: noop, toggle: noop, seek: noop, skip: noop, setVolume: noop, toggleMute: noop, setRate: noop, ...over,
});

function Demo() {
  const labels = useLabels();
  const media = useSimulatedPlayback({ duration: 150, start: 20 });
  const [captions, setCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const settings = buildMediaSettings({ speed: { value: speed, options: speedChoices(labels), onChange: (v) => { setSpeed(v); media.setRate(v); } } }, labels);
  return (
    <VideoPlayer
      media={media}
      variant="movie"
      controls="overlay"
      overline="Coastlines · Episode 2"
      title="Tidal Lines"
      chapters={chapters}
      captions={{ active: captions, onToggle: () => setCaptions((on) => !on), text: lines[Math.floor(media.currentTime / 6) % 2] }}
      settings={settings}
      onNext={noop}
      onBack={noop}
    >
      <SimulatedVideo time={media.currentTime} />
    </VideoPlayer>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Paused: <div className="docs-gallery-span"><VideoPlayer media={still()} title="Tidal Lines"><SimulatedVideo time={52} /></VideoPlayer></div>,
    Playing: <div className="docs-gallery-span"><VideoPlayer media={still({ playing: true })} controls="overlay" title="Tidal Lines"><SimulatedVideo time={52} /></VideoPlayer></div>,
  },
  variants: {
    Filled: <div className="docs-gallery-span"><VideoPlayer media={still()} variant="movie" title="Tidal Lines" chapters={chapters}><SimulatedVideo time={52} /></VideoPlayer></div>,
    Overlay: <div className="docs-gallery-span"><VideoPlayer media={still()} controls="overlay" variant="movie" overline="Coastlines · Episode 2" title="Tidal Lines" chapters={chapters} onBack={noop}><SimulatedVideo time={52} /></VideoPlayer></div>,
  },
  dos: [
    'Use `overlay` for films and full-screen viewing; `filled` for a clip on a page among other content.',
    'Bind a real `<video>` with `useMediaElement` and pass the controller as `media`.',
  ],
  donts: [
    'Don\'t turn off `autoHide` for films: the picture deserves the whole screen.',
    'Don\'t add tools over the picture yourself: pass them to the controls so they fold and hide with them.',
  ],
};
