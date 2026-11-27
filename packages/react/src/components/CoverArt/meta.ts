import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'CoverArt',
  group: 'Media',
  summary: 'Album or track art in its rounded square, or a mosaic of four covers, with a placeholder, a loading pulse, an optional progress ring and a corner mark.',
  status: 'beta',
  states: [
    { name: 'Image', description: 'The art, cropped to a square.' },
    { name: 'Mosaic', description: '`images` without `src`: four or more distinct covers make a mosaic of the first four, two rows of two; fewer show the first alone. One that fails to load is left out.' },
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
    'A mosaic is one image named by `alt`; its four pictures are decorative.',
  ],
  related: ['TrackInfo', 'Equalizer', 'TitleTile'],
};
