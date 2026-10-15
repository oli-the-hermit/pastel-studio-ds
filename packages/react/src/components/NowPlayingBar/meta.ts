import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'NowPlayingBar',
  group: 'Media',
  summary: 'The player bar along a music app: the track on the left, the transport and seek in the middle, tools on the right.',
  status: 'beta',
  states: [
    { name: 'Playing', description: 'The track, the transport over the seek bar, and the tools.' },
    { name: 'Nothing playing', description: 'No `track`: the cover placeholder and "Nothing playing".' },
  ],
  variants: [
    { name: 'Medium', description: 'Under 900px (as on this page) the side tools and the seek go, and a thin progress line runs across the top. Wider, everything shows.' },
    { name: 'Narrow', description: 'Under 520px only play stays in the middle, and the heart and volume go.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the heart, the transport, the seek bar and the tools.' },
  ],
  labels: ['player', 'nothingPlaying', 'queue', 'lyrics', 'soundSettings', 'miniPlayer', 'fullScreenPlayer', 'seek', 'timeOf'],
  aria: [
    'A `section` named "Player".',
    'What folds away is hidden from everyone; the queue and the play button always stay.',
  ],
  related: ['MusicPlayer', 'PlayQueue', 'VolumeControl'],
};
