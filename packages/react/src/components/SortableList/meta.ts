import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'SortableList',
  group: 'Layout',
  summary: 'A list of rows that can be dragged into a new order by their grip, or moved with the keyboard: tasks, lists, a queue.',
  status: 'beta',
  states: [
    { name: 'Rows', description: 'Each row starts with a grip, then the content `renderItem` gives it; it hovers one step up.' },
    { name: 'Dragging', description: 'The row being dragged stays in its place, quiet, until it is dropped.' },
    { name: 'Drop target', description: 'The row under the pointer shows an accent line on top: the dragged row lands there.' },
    { name: 'Empty', description: '`empty` is shown instead of the rows when there are none.' },
  ],
  variants: [
    { name: 'Finished rows', description: '`itemClassName` adds a class to a row, e.g. for a finished task the app crosses out.' },
  ],
  keyboard: [
    { keys: 'Alt + ↑', action: 'Moves the row that has focus (or holds the focused control) up one place.' },
    { keys: 'Alt + ↓', action: 'Moves it down one place. Focus stays on the same control.' },
  ],
  labels: ['dragToReorder', 'reorderKeys', 'movedTo'],
  aria: [
    'A `list` of `listitem`s; the keyboard instructions are linked to it with `aria-describedby`.',
    'After a keyboard move, a live region says "Moved to position 3 of 5".',
    'The grip is a mouse handle with a tooltip; keyboard users move rows with Alt and the arrows from any control in the row.',
    '`useSortable` gives the same drag and keys to any markup, like a grid of cards; `moveById` moves an item in an array.',
  ],
  related: ['Menu', 'Card'],
};
