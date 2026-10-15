import React, { useState } from 'react';
import { buildMediaSettings, INITIAL_MEDIA_STATE, MediaControls, MenuList, speedChoices, useLabels, VideoSurface, type MediaController } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import { covers } from '../fixtures/covers';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

const noop = () => {};
const chapters = [{ start: 0, title: 'Low tide' }, { start: 40, title: 'The turn' }, { start: 95, title: 'High water' }];

/** A controller standing still, so a gallery example looks the same every time. */
const still = (over: Partial<MediaController> = {}): MediaController => ({
  ...INITIAL_MEDIA_STATE, currentTime: 52, duration: 150, buffered: 90,
  play: noop, pause: noop, toggle: noop, seek: noop, skip: noop, setVolume: noop, toggleMute: noop, setRate: noop, ...over,
});

function Demo() {
  const labels = useLabels();
  const media = useSimulatedPlayback({ duration: 150, start: 30 });
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [captions, setCaptions] = useState(false);
  const [loop, setLoop] = useState(false);
  const settings = buildMediaSettings(
    {
      speed: { value: speed, options: speedChoices(labels), onChange: (v) => { setSpeed(v); media.setRate(v); } },
      quality: { value: quality, options: [{ value: 'auto', label: 'Auto' }, { value: '1080', label: '1080p' }, { value: '720', label: '720p' }], onChange: setQuality },
      loop: { value: loop, onChange: setLoop },
    },
    labels
  );
  return (
    <div className="docs-video-frame">
      <VideoSurface aspectRatio={16 / 9} playing={media.playing} onPlay={media.play}>
        <img src={covers.tidal} alt="" />
      </VideoSurface>
      <div className="docs-video-dock">
        <MediaControls
          media={media}
          variant="movie"
          surface="overlay"
          title="Tidal Lines"
          chapters={chapters}
          captions={{ active: captions, onToggle: () => setCaptions((on) => !on) }}
          settings={settings}
          fullscreen={{ onToggle: noop }}
          pip={{ onToggle: noop }}
          theater={{ onToggle: noop }}
          onNext={noop}
        />
      </div>
    </div>
  );
}

const onVideo = (node: React.ReactNode) => (
  <div className="docs-gallery-span docs-video-frame">
    <VideoSurface aspectRatio={21 / 9} playing><img src={covers.tidal} alt="" /></VideoSurface>
    <div className="docs-video-dock">{node}</div>
  </div>
);
const wide = (node: React.ReactNode) => <div className="docs-gallery-span">{node}</div>;

export const demo: ComponentDemo = {
  Demo,
  states: {
    Chapters: onVideo(<MediaControls media={still()} variant="movie" surface="overlay" title="Tidal Lines" chapters={chapters} />),
    'Settings open': (
      <div className="docs-gallery-span docs-on-video is-wide">
        <img src={covers.tidal} alt="" />
        <StaticPopover className="ps-menu ps-menu--overlay">
          <MenuList items={buildMediaSettings({ speed: { value: 1, options: speedChoices(), onChange: noop }, quality: { value: 'auto', options: [{ value: 'auto', label: 'Auto' }], onChange: noop }, loop: { value: true, onChange: noop } })} onPicked={noop} />
        </StaticPopover>
      </div>
    ),
  },
  variants: {
    basic: wide(<MediaControls media={still()} fullscreen={{ onToggle: noop }} settings={[{ key: 's', label: 'Playback speed', hint: '1×', items: [] }]} />),
    movie: wide(<MediaControls media={still()} variant="movie" title="Tidal Lines" chapters={chapters} captions={{ onToggle: noop }} pip={{ onToggle: noop }} theater={{ onToggle: noop }} fullscreen={{ onToggle: noop }} onNext={noop} />),
    audio: wide(<MediaControls media={still()} variant="audio" onPrevious={noop} onNext={noop} onShuffleChange={noop} onRepeatChange={noop} />),
    Overlay: onVideo(<MediaControls media={still({ playing: true })} surface="overlay" fullscreen={{ onToggle: noop }} />),
    Narrow: <div className="docs-player-stage is-narrow"><MediaControls media={still()} variant="movie" title="Tidal Lines" captions={{ onToggle: noop }} pip={{ onToggle: noop }} fullscreen={{ onToggle: noop }} onNext={noop} /></div>,
  },
  dos: [
    'Pick the variant for the content: a clip, a film, a sound.',
    'Build the gear menu with `buildMediaSettings`, passing only the groups the player supports.',
  ],
  donts: [
    'Don\'t add tools beside the bar: pass them through `startSlot` or `endSlot` so they fold with it.',
  ],
};
