import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Card',
  group: 'Layout',
  summary: 'A tonal surface that groups related content, with a large header for main cards and a compact one for side panels.',
  status: 'beta',
  states: [
    { name: 'Long title', description: 'A title wider than the card stays on one line and ends with an ellipsis; `titleTooltip` shows it whole.' },
  ],
  variants: [
    { name: 'CardHeader', description: 'A title with an optional overline above it, an addon beside it, a subtitle row under it, and actions on the right.' },
    { name: 'PanelHeader', description: 'A compact uppercase label with one optional action, for side panels.' },
    { name: 'Plain', description: 'A card with content only: the surface and the spacing, no header.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'The card itself has no role; it is a visual group.',
    'The `CardHeader` title is an `h2`, so a screen reader can jump between cards. The panel header label is plain text.',
    'Icon buttons in `actions` need their own `label`.',
  ],
  related: ['Chip', 'IconButton', 'Button'],
};
