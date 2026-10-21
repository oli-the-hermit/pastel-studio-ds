import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AccountMenu',
  group: 'Layout',
  summary: 'The signed-in profile at the bottom of the navigation drawer: a menu of views (Profile, Appearance, Settings) that open in a dialog, and the exit.',
  status: 'beta',
  states: [
    { name: 'Expanded', description: 'In the expanded drawer the badge shows the name and a chevron, and takes the drawer\'s width.' },
    { name: 'With picture', description: '`avatar` shows the profile\'s picture; without one, the name\'s initials.' },
    { name: 'Main account', description: '`marker` puts an accent dot on the avatar; its text is the tooltip.' },
    { name: 'Menu open', description: 'The menu lists the profile\'s name and handle, the views, then the exit in the danger look.' },
  ],
  variants: [
    { name: 'Compact', description: '`compact`: the avatar alone, for the rail.' },
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens the menu from the badge.' },
    { keys: '↑ ↓ / Home / End', action: 'Moves through the views and the exit.' },
    { keys: 'Esc', action: 'Closes the menu, or the dialog, and returns focus.' },
  ],
  labels: [],
  aria: [
    'The badge is a button named by the profile\'s name, with `aria-haspopup="menu"` and `aria-expanded`.',
    'The initials and the picture are decoration; the name carries the meaning. The marker\'s text is its tooltip.',
    'A view opens in a Modal titled by the view; the exit is disabled while its promise runs, so it can\'t be pressed twice.',
  ],
  related: ['NavRail', 'Menu', 'Modal', 'AppearancePanel'],
};
