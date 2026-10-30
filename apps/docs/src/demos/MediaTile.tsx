import React, { useState } from 'react';
import { IconButton, IconCopy, IconHeart, IconTrash, MediaTile } from '@pastel-studio/react';
import { covers } from '../fixtures/covers';
import type { ComponentDemo } from './types';

const site = <img src={covers.paper} alt="" />;

function Demo() {
  const [selected, setSelected] = useState(false);
  const [favorite, setFavorite] = useState(true);
  return (
    <div className="docs-demo-row">
      <MediaTile
        className="docs-media-tile"
        name="Tidal lines.png"
        src={covers.tidal}
        meta="2400 × 2400 · 1.8 MB"
        favorite={favorite}
        selected={selected}
        onClick={() => setSelected(!selected)}
        actions={
          <>
            <IconButton label={favorite ? 'Remove from favorites' : 'Add to favorites'} size="xs" surface="overlay" pressed={favorite} onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); }}>
              <IconHeart filled={favorite} size={14} />
            </IconButton>
            <IconButton label="Copy" size="xs" surface="overlay"><IconCopy size={14} /></IconButton>
            <IconButton label="Move to Trash" size="xs" surface="overlay"><IconTrash size={14} /></IconButton>
          </>
        }
      />
      <MediaTile className="docs-media-tile" name="Harbour at dusk.mp4" src={covers.midnight} meta="1920 × 1080" duration="2:41" />
      <MediaTile className="docs-media-tile" name="Holidays" kind="folder" meta="128 items" />
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Thumbnail: <MediaTile className="docs-media-tile" name="Orchard.png" src={covers.orchard} meta="1200 × 1200" />,
    Placeholder: (
      <>
        <MediaTile className="docs-media-tile" name="Untitled.psd" meta="Waiting for a preview" />
        <MediaTile className="docs-media-tile" name="Dune.jpg" meta="4000 × 3000" loading />
      </>
    ),
    Selected: (
      <>
        <MediaTile className="docs-media-tile" name="Neon.png" src={covers.neon} meta="Selected" selected selecting />
        <MediaTile className="docs-media-tile" name="Paper moons.png" src={covers.paper} meta="Not selected" selecting />
      </>
    ),
    'Range preview': (
      <>
        <MediaTile className="docs-media-tile" name="Would be added.png" src={covers.dune} preview="add" selecting />
        <MediaTile className="docs-media-tile" name="Would be removed.png" src={covers.orchard} preview="remove" selected selecting />
      </>
    ),
    Marks: <MediaTile className="docs-media-tile" name="Saved from the web.mp4" src={covers.tidal} favorite duration="12:05" source={site} />,
    'With actions': (
      <MediaTile
        className="docs-media-tile"
        name="Hover or focus me.png"
        src={covers.midnight}
        favorite
        tabIndex={0}
        actions={<IconButton label="Copy" size="xs" surface="overlay"><IconCopy size={14} /></IconButton>}
      />
    ),
    Dimmed: <MediaTile className="docs-media-tile" name="Hidden folder" kind="folder" meta="Hidden" dimmed />,
  },
  variants: {
    Folder: <MediaTile className="docs-media-tile" name="Screenshots" kind="folder" meta="2,431 items" />,
  },
  dos: [
    'Put tiles in a MediaGrid: it owns the focus, the selection and the keyboard.',
    'Load thumbnails only for the tiles on screen, and pass `loading` while one is on its way.',
    'Repeat every quick action in the item\'s context menu.',
  ],
  donts: [
    'Don\'t write over the thumbnail: the name and the meta go under it.',
    'Don\'t show the check only on hover once something is selected: pass `selecting`.',
  ],
};
