import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TreeView',
  group: 'Files',
  summary: 'A navigation tree of folders and places, for a file browser\'s side pane or a dialog\'s sidebar.',
  status: 'beta',
  states: [
    { name: 'Selected', description: 'The open folder has the accent container.' },
    { name: 'Expanded', description: 'An open node shows its children one indent deeper; its chevron turns down.' },
    { name: 'With groups', description: '`heading` and `separator` nodes split places from folders; they aren\'t focusable.' },
  ],
  variants: [
    { name: 'md', description: 'The default rows, for a navigation pane.' },
    { name: 'sm', description: 'Denser rows, for a dialog\'s sidebar.' },
  ],
  keyboard: [
    { keys: '↑ / ↓', action: 'Moves between rows.' },
    { keys: '→', action: 'Opens a closed node, or moves into an open one.' },
    { keys: '←', action: 'Closes an open node, or moves to its parent.' },
    { keys: 'Home / End', action: 'First or last row.' },
    { keys: 'Enter / Space', action: 'Opens that folder (`onSelect`).' },
    { keys: '*', action: 'Opens every sibling of the row.' },
  ],
  labels: [],
  aria: [
    'A `role="tree"` named by `label`, with one tab stop: the selected row, or the first.',
    'Rows are `treeitem`s with `aria-level`, `aria-selected`, and `aria-expanded` when they have children.',
    '`hasChildren` shows a chevron before the children are loaded; load them in `onExpand`.',
  ],
  related: ['AddressBar', 'Toolbar'],
};
