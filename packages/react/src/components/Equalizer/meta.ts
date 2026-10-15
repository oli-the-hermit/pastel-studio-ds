import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Equalizer',
  group: 'Media',
  summary: 'Three small bars that bounce while something plays: the "now playing" mark on a row or a cover.',
  status: 'beta',
  states: [
    { name: 'Still', description: 'Three bars of different heights, standing still: playback is paused.' },
    { name: 'Playing', description: '`playing`: the bars bounce out of step. With reduced motion they stand still.' },
  ],
  variants: [
    { name: 'Sizes', description: '`size` in px; it takes the color of the text around it.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Hidden from screen readers: it only draws. Say "Playing" or "Now playing" in words on the row.',
  ],
  related: ['CoverArt', 'PlayerControl'],
};
