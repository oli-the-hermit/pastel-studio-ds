import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MenuBar',
  group: 'Overlays',
  summary: "A row of menus at the top of an app or a panel, like File, Edit and Help.",
  status: 'beta',
  states: [
    { name: 'Closed', description: 'Triggers look like text buttons, with a fill on hover.' },
    { name: 'Open', description: 'The open menu\'s trigger keeps its fill. Pointing at another trigger switches to that menu.' },
  ],
  variants: [
    { name: 'App menu first', description: '`brand` on the first menu, with the app\'s mark as `icon`: it holds the app\'s file actions and reads as the title.' },
    { name: 'Icon only', description: '`iconOnly` shows just the icon; the label becomes its name and tooltip.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Enters the bar on one trigger; the others are reached with the arrow keys.' },
    { keys: '→ / ←', action: 'Moves to the next or previous trigger. With a menu open, opens that menu instead.' },
    { keys: 'Home / End', action: 'Moves to the first or last trigger.' },
    { keys: '↓, Enter, Space', action: 'Opens the menu and focuses its first item.' },
    { keys: '↓ / ↑', action: 'In an open menu, moves between items.' },
    { keys: 'Escape', action: 'Closes the menu and returns focus to its trigger.' },
  ],
  labels: ['menuBar', 'back'],
  aria: [
    'The bar is a `menubar`, named "Menu bar"; its triggers are `menuitem`s with `aria-haspopup="menu"` and `aria-expanded`.',
    'Only one trigger is in the tab order (roving tabindex).',
    'Each open menu is a `menu` named after its trigger. While it is open, `isBlockingOverlayOpen()` is true.',
  ],
  related: ['Menu', 'ContextMenu', 'TopBar'],
};
