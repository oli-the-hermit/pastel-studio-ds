import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Tabs',
  group: 'Layout',
  summary: 'Tabs in a folder look: the active tab and its panel share a color and read as one piece. For a dialog with sections, such as Settings.',
  status: 'beta',
  states: [
    { name: 'First tab active', description: 'The panel\'s top-left corner is square, so the tab\'s edge runs straight down into the panel\'s.' },
    { name: 'Another tab active', description: 'The tab\'s bottom corners curve outward into the panel on both sides. On hover an inactive tab gets a fill halfway between the dialog and the panel, so it never looks open.' },
  ],
  variants: [
    { name: 'Text only', description: 'Each tab is its label.' },
    { name: 'With icons', description: '`icon` puts a small icon before a tab\'s label.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the active tab (one stop for the list), then into the panel.' },
    { keys: '← →', action: 'Moves to the next tab and opens it; past either end it wraps around.' },
    { keys: 'Home / End', action: 'Opens the first or the last tab.' },
  ],
  labels: [],
  aria: [
    'A `tablist` named by `ariaLabel`; each `tab` has `aria-selected` and `aria-controls`, the panel is a `tabpanel` named by its tab.',
    'Tabs open as focus moves (automatic activation): keep panels quick to show.',
    'The panel takes focus with Tab, so a panel without fields can still be scrolled with the keyboard.',
  ],
  related: ['SegmentedControl', 'Modal', 'AccountMenu'],
};
