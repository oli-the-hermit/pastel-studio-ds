import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'WindowControls',
  group: 'Layout',
  summary: 'Minimize, maximize and close for a frameless window, and the WindowButton they are made of. It draws and reports; the app makes the window calls.',
  status: 'beta',
  states: [
    { name: 'Maximized', description: '`maximized` turns the middle button into Restore, with its own icon and name.' },
    { name: 'Pin on', description: 'A `WindowButton` with `pressed` is a toggle that is on (pin, always on top): an accent container, with `aria-pressed`.' },
  ],
  variants: [
    { name: 'md', description: 'The title bar\'s size (40 x 36).' },
    { name: 'sm', description: 'A small window such as a mini player (26 x 26), quieter, for toggles like a pin.' },
    { name: 'Close', description: '`danger` fills the close button red on hover (`md`).' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the buttons.' },
    { keys: 'Enter / Space', action: 'Presses the focused button.' },
  ],
  labels: ['minimize', 'maximize', 'restore', 'close'],
  aria: [
    'The three buttons are a `group`; each has an accessible name and a tooltip.',
    'A toggle `WindowButton` has `aria-pressed`.',
    'Keep it out of the drag region: a drag handle swallows clicks.',
  ],
  related: ['TopBar', 'IconButton'],
};
