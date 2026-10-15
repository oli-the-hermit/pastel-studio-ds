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
    { name: 'Padding', description: '`padding="sm"` (16px) for small cards, `padding="none"` for content that brings its own, like a list.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'The card itself has no role; it is a visual group.',
    'Both header titles are `h2` headings, so a screen reader can jump between cards and panels. `titleId` on PanelHeader lets the card be named by its heading.',
    '`as="aside"`, `"section"` or `"article"` make the card a landmark or a self-contained item; give a landmark a name with `aria-labelledby`.',
    'Icon buttons in `actions` need their own `label`.',
  ],
  related: ['Chip', 'IconButton', 'Button'],
};
