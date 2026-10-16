import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AppLayout',
  group: 'Layout',
  summary: 'The app\'s shell: an app bar across the top, the drawer, the page and a side panel as floating panels, and a bottom bar.',
  status: 'beta',
  states: [
    { name: 'Side panel open', description: '`aside` with `asideOpen`: a third column that slides in. Under 1024px wide it floats over the end of the page, raised.' },
  ],
  variants: [
    { name: 'Drawer and page', description: '`nav`, `topBar` and the page: Focus Space\'s shell.' },
    { name: 'With app bar', description: '`appBar` runs edge to edge above everything: a title bar or a File, Edit, View menu row.' },
    { name: 'With bottom bar', description: '`bottomBar` runs across the bottom, under the drawer: a now-playing bar.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'The page is the `<main>` landmark; give the drawer and bars their own landmarks (NavRail is a `<nav>`).',
    'Only the page scrolls; the bars and the drawer stay put.',
    'It measures itself, not the screen, so it fits a window inside a page as well as the whole window.',
  ],
  related: ['NavRail', 'NowPlayingBar'],
};
