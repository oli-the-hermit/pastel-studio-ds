import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TextButton',
  group: 'Actions',
  summary: 'A button that looks like text, for low-emphasis actions next to content.',
  status: 'beta',
  states: [
    { name: 'Default', description: 'Secondary text color, with a fill only on hover.' },
    { name: 'With icon', description: 'An icon inside it sits before the text.' },
  ],
  variants: [
    { name: 'accent', description: '`accent` uses the accent text color, for the one link-like action that matters.' },
    { name: 'xs', description: '`size="xs"`: a tiny link inside dense grids, like "+3 more".' },
    { name: 'On a raised surface', description: '`surface={3}`: the hover steps up with it.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'Presses the button.' },
    { keys: 'Space', action: 'Presses the button.' },
  ],
  aria: [
    'A native `<button>`: its text is its accessible name.',
    'For navigation to another page, use a link instead.',
  ],
  related: ['Button', 'IconButton'],
};
