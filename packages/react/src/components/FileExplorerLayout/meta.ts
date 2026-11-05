import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FileExplorerLayout',
  group: 'Files',
  summary: 'The file explorer\'s layout without its state: navigation, address and search over a tree, the content with its commands and status, and the details, for an explorer whose data the app owns.',
  status: 'beta',
  states: [
    { name: 'Details open', description: '`detailsOpen` with `details`: a third card at the end. Under 1080px it steps aside.' },
    { name: 'Without a tree', description: 'No `tree`: the content takes its place, as on a page of search results or a feed.' },
    { name: 'Folded commands', description: 'When the commands don\'t fit on one line, their collapsible buttons (`buttonClass({ collapsible: true })`) show only their icons, and come back when there is room.' },
  ],
  variants: [
    { name: 'Wide', description: 'From 1080px: tree, content and details as three tonal cards.' },
    { name: 'Medium', description: 'From 720px: the details card steps aside first.' },
    { name: 'Narrow', description: 'Under 720px: only the content, with the address on its own line.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between the navigation toolbar, the address, the search, the tree, the commands and the content.' },
    { keys: '← / →', action: 'Inside each toolbar, from one button to the next.' },
  ],
  labels: ['navigation', 'navigationPane', 'commands'],
  aria: [
    'The tree is a `<nav>` named "Navigation pane"; the content a `<section>` named by `contentLabel`; the navigation and the commands are toolbars.',
    'The details card is a plain box: give its content a landmark of its own, as DetailsPane does.',
  ],
  related: ['FileExplorer', 'TreeView', 'MediaGrid', 'FileView', 'AddressBar', 'StatusBar'],
};
