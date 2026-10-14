import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Chip',
  group: 'Feedback',
  summary: 'A small read-only label for a count, a tag or a short status, e.g. "3 tasks left".',
  status: 'beta',
  states: [
    { name: 'Long text', description: 'Text wider than its limit stays on one line and ends with an ellipsis.' },
  ],
  variants: [
    { name: 'default', description: 'Quiet: a raised surface and secondary text, for tags and meta.' },
    { name: 'accent', description: '`tone="accent"`: the accent container, for the one count or status that matters on a card.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Plain text with no role: it cannot be pressed or focused.',
    'When the text may be cut off, pass `title` with the whole of it.',
  ],
  related: ['Card'],
};
