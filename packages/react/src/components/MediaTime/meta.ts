import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MediaTime',
  group: 'Media',
  summary: 'Elapsed, remaining or total time of a song or video, in figures that keep their width as they change.',
  status: 'beta',
  states: [
    { name: 'Toggle', description: '`toggleable`: a click flips to the remaining time and back.' },
  ],
  variants: [
    { name: 'pair', description: 'The default: "1:04 / 3:20".' },
    { name: 'elapsed', description: '`mode="elapsed"`: "1:04".' },
    { name: 'remaining', description: '`mode="remaining"`: "-2:16".' },
    { name: 'total', description: '`mode="total"`: "3:20", e.g. in a track row.' },
    { name: 'sm', description: '`size="sm"` for bars.' },
    { name: 'On video', description: '`surface="overlay"` on the dock over video: light figures.' },
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'On a toggle, flips between the time played and the time left.' },
  ],
  labels: ['showRemainingTime'],
  aria: [
    'A toggle is a button that says what it shows and sets `aria-pressed` while it shows the time left.',
    'Pass `mode` to control it, or leave it out and the toggle keeps its own (`defaultMode`).',
  ],
  related: ['Slider', 'TrackInfo'],
};
