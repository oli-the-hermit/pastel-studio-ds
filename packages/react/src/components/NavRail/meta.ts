import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'NavRail',
  group: 'Layout',
  summary: 'The app\'s navigation drawer: a floating panel on the page\'s card surface, as a rail of icons or expanded with labels, with optional lists of places under the pages.',
  status: 'beta',
  states: [
    { name: 'Current page', description: 'The current item sits in an accent pill. The pill is its own layer, named `ps-nav-pill` for a view transition, so it can slide to the next page\'s item.' },
    { name: 'With badge', description: '`badge` puts a count on the icon (hidden at 0); `badgeLabel` says what it counts.' },
    { name: 'With toggle', description: '`onToggle` makes the mark the expand and collapse button. Expanded, the app\'s name follows the mark, lined up with the labels below.' },
    { name: 'Without a mark', description: '`brand` is optional: leave it out when the app carries its mark elsewhere, such as an app bar, and the head holds a side-panel toggle.' },
    { name: 'With sections', description: '`sections` list places under the pages, such as Quick access or Collections. Expanded, each folds under its heading, with an optional action (New collection); as a rail, each is one button whose menu lists its places. A place\'s `active` marks the one on screen.' },
  ],
  variants: [
    { name: 'rail', description: 'Icons only, each with a tooltip; the labels stay for screen readers.' },
    { name: 'expanded', description: 'Labels beside the icons, the app\'s name after its mark at the top. From 1024px wide (`useDrawer` decides).' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the mark, the items, the sections and the footer.' },
    { keys: 'Enter / Space', action: 'Opens the page or the place, folds a section, or expands and collapses the drawer from the mark.' },
  ],
  labels: ['expandMenu', 'collapseMenu'],
  aria: [
    'A `<nav>` named by `label`; the current item has `aria-current="page"`.',
    'The mark, as the toggle, says "Expand menu" or "Collapse menu" and has `aria-expanded`.',
    'Each section is a group named by its heading; the heading button has `aria-expanded`, and the place on screen has `aria-current="page"`. Places carry `data-key`, so an app can add a context menu or drop targets on the drawer.',
    '`useDrawer()` remembers the choice on the device and keeps the rail under 1024px; each item carries `data-key` for tours.',
  ],
  related: ['AppShell', 'Menu'],
};
