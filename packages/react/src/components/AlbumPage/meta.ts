import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AlbumPage',
  group: 'Media',
  summary: 'An album or playlist page on one card: AlbumHeader, TrackList and AlbumDetails, wired together.',
  status: 'beta',
  states: [
    { name: 'Album', description: 'The header, the numbered tracks, and the details when the album has them.' },
  ],
  variants: [
    { name: 'Playlist', description: '`playlist` adds covers, albums and dates to the rows, and lets them be dragged with `onReorder`.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Its parts keep their own roles: the header with the `h1`, the track list named by the album, the details section.',
  ],
  related: ['AlbumHeader', 'TrackList', 'AlbumDetails'],
};
