import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Popover',
  group: 'Overlays',
  summary: 'A floating panel anchored to an element or a point: the base of menus, selects and pickers.',
  status: 'beta',
  states: [
    { name: 'Open', description: 'Below its anchor, lined up with its start edge, at least as wide as the anchor.' },
    { name: 'Scrolling', description: 'Taller than the space it has: it stops at the edge of the window and its content scrolls.' },
  ],
  variants: [
    { name: 'Rounder', description: 'Set `--ps-popover-radius` on its class for a popover with pill-shaped content.' },
    { name: 'Tinted', description: 'Set `--ps-popover-bg` on its class for a popover that belongs to a tinted area.' },
  ],
  keyboard: [
    { keys: 'Escape', action: 'Closes it. The key does not reach a modal it opened from.' },
  ],
  labels: [],
  aria: [
    'It has no role of its own: pass `role` and `ariaLabel` for what it holds, like `role="menu"`.',
    'It opens below its anchor and flips above when there is no room below.',
    'It renders at the end of `<body>`, in the document of its anchor, so it is never clipped. It takes the theme of the place it opened from.',
    'It does not move focus. Whatever opens it decides where focus goes, and gives it back on Escape.',
    'A press outside closes it. A popover opened at a point also closes on scroll and resize.',
  ],
  related: ['Menu', 'ContextMenu'],
};
