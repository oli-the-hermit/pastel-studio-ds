import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AppShell',
  group: 'Layout',
  summary: 'The app\'s window: a navigation drawer floating at the left, and beside it the top bar over the page. Only the page scrolls.',
  status: 'beta',
  states: [
    { name: 'Side panel open', description: '`aside` with `asideOpen`: a column beside the page. Under 1024px wide it floats over the end of the page, raised.' },
    { name: 'Page change', description: '`AppShellPage` shows the active page only; the others stay mounted and keep their state. The new page slides in.' },
    { name: 'Transparent', description: '`surface="transparent"` leaves the page see-through for a picture drawn behind the window; the top bar and the drawer\'s gutter keep the background.' },
  ],
  variants: [
    { name: 'Drawer and page', description: '`nav`, `topBar` and the page: Focus Space\'s window.' },
    { name: 'With bottom bar', description: '`bottomBar` runs across the column under the page: a now-playing bar.' },
    { name: 'Expanded drawer', description: 'A NavRail with `variant="expanded"` widens the first column; the page gives way.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'The page is the `<main>` landmark; give the drawer and the bar their own landmarks (NavRail is a `<nav>`, TopBar a `<header>`).',
    'Only the page scrolls; the bar and the drawer stay put.',
    'It measures itself, not the screen, so it fits a window inside a page as well as the whole window. Give it a height (`height: 100%` of a parent that has one).',
    'Inactive pages are `display: none`, so they leave the reading order and the tab order.',
  ],
  related: ['NavRail', 'TopBar', 'NowPlayingBar'],
};
