import React, { useState } from 'react';
import { Button, IconButton, IconHeart, INITIAL_MEDIA_STATE, MediaViewer, PanelHeader, VideoPlayer, type MediaController } from '@pastel-studio/react';
import { ModalStage } from '../blocks/StaticOverlay';
import { covers } from '../fixtures/covers';
import { SimulatedVideo } from '../sim/SimulatedVideo';
import type { ComponentDemo } from './types';

// Pictures in three shapes, so the fit shows: wide, tall and square. Raw colors are content here.
const picture = (w: number, h: number, body: string, bg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${body}</svg>`)}`;

const photos = [
  { name: 'Harbour at dusk.png', width: 3200, height: 1800, src: picture(3200, 1800, '<circle cx="2300" cy="600" r="260" fill="#F2B654"/><rect y="1150" width="3200" height="650" fill="#103B36"/><rect y="1240" width="3200" height="40" fill="#5EC8B8"/>', '#272A2F') },
  { name: 'Lighthouse.png', width: 1200, height: 2000, src: picture(1200, 2000, '<rect x="500" y="500" width="200" height="1200" fill="#F1F2EC"/><polygon points="460,500 740,500 600,320" fill="#FF6B5B"/><rect y="1700" width="1200" height="300" fill="#46330C"/>', '#5EC8B8') },
  { name: 'Orchard.png', width: 200, height: 200, src: covers.orchard },
];

const noop = () => {};
const paused: MediaController = {
  ...INITIAL_MEDIA_STATE, currentTime: 52, duration: 150, buffered: 90,
  play: noop, pause: noop, toggle: noop, seek: noop, skip: noop, setVolume: noop, toggleMute: noop, setRate: noop,
};

function Facts({ photo }: { photo: (typeof photos)[number] }) {
  return (
    <>
      <PanelHeader title="Details" />
      <dl className="docs-viewer-facts">
        <dt>Size</dt><dd>{photo.width} × {photo.height}</dd>
        <dt>Type</dt><dd>PNG image</dd>
        <dt>Folder</dt><dd>Pictures / Coast</dd>
      </dl>
    </>
  );
}

function Demo() {
  const [index, setIndex] = useState<number | null>(null);
  const [panel, setPanel] = useState(true);
  const [liked, setLiked] = useState<ReadonlySet<number>>(new Set());
  const photo = index === null ? undefined : photos[index];
  return (
    <div className="docs-demo-row">
      {photos.map((p, i) => <Button key={p.name} onClick={() => setIndex(i)}>Open {p.name}</Button>)}
      <MediaViewer
        open={photo !== undefined}
        onClose={() => setIndex(null)}
        title={photo?.name ?? ''}
        position={index === null ? undefined : `${index + 1} of ${photos.length}`}
        onPrevious={index ? () => setIndex(index - 1) : undefined}
        onNext={index !== null && index < photos.length - 1 ? () => setIndex(index + 1) : undefined}
        zoomable
        naturalSize={photo && { width: photo.width, height: photo.height }}
        panel={photo && <Facts photo={photo} />}
        panelOpen={panel}
        onPanelOpenChange={setPanel}
        actions={index !== null && (
          <IconButton label={liked.has(index) ? 'Remove from favorites' : 'Add to favorites'} size="sm" pressed={liked.has(index)} onClick={() => setLiked((prev) => {
            const next = new Set(prev);
            if (!next.delete(index)) next.add(index);
            return next;
          })}>
            <IconHeart filled={liked.has(index)} size={16} />
          </IconButton>
        )}
      >
        {photo && <img src={photo.src} alt="" />}
      </MediaViewer>
    </div>
  );
}

const still = (i: number, extra: Partial<React.ComponentProps<typeof MediaViewer>> = {}) => (
  <ModalStage height={420}>
    <MediaViewer open title={photos[i].name} position={`${i + 1} of 3`} onClose={noop} onNext={noop} onPrevious={noop} zoomable naturalSize={photos[i]} {...extra}>
      <img src={photos[i].src} alt="" />
    </MediaViewer>
  </ModalStage>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Image: still(0),
    Zoomed: still(1, { title: 'Double-click the picture, or use the wheel' }),
    'With panel': still(1, { panel: <Facts photo={photos[1]} />, panelOpen: true, onPanelOpenChange: noop }),
    Video: (
      <ModalStage height={420}>
        <MediaViewer open title="Clip.mp4" onClose={noop}>
          <VideoPlayer media={paused} controls="overlay" title="Clip.mp4"><SimulatedVideo time={52} /></VideoPlayer>
        </MediaViewer>
      </ModalStage>
    ),
  },
  variants: {
    'Full screen': still(2, { title: 'Press F or the full screen button' }),
  },
  dos: [
    'Pass the image\'s natural size: actual size, the zoom readout and the pan limits need it.',
    'Walk the list the way the grid shows it, sorted and filtered, so previous and next match what the person sees.',
    'Put the item\'s details and its everyday actions in the panel; keep it to what fits beside the media.',
  ],
  donts: [
    'Don\'t give the media a fixed shape: the viewer fits it to whatever room the window has.',
    'Don\'t open a dialog over the viewer for something reversible; act and confirm with a toast.',
  ],
};
