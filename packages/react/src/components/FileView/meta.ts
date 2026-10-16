import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FileView',
  group: 'Files',
  summary: 'A folder\'s content in four views, details, list, tiles and icons, with a desktop\'s selection and keyboard.',
  status: 'beta',
  states: [
    { name: 'Selected', description: 'Selected entries take the accent container; Ctrl+click adds one, Shift+click a range.' },
    { name: 'Sorted', description: 'With `onSortChange`, the details columns sort; the sorted one shows an arrow. Folders always come first.' },
    { name: 'Renaming', description: '`renamingId` puts a text field in place of the name, with the name selected up to its extension.' },
    { name: 'Search results', description: '`locationOf` adds a Location column (details) or line (tiles) saying where each result lives.' },
    { name: 'Unavailable and hidden', description: '`isDisabled` entries and hidden files fade to the quietest text color; unavailable ones can\'t be opened.' },
    { name: 'Empty', description: '"This folder is empty.", or `emptyText` such as "No results for…".' },
  ],
  variants: [
    { name: 'details', description: 'Rows with name, date modified, type and size. Narrower than 560px it keeps the name and size.' },
    { name: 'list', description: 'Dense rows in as many columns as fit.' },
    { name: 'tiles', description: 'Cards with the type and size; drives show a used-space meter that turns amber past 75% and red past 90%.' },
    { name: 'icons', description: 'A grid of large icons with the extension; long names wrap to two lines.' },
  ],
  keyboard: [
    { keys: '↑ / ↓ / ← / →', action: 'Moves and selects; in tiles and icons ↑ and ↓ move by row.' },
    { keys: 'Shift + arrows', action: 'Extends the selection. Ctrl + arrows move without selecting.' },
    { keys: 'Space', action: 'Selects the focused entry; Ctrl + Space adds or removes it.' },
    { keys: 'Enter', action: 'Opens the focused entry.' },
    { keys: 'Ctrl + A', action: 'Selects everything.' },
    { keys: 'Escape', action: 'Clears the selection.' },
    { keys: 'F2, Delete, Ctrl + C / X / V', action: 'Asks the app to rename, delete, copy, cut or paste (`onCommand`).' },
    { keys: 'Backspace, Alt + ↑ / ← / →', action: 'Asks the app to go up, back or forward.' },
  ],
  labels: ['fileName', 'dateModified', 'fileType', 'fileSize', 'location', 'folderEmpty', 'sortBy', 'renameItem', 'freeOf', 'driveUsed', 'typeFolder', 'typeDrive', 'typeFile', 'typeImage', 'typeVideo', 'typeAudio', 'typeText', 'typeDocument', 'typePdf', 'typeSpreadsheet', 'typePresentation', 'typeCode', 'typeArchive', 'typeApp', 'typeFont', 'typeModel', 'typeOther'],
  aria: [
    'One `listbox` named by `label` ("Files in Music"), multi-selectable, with one tab stop; entries are `option`s with `aria-selected`.',
    'Column headers are buttons named "Sort by …", pressed while their column sorts.',
    'It never deletes or moves anything itself: commands go to `onCommand` for the app to confirm and carry out.',
  ],
  related: ['FileIcon', 'DetailsPane', 'StatusBar'],
};
