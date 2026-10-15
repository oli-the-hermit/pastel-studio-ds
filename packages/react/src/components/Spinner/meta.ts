import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Spinner',
  group: 'Feedback',
  summary: 'A turning arc for a wait of unknown length: loading, buffering.',
  status: 'beta',
  states: [
    { name: 'Turning', description: 'The accent arc turns over its track. It keeps turning with reduced motion: it is the only sign of the wait.' },
  ],
  variants: [
    { name: 'md', description: 'The default, the size of a small icon button.' },
    { name: 'lg', description: '`size="lg"`: the size of a player control, where a play button waits for the stream.' },
    { name: 'Retinted', description: 'Set `--ps-spinner-arc` or `--ps-spinner-track` on its class for another phase.' },
  ],
  keyboard: [],
  labels: ['loading'],
  aria: [
    'A `status` named "Loading", so a screen reader says it once.',
    'For a wait with a known amount, use a ProgressBar instead.',
  ],
  related: ['ProgressBar', 'PlayerControl'],
};
