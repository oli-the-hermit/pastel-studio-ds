import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'CoverArt',
  group: 'Media',
  summary: 'Album or track art in its rounded square, with a placeholder, a loading pulse, an optional progress ring and a corner mark.',
  status: 'beta',
  states: [
    { name: 'Image', description: 'The art, cropped to a square.' },
    { name: 'Placeholder', description: 'No image, or one that fails to load: a music note on a raised surface.' },
    { name: 'Loading', description: '`loading`: the surface pulses while the image comes in.' },
    { name: 'With progress', description: '`progress` (0–100) draws a ring around the cover, like the timer of a round mini player.' },
    { name: 'With badge', description: '`badge` puts a small mark in the corner; on a small cover it fills the art.' },
  ],
  variants: [
    { name: 'Sizes', description: '`xs` 40px, `sm` 56px, `md` 120px, `lg` 232px, or `fluid` (the default) to fill the width. Smaller covers have smaller corners.' },
    { name: 'Round', description: '`shape="round"` for artists and a portrait mini player.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Give `alt` a description when the art stands alone; leave it empty when the title is right beside it.',
    'The placeholder takes the same `alt`, so the name stays when the image is missing.',
  ],
  related: ['TrackInfo', 'Equalizer'],
};
