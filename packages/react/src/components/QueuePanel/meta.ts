import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'QueuePanel',
  group: 'Layout',
  summary: 'A side panel of selectable, reorderable rows (QueueItem): sessions, task lists, anything chosen from a short queue.',
  status: 'beta',
  states: [
    { name: 'Rows', description: 'Raised rows with a grip; the name owns the first line.' },
    { name: 'Active', description: '`active` fills the selected row with the accent; its details turn to the accent ink.' },
    { name: 'With details', description: '`meta` adds a second line of details; the tools sit at its end.' },
    { name: 'Empty', description: 'No ids: `emptyMessage` shows in place of the rows.' },
  ],
  variants: [
    { name: 'Leading and trailing', description: '`leading` before the name (a "now playing" mark), `trailing` after it (a count).' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between rows and their tools.' },
    { keys: 'Enter / Space', action: 'Selects the focused row.' },
    { keys: 'Alt + ↑ / ↓', action: 'Moves the focused row up or down, when the rows are wired to `useSortable`.' },
  ],
  labels: ['dragToReorder'],
  aria: [
    'Each row is a button with `aria-pressed`: true on the active one.',
    'The tools are named icon buttons; they show on hover and on focus.',
    'The panel title is a heading (`h2`).',
  ],
  related: ['SortableList', 'Card', 'EmptyState'],
};
