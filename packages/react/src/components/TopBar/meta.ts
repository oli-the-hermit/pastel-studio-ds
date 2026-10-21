import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TopBar',
  group: 'Layout',
  summary: 'The bar above the page: its title, a status, the tools and, in a frameless window, the window\'s buttons.',
  status: 'beta',
  states: [
    { name: 'With status', description: '`status` goes beside the title: a timer, or what is playing.' },
    { name: 'With window controls', description: '`windowControls` adds the frameless window\'s buttons after the tools and tightens the right padding to sit near the corner.' },
    { name: 'Long title', description: 'A title too long for the bar is cut with an ellipsis; the free space keeps the tools in place.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the status, the tools and the window buttons, in that order.' },
  ],
  labels: [],
  aria: [
    'A `<header>` with the page title as its `h1`: one per page.',
    '`dragRegionProps` goes on the bar, the title and the free space, so the window can be moved from any empty part of the bar; the buttons are not part of it.',
    'Give every tool an accessible name (IconButton requires `label`).',
  ],
  related: ['AppShell', 'WindowControls', 'IconButton'],
};
