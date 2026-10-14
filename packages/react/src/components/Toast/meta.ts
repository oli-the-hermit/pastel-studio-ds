import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Toast',
  group: 'Feedback',
  summary: 'A short message at the top right that confirms or warns about something that just happened, then leaves on its own.',
  status: 'beta',
  states: [
    { name: 'Long message', description: 'A message wider than the toast wraps onto more lines; the icon stays centered beside it.' },
  ],
  variants: [
    { name: 'success', description: 'The default tone: something was done, e.g. "List saved".' },
    { name: 'info', description: '`tone="info"`: news that needs no action.' },
    { name: 'warning', description: '`tone="warning"`: done, but with something to check.' },
    { name: 'error', description: '`tone="error"`: it did not work. It interrupts a screen reader.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    '`ToastRegion` is a polite live region (`role="status"`): a screen reader reads each new toast when it is free.',
    'An error toast is an `alert`, so it is read at once.',
    'Each tone has its own icon as well as its own color.',
    'A toast cannot be focused and leaves by itself, so never put a button or the only copy of important information in one.',
    '`useToasts()` gives the list for the region and `showToast(message, tone)`. A toast stays 3.5 seconds, then slides out.',
  ],
  related: ['ProgressBar', 'Modal'],
};
