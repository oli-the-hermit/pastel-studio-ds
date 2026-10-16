import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'DetailsPane',
  group: 'Files',
  summary: 'A side pane with the selected entry\'s icon, name and facts, or how many are selected and their size.',
  status: 'beta',
  states: [
    { name: 'One file', description: 'Its icon with the extension, name, type, size, dates, location and any `meta` facts.' },
    { name: 'Nothing selected', description: 'The open folder: its type and how many items it holds.' },
    { name: 'Several', description: 'How many are selected, in an accent tile, and their total size.' },
    { name: 'Drive', description: 'Capacity and free space, with a used-space meter that turns amber past 75% and red past 90%.' },
  ],
  variants: [],
  keyboard: [],
  labels: ['details', 'fileType', 'fileSize', 'items', 'capacity', 'freeSpace', 'usedSpace', 'modified', 'created', 'location', 'itemsSelected', 'typeFolder', 'typeDrive', 'typeFile', 'typeImage', 'typeVideo', 'typeAudio', 'typeText', 'typeDocument', 'typePdf', 'typeSpreadsheet', 'typePresentation', 'typeCode', 'typeArchive', 'typeApp', 'typeFont', 'typeModel', 'typeOther'],
  aria: [
    'An `<aside>` named "Details"; the name is a heading and the facts a description list.',
    'Put the actions an app offers for the selection in `actions`: they follow the facts in reading order.',
  ],
  related: ['FileView', 'FileIcon'],
};
