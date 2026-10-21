import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'NavRail',
  group: 'Layout',
  summary: 'The app\'s navigation drawer: a floating panel on the page\'s card surface, as a rail of icons or expanded with labels.',
  status: 'beta',
  states: [
    { name: 'Current page', description: 'The current item sits in an accent pill. The pill is its own layer, named `ps-nav-pill` for a view transition, so it can slide to the next page\'s item.' },
    { name: 'With badge', description: '`badge` puts a count on the icon (hidden at 0); `badgeLabel` says what it counts.' },
    { name: 'With toggle', description: '`onToggle` adds the expand and collapse button to the head, beside the mark; expanded, it reads as an accent side-panel icon.' },
    { name: 'Without a mark', description: '`brand` is optional: leave it out when the app carries its mark elsewhere, such as an app bar, and the head holds only the toggle.' },
  ],
  variants: [
    { name: 'rail', description: 'Icons only, each with a tooltip; the labels stay for screen readers.' },
    { name: 'expanded', description: 'Labels beside the icons, the app\'s name as an overline at the top. From 1024px wide (`useDrawer` decides).' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the toggle, the items and the footer.' },
    { keys: 'Enter / Space', action: 'Opens the page, or expands and collapses the drawer from the toggle.' },
  ],
  labels: ['expandMenu', 'collapseMenu'],
  aria: [
    'A `<nav>` named by `label`; the current item has `aria-current="page"`.',
    'The toggle says "Expand menu" or "Collapse menu" and has `aria-expanded`.',
    '`useDrawer()` remembers the choice on the device and keeps the rail under 1024px; each item carries `data-key` for tours.',
  ],
  related: ['AppShell'],
};
