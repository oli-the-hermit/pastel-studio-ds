import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AlbumDetails',
  group: 'Media',
  summary: 'About an album: its description, its facts and the copyright line, showing only what is known.',
  status: 'beta',
  states: [
    { name: 'Folded', description: 'A long description stops after four lines; "Show more" opens the rest and turns into "Show less".' },
    { name: 'Few facts', description: 'Without a description, label or release date, only the tracks and the length show.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Enter / Space', action: 'On "Show more", opens or folds the description.' },
  ],
  labels: ['aboutAlbum', 'released', 'recordLabel', 'tracks', 'length', 'showMore', 'showLess'],
  aria: [
    'A `section` named by its heading, "About this album".',
    'The facts are a description list; "Show more" says whether it is open with `aria-expanded`.',
  ],
  related: ['AlbumPage', 'AlbumHeader'],
};
