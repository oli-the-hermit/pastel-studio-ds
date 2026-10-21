import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'UpdateCard',
  group: 'Feedback',
  summary: 'The card that offers an update in the corner of the window: an icon, the version, a line or a progress bar, and Later and Install.',
  status: 'beta',
  states: [
    { name: 'Offer', description: 'The version, one line about it, Later and Install.' },
    { name: 'Downloading', description: 'Its status and a ProgressBar as children, and no actions while it works.' },
    { name: 'Failed', description: 'What went wrong as a line, and Try again in place of Install.' },
  ],
  variants: [],
  keyboard: [],
  labels: [],
  aria: [
    'An `aside` named by its title (when the title is text).',
    'Put a changing status in a `role="status"` element inside it, so progress is read out politely.',
    'Place it in AppShell\'s `corner`, the bottom-right stack; toasts are at the top right.',
  ],
  related: ['AppShell', 'ProgressBar', 'Toast'],
};
