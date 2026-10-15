import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'LikeButton',
  group: 'Media',
  summary: 'A heart that adds a track to Liked and takes it out again.',
  status: 'beta',
  states: [
    { name: 'Not liked', description: 'An outlined heart in the quiet ghost color.' },
    { name: 'Liked', description: 'A filled heart in the phase color; it pops once as it fills.' },
  ],
  variants: [
    { name: 'sm', description: 'The default, for rows and bars.' },
    { name: 'md', description: '`size="md"` in a full player.' },
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Likes or unlikes.' },
  ],
  labels: ['like', 'unlike'],
  aria: [
    'A toggle with `aria-pressed`; its name says what a press does: "Add to Liked" or "Remove from Liked".',
  ],
  related: ['PlayerControl', 'TransportControls'],
};
