import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AddressBar',
  group: 'Files',
  summary: 'A file browser\'s location: breadcrumbs you can click, chevrons that list a folder\'s subfolders, and an editable path.',
  status: 'beta',
  states: [
    { name: 'Breadcrumbs', description: 'Each folder from the root, the current one in bold.' },
    { name: 'Folded', description: 'Past `maxVisible` crumbs the earliest fold into a "…" menu; short of room, crumbs shrink to "…" before the current folder does.' },
    { name: 'Editing', description: 'With `onSubmitPath`, a click in the empty end or F4 turns it into a text field with the whole path selected.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'F4', action: 'Edits the path (with `onSubmitPath`).' },
    { keys: 'Enter', action: 'In the path: goes there. On a crumb: opens that folder.' },
    { keys: 'Escape', action: 'Leaves the path unchanged and shows the crumbs again.' },
  ],
  labels: ['address', 'foldersIn', 'earlierFolders', 'editPath'],
  aria: [
    'A `<nav>` named "Address" holding an ordered list; the current folder has `aria-current="location"`.',
    'Each chevron is a menu button named "Folders in {name}"; the fold is "Earlier folders".',
  ],
  related: ['TreeView', 'Toolbar', 'Menu'],
};
