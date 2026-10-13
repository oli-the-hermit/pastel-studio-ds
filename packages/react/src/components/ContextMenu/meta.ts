import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ContextMenu',
  group: 'Overlays',
  summary: 'The menu of a right-click, replacing the browser\'s for a whole app or for one area.',
  status: 'beta',
  states: [
    { name: 'Open', description: 'It opens at the pointer, with the same items a `Menu` shows.' },
    { name: 'With selected text', description: 'When text is selected, a Copy item comes first, since the browser\'s menu is gone.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Shift + F10', action: 'Opens the menu for the focused element, like the Menu key.' },
    { keys: '↓', action: 'Moves to the next item, and from the last to the first.' },
    { keys: '↑', action: 'Moves to the previous item, and from the first to the last.' },
    { keys: 'Home', action: 'Moves to the first item.' },
    { keys: 'End', action: 'Moves to the last item.' },
    { keys: 'Enter', action: 'Picks the focused item.' },
    { keys: 'Escape', action: 'Closes the menu and returns focus to where it was.' },
  ],
  labels: ['copy', 'actions'],
  aria: [
    'The panel is a `menu` named "Actions"; focus moves to its first item when it opens.',
    'Text fields keep the browser\'s menu: it has cut, paste and spelling suggestions.',
    'Everything in a context menu must also be reachable another way, such as a `Menu` on the same row: touch screens have no right-click.',
  ],
  related: ['Menu', 'Popover'],
};
