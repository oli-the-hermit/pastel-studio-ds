import React from 'react';
import { VideoSurface } from '@pastel-studio/react';
import { covers } from '../fixtures/covers';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

const noop = () => {};
const poster = <img src={covers.tidal} alt="" />;
const frame = (node: React.ReactNode) => <div className="docs-video-frame">{node}</div>;

function Demo() {
  const media = useSimulatedPlayback({ duration: 12 });
  const caption = media.playing && media.currentTime > 2 && media.currentTime < 8 ? 'The tide comes in twice a day.' : undefined;
  return frame(
    <VideoSurface aspectRatio={16 / 9} playing={media.playing} ended={media.ended} caption={caption} onPlay={media.play} onReplay={media.play} onClick={media.playing ? media.pause : undefined}>
      {poster}
    </VideoSurface>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Paused: frame(<VideoSurface aspectRatio={16 / 9} playing={false} onPlay={noop}>{poster}</VideoSurface>),
    Playing: frame(<VideoSurface aspectRatio={16 / 9} playing>{poster}</VideoSurface>),
    Buffering: frame(<VideoSurface aspectRatio={16 / 9} playing waiting>{poster}</VideoSurface>),
    Ended: frame(<VideoSurface aspectRatio={16 / 9} playing={false} ended onReplay={noop}>{poster}</VideoSurface>),
    Captions: frame(<VideoSurface aspectRatio={16 / 9} playing caption="The tide comes in twice a day.">{poster}</VideoSurface>),
  },
  variants: {
    Fill: <div className="docs-video-frame is-fill"><VideoSurface playing={false} onPlay={noop}>{poster}</VideoSurface></div>,
  },
  dos: [
    'Give it the video\'s own aspect ratio, so the letterbox only shows when it must.',
    'Keep captions short, two lines at most.',
  ],
  donts: [
    'Don\'t put text or controls straight onto the picture: use the dock (MediaControls with `surface="overlay"`).',
  ],
};
