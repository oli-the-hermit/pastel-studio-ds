import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FileExplorer',
  group: 'Files',
  summary: 'A whole file manager in a desktop layout: navigation, address and search over a folder tree, the folder\'s content and a details pane.',
  status: 'beta',
  states: [
    { name: 'Selection', description: 'Selected entries fill the details pane and enable the commands that act on them; the status bar counts them and their size.' },
    { name: 'Without details pane', description: '`defaultDetailsOpen={false}`; the pane button in the command bar and the View menu bring it back.' },
    { name: 'Read-only', description: 'No `operations`: only browsing, sorting and views remain. Each command shows only when the app gives its operation.' },
  ],
  variants: [
    { name: 'Wide', description: 'From 1080px: tree, content and details as three tonal cards.' },
    { name: 'Medium', description: 'From 720px: the details pane steps aside first.' },
    { name: 'Narrow', description: 'Under 720px: only the content, with the address on its own line. The labelled command buttons fold to icons.' },
  ],
  keyboard: [
    { keys: 'Alt + ← / → / ↑', action: 'Back, forward, up a folder.' },
    { keys: 'F4', action: 'Edits the address.' },
    { keys: 'Shift + F10, right-click', action: 'The menu for the selection, or for the folder on empty space: new, sort by, view.' },
    { keys: 'All of FileView\'s keys', action: 'In the content: selection, F2, Delete, Ctrl + C / X / V.' },
  ],
  labels: ['back', 'forward', 'up', 'refresh', 'navigation', 'navigationPane', 'folders', 'commands', 'newItem', 'textDocument', 'sort', 'sortByMenu', 'ascending', 'descending', 'view', 'viewDetails', 'viewList', 'viewTiles', 'viewIcons', 'hiddenItems', 'detailsPane', 'open', 'pinToQuickAccess', 'unpinFromQuickAccess', 'quickAccess', 'cut', 'copy', 'paste', 'rename', 'share', 'delete', 'searchIn', 'filesIn', 'noResultsFor', 'itemOne', 'itemOther', 'selectedCount'],
  aria: [
    'The tree is a `<nav>` named "Navigation pane"; the content a `<section>` named after the folder; the command bars are toolbars.',
    'Its `labels` reach its parts too (FileView, DetailsPane, AddressBar…), so one object translates the whole explorer.',
    'It never changes files: every command calls the app\'s `operations`, which confirms anything destructive.',
  ],
  related: ['FileView', 'DetailsPane', 'TreeView'],
};
