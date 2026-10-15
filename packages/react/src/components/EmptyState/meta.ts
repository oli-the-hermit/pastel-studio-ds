import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'EmptyState',
  group: 'Feedback',
  summary: 'A quiet, centered message where a list or a view has nothing to show yet.',
  status: 'beta',
  states: [
    { name: 'Message', description: 'Muted text, centered, with room around it.' },
  ],
  variants: [
    { name: 'md', description: 'The default, for a page or a card.' },
    { name: 'sm', description: '`size="sm"`: less room, for a list inside a panel.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Plain text. When the list empties while someone works, also tell screen readers (a Toast, or a live region).',
  ],
  related: ['QueuePanel', 'SortableList'],
};
