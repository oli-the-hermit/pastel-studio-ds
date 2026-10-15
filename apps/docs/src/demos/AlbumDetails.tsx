import React from 'react';
import { AlbumDetails } from '@pastel-studio/react';
import { album } from '../fixtures/music';
import type { ComponentDemo } from './types';

const wide = (node: React.ReactNode) => <div className="docs-gallery-span">{node}</div>;

function Demo() {
  return <AlbumDetails album={album} />;
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Folded: wide(<AlbumDetails album={album} />),
    'Few facts': wide(<AlbumDetails album={{ ...album, description: undefined, label: undefined, releaseDate: undefined, copyright: undefined }} />),
  },
  variants: {},
  dos: [
    'Pass what the catalogue knows; the card leaves out what it doesn\'t.',
  ],
  donts: [
    'Don\'t repeat the facts already in the header, like the artist.',
  ],
};
