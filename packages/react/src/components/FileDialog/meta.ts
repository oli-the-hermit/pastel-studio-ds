import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FileDialog',
  group: 'Files',
  summary: 'The app\'s own open, save and folder dialog, in place of the system\'s, with places, the folder, the name and a type filter.',
  status: 'beta',
  states: [
    { name: 'Places', description: '`recent` and `bookmarks` add their groups to the sidebar; with `onBookmarksChange` the current folder can be bookmarked from the dialog.' },
    { name: 'Type filter', description: '`filters` adds a Type menu beside the name; only matching files show, with their extensions as a hint.' },
  ],
  variants: [
    { name: 'open', description: 'Pick one existing file, or several with `multiple`; the name field shows what is picked and Open is ready once a file is.' },
    { name: 'save', description: 'Type a name, suggested by `defaultName` and selected at first; New folder makes a folder to save into.' },
    { name: 'folder', description: 'Only folders show; the field says which folder will be picked.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'In the content: opens a folder, or picks a file. In the name field: confirms.' },
    { keys: 'Escape', action: 'Cancels the dialog (after clearing a search or the address being typed).' },
    { keys: 'Alt + ← / → / ↑, Backspace', action: 'Back, forward and up a folder.' },
  ],
  labels: ['open', 'save', 'saveAs', 'selectFolder', 'cancel', 'back', 'forward', 'up', 'places', 'folderField', 'fileNameField', 'pickFile', 'pickFiles', 'untitled', 'fileType', 'fileTypeFilter', 'newFolder', 'bookmarkFolder', 'removeBookmark', 'noFolders', 'hiddenItems', 'viewDetails', 'viewTiles', 'viewIcons', 'searchIn', 'filesIn', 'noResultsFor'],
  aria: [
    'A modal `dialog` named by its title; Tab stays inside it and focus returns to what opened it.',
    'First focus: the name when saving (selected, ready to type over), otherwise the folder\'s content.',
    'It reads the tree it is given and never touches a disk: the app lists folders and writes the file.',
  ],
  related: ['FileExplorer', 'Modal', 'FileView'],
};
