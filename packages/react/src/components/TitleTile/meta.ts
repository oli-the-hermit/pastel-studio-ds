import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TitleTile',
  group: 'Media',
  summary: 'A title of a music or video library as a button: a cover, a poster, a frame or a round picture with its name and a quieter line, laid out by TitleGrid.',
  status: 'beta',
  states: [
    { name: 'Picture', description: '`image` fills the shape, cropped to it, with the name and the subtitle under it, each on one line.' },
    { name: 'No picture', description: 'Without `image`, or when it fails to load, `icon` sits centred on a quiet surface, which steps up when hovered.' },
    { name: 'In progress', description: '`progress` from 0 to 1: a thin bar along the picture\'s lower edge. Nothing shows for 0 or when it is left out.' },
    { name: 'Watched', description: '`watched`: a check on the accent at the picture\'s top right.' },
    { name: 'Current', description: '`current`, the title that is playing: an accent ring inside the picture\'s edge and the name in the accent text color.' },
    { name: 'Long text', description: 'A name or a subtitle wider than the tile stays on one line and ends with an ellipsis.' },
  ],
  variants: [
    { name: 'cover', description: 'The default, 1:1: albums, playlists, songs.' },
    { name: 'poster', description: '`shape="poster"`, 2:3: films and series.' },
    { name: 'wide', description: '`shape="wide"`, 16:9: episodes and videos. Its narrowest is 256px instead of 160px.' },
    { name: 'round', description: '`shape="round"`: a circle with centred text, for artists and people. It shows no progress.' },
    { name: 'In a grid', description: 'TitleGrid lays tiles out in as many columns as fit, each at least as wide as its `shape`\'s narrowest, 16px apart and 24px between rows.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the next tile; each tile is a button.' },
    { keys: 'Enter', action: 'Opens the title.' },
    { keys: 'Space', action: 'Opens the title.' },
  ],
  labels: ['watched'],
  aria: [
    'A native `<button>` named by its title and subtitle; the picture is decorative (`alt=""`).',
    'The watched check is an image named "Watched", so it is part of the name and never only an icon.',
    '`current` sets `aria-current="true"`.',
    'The progress bar is decorative: when how far it has been played matters, say it in the subtitle ("12 min left").',
    'TitleGrid is a `list` and wraps each child in a list item; name it with `aria-label` or `aria-labelledby`.',
  ],
  related: ['MediaTile', 'CoverArt', 'MediaGrid'],
};
