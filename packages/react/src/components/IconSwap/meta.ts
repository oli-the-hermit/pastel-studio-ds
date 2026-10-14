import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'IconSwap',
  group: 'Actions',
  summary: 'Two icons in one place that cross-fade with a small turn when a toggle flips, like play and pause.',
  status: 'beta',
  states: [
    { name: 'Off', description: 'Shows `offIcon`, e.g. play while paused.' },
    { name: 'On', description: 'Shows `onIcon`, e.g. pause while playing.' },
  ],
  variants: [],
  keyboard: [],
  labels: [],
  aria: [
    'Hidden from screen readers (`aria-hidden`): it only draws. The button around it gives the name and the state, with `label` and `pressed` on an `IconButton`.',
    'With reduced motion the icons change at once.',
  ],
  related: ['IconButton', 'Button'],
};
