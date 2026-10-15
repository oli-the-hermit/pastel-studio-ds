import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AlbumHeader',
  group: 'Media',
  summary: 'The top of an album or playlist page: big art, the kind, the title, the artist and its facts, then play and the actions.',
  status: 'beta',
  states: [
    { name: 'Not playing', description: 'The play button; the actions the page supports beside it.' },
    { name: 'Playing', description: '`playing`: this album is on, so the button pauses.' },
    { name: 'Saved', description: '`saved`: the heart is filled; it reads "Remove from library".' },
  ],
  variants: [
    { name: 'Album', description: 'The kind, title, artist, year, number of songs and total length.' },
    { name: 'Narrow', description: 'Under 600px wide the art goes on top, at under half the width.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the artist link, play and the actions.' },
  ],
  labels: ['album', 'ep', 'single', 'playlist', 'compilation', 'songOne', 'songOther', 'play', 'pause', 'shuffle', 'saveToLibrary', 'removeFromLibrary', 'download', 'share', 'moreActions'],
  aria: [
    'A `header`; the album title is the page\'s `h1`.',
    'The kind ("Album", "Playlist") and the song count come from the shared words, so they translate.',
  ],
  related: ['AlbumPage', 'AlbumDetails', 'TrackList'],
};
