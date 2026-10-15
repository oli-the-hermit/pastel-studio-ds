import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TrackInfo',
  group: 'Media',
  summary: 'The title of a song over its artist, album and year, sized for a player, a bar or a row.',
  status: 'beta',
  states: [
    { name: 'Full', description: 'Title, then "Artist · Album · Year"; each part ends with an ellipsis when it runs out of room.' },
    { name: 'Explicit', description: '`explicit` adds the explicit mark after the title, named for screen readers.' },
    { name: 'Links', description: '`onArtistClick` and `onAlbumClick` turn those parts into links to their pages.' },
    { name: 'Long title', description: 'In `lg` the title wraps to two lines before it is cut; in `md` and `sm` it stays on one.' },
  ],
  variants: [
    { name: 'lg', description: '`size="lg"`: a player card.' },
    { name: 'md', description: 'The default, a bar.' },
    { name: 'sm', description: '`size="sm"`: a row in a list.' },
    { name: 'Centered', description: '`align="center"` under a centered cover.' },
  ],
  keyboard: [],
  labels: ['explicit'],
  aria: [
    '`headingLevel` makes the title a real heading in a player, so it can be found by heading.',
    'The full title is its tooltip, for when it is cut off.',
  ],
  related: ['CoverArt', 'MediaTime'],
};
