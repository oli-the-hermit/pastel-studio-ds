import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'WindowFrame',
  group: 'Layout',
  summary: 'A frameless window\'s bare title bar, for a screen with no TopBar (starting up, signing in): it moves the window and holds the window\'s buttons.',
  status: 'beta',
  states: [
    { name: 'Maximized', description: 'The middle window button restores the window; the bar is unchanged.' },
    { name: 'Without window controls', description: 'Only the bar that moves the window, for a shell that draws its buttons elsewhere.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Reaches the window buttons before the screen, as they come first in the page.' },
  ],
  labels: [],
  aria: [
    'The bar has no role or name: it holds no content, only the free space and the window\'s buttons, which are named.',
    '`dragRegionProps` goes on the bar and its free space, not on the buttons, so the window moves from any empty part of the bar.',
    'In `@pastel-studio/desktop`, `DesktopWindowFrame` wires it to the Tauri window and leaves the screen alone in a browser.',
  ],
  related: ['TopBar', 'WindowControls', 'AppShell'],
};
