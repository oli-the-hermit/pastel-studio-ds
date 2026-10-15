import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MusicPlayer',
  group: 'Media',
  summary: 'A music player card: art, the track and its heart, seek, transport and sound tools. Focus Space\'s timer player, turned to sound.',
  status: 'beta',
  states: [
    { name: 'Paused', description: 'The big play button; everything else ready.' },
    { name: 'Playing', description: 'Pause in place of play; the seek bar moves and the times count.' },
  ],
  variants: [
    { name: 'Stack', description: 'A column: head, art, track, seek, transport, tools. The default when the card is narrower than 620px.' },
    { name: 'Row', description: 'The art beside the controls. The default from 620px wide; `layout` forces either.' },
    { name: 'Side panel', description: 'Under 300px the transport drops its fills and its big play, to fit a panel.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the heart, the seek bar, the transport and the tools.' },
    { keys: '← → on the seek bar', action: 'One second back or forward; Page Up and Page Down jump further.' },
  ],
  labels: ['nowPlaying', 'queue', 'lyrics', 'soundSettings', 'moreActions', 'miniPlayer', 'seek', 'timeOf'],
  aria: [
    'A `section` named "Now playing"; the track title is its `h2`.',
    'The seek bar reads "1:04 of 3:20"; the times beside it are a toggle for the time left.',
    'Each tool shows only when its handler is given: lyrics, queue, mini player, sound settings, more actions.',
  ],
  related: ['NowPlayingBar', 'TransportControls', 'PlayQueue'],
};
