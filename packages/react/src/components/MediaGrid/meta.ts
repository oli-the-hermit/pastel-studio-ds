import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MediaGrid',
  group: 'Media',
  summary: 'A scrolling grid of media tiles that draws only the rows on screen, with a desktop\'s selection and keyboard, for folders of any size.',
  status: 'beta',
  states: [
    { name: 'Tiles', description: 'Square tiles of at least the size\'s width, stretched to fill each row, the shell\'s gutter apart.' },
    { name: 'Selection', description: 'The app keeps the selection and passes it in; the grid reports each click, check, Shift + click and arrow with `onSelect(key, mode)`.' },
    { name: 'With header', description: '`header` scrolls above the tiles, e.g. a strip of folders or a banner.' },
    { name: 'Empty', description: 'No items: `empty`, or "Nothing to show here." by default.' },
  ],
  variants: [
    { name: 'Sizes', description: '`size` sets the narrowest tile: `s` 150px, `m` 200px (default), `l` 280px, `xl` 380px.' },
  ],
  keyboard: [
    { keys: '← → ↑ ↓', action: 'Move between tiles by column and row, selecting the one reached' },
    { keys: 'Page Up / Page Down, Home / End', action: 'Move a screen at a time, or to the first or last tile' },
    { keys: 'Shift + arrows', action: 'Extend the selection' },
    { keys: 'Ctrl + arrows, then Space', action: 'Move without selecting, then add or remove the focused tile' },
    { keys: 'Enter', action: 'Open the focused item' },
    { keys: 'Ctrl + A', action: 'Select all' },
    { keys: 'Escape', action: 'Clear the selection' },
    { keys: 'Delete, F2, Ctrl + C / X / V', action: 'Commands for the app: delete, rename, copy, cut, paste' },
    { keys: 'Backspace, Alt + ↑ / ← / →', action: 'Commands for the app: up, back, forward' },
  ],
  labels: ['mediaEmpty'],
  aria: [
    'A listbox with multiple selection; each cell is an option with `aria-selected` and, because only some are drawn, `aria-posinset` and `aria-setsize`.',
    'The caller names the grid with `label`: "Media in Pictures".',
    'One tile is in the tab order (roving focus); it stays drawn while scrolled away, so the focus is never lost.',
  ],
  related: ['MediaTile', 'FileView', 'EmptyState'],
};
