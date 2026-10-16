import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FileIcon',
  group: 'Files',
  summary: 'The icon of a file type, one glyph per category, with folders solid in the accent.',
  status: 'beta',
  states: [
    { name: 'Categories', description: 'Images, video, audio, text, documents, spreadsheets, code, archives, apps, fonts and 3D scenes each have a glyph; anything else is a plain file.' },
    { name: 'Folders and drives', description: 'Folders are solid in the accent text color so they read apart from files at a glance; drives are in the main text color.' },
  ],
  variants: [
    { name: 'sm', description: '16px, for a tree or the list view.' },
    { name: 'md', description: '20px, the default, for rows.' },
    { name: 'lg', description: 'On a 40px tile, for the tiles view.' },
    { name: 'xl', description: 'On a 64px tile with the extension under the glyph, for the icons view and the details pane.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'Decoration (`aria-hidden`): the name and type next to it say what the file is.',
    'The category comes from the extension, not from the file\'s content: it never reads a file.',
  ],
  related: ['FileView', 'DetailsPane'],
};
