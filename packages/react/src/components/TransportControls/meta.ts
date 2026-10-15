import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TransportControls',
  group: 'Media',
  summary: 'The row of player buttons around play and pause; it shows only the buttons a player has handlers for.',
  status: 'beta',
  states: [
    { name: 'Paused', description: 'The primary button shows play.' },
    { name: 'Playing', description: 'The primary button shows pause, and is named Pause.' },
    { name: 'Shuffle and repeat on', description: '`shuffle` and `repeat` light their ghost toggles; repeat cycles off, all, one.' },
    { name: 'At the ends', description: '`hasPrevious` or `hasNext` false greys out that button, e.g. on the first or last track.' },
  ],
  variants: [
    { name: 'Music', description: 'Shuffle, previous, play, next and repeat.' },
    { name: 'Movie', description: '`onSkipBack` and `onSkipForward` add the 10-second jumps.' },
    { name: 'Basic', description: 'Only `onPlayPause` and `onStop`, for a plain file.' },
    { name: 'sm', description: '`size="sm"` for bars and mini players.' },
    { name: 'Spread', description: '`layout="spread"` fills the width of a player card.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the buttons.' },
    { keys: 'Enter / Space', action: 'Presses the focused button.' },
  ],
  labels: ['playback', 'play', 'pause', 'previous', 'next', 'stop', 'skipBack', 'skipForward', 'shuffle', 'repeatOff', 'repeatAll', 'repeatOne'],
  aria: [
    'A `group` named "Playback".',
    'Play changes its name to Pause while playing; shuffle and repeat are toggles with `aria-pressed`, and repeat names its mode.',
    'The skip buttons say how far they move: "Back 10 seconds".',
  ],
  related: ['PlayerControl', 'VolumeControl', 'LikeButton'],
};
