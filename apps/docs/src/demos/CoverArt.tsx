import React from 'react';
import { CoverArt, Equalizer, IconPause, IconPlay, IconSwap, PlayerControl } from '@pastel-studio/react';
import { covers } from '../fixtures/covers';
import { useSimulatedPlayback } from '../sim/useSimulatedPlayback';
import type { ComponentDemo } from './types';

function Demo() {
  const media = useSimulatedPlayback({ duration: 90 });
  return (
    <div className="docs-demo-row">
      <CoverArt src={covers.tidal} alt="Tidal Lines cover" size="md" shape="round" progress={(media.currentTime / media.duration) * 100} />
      <CoverArt src={covers.midnight} alt="" size="sm" badge={media.playing ? <Equalizer playing /> : undefined} />
      <PlayerControl size="sm" variant="primary" label={media.playing ? 'Pause' : 'Play'} onClick={media.toggle}>
        <IconSwap on={media.playing} onIcon={<IconPause size={18} />} offIcon={<IconPlay size={18} />} />
      </PlayerControl>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Image: <CoverArt src={covers.orchard} alt="Orchard cover" size="md" />,
    Placeholder: <CoverArt alt="Untitled demo" size="md" />,
    Loading: <CoverArt size="md" loading />,
    'With progress': <CoverArt src={covers.tidal} alt="Tidal Lines cover" size="md" shape="round" progress={62} />,
    'With badge': (
      <>
        <CoverArt src={covers.neon} alt="" size="md" badge={<Equalizer playing size={12} />} />
        <CoverArt src={covers.neon} alt="" size="sm" badge={<Equalizer playing size={16} />} />
      </>
    ),
  },
  variants: {
    Sizes: (
      <div className="docs-gallery-span docs-demo-row">
        <CoverArt src={covers.dune} alt="" size="xs" />
        <CoverArt src={covers.dune} alt="" size="sm" />
        <CoverArt src={covers.dune} alt="" size="md" />
        <CoverArt src={covers.dune} alt="" size="lg" />
      </div>
    ),
    Round: <CoverArt src={covers.paper} alt="Paper Moons cover" size="md" shape="round" />,
  },
  dos: [
    'Use the size that matches the place: `sm` in rows and bars, `md` on cards, `lg` in a full player.',
    'Leave `alt` empty when the title is printed right beside the cover.',
  ],
  donts: [
    'Don\'t stretch a cover: it is always square.',
    'Don\'t put text over the art; put it beside or under it with TrackInfo.',
  ],
};
