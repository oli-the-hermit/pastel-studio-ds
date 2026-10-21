import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ActionRow',
  group: 'Overlays',
  summary: 'The buttons that close a dialog or an inline confirm panel: right-aligned, the main action last.',
  status: 'beta',
  states: [],
  variants: [
    { name: 'Two actions', description: 'Cancel, then the main action.' },
    { name: 'One action', description: 'A single button, e.g. Done.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Order the buttons as they read: Cancel before the main action, so Tab reaches the main action last.',
  ],
  related: ['ConfirmModal', 'FormActions', 'Modal'],
};
