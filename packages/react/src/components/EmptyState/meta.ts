import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'EmptyState',
  group: 'Feedback',
  summary: 'A quiet, centered message where a list or a view has nothing to show yet.',
  status: 'beta',
  states: [
    { name: 'Message', description: 'Muted text, centered, with room around it.' },
    { name: 'With a picture', description: '`icon` and `title`: a large, thin-lined icon as muted as the text, the line that says what is missing, and under it why, or what to do.' },
    { name: 'Loading', description: 'A `Spinner` as the `icon` while the view is read, so the place never claims to be empty before it is known.' },
  ],
  variants: [
    { name: 'md', description: 'The default, for a page or a card.' },
    { name: 'sm', description: '`size="sm"`: less room, for a list inside a panel.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Plain text. When the list empties while someone works, also tell screen readers (a Toast, or a live region).',
    'The picture is decoration (the icons are `aria-hidden`); the title and the text carry the meaning. A Spinner in its place reads "Loading".',
  ],
  related: ['QueuePanel', 'SortableList', 'Spinner', 'MediaGrid'],
};
