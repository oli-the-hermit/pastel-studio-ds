import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MediaTile',
  group: 'Media',
  summary: 'One item of a media grid: a square thumbnail with its name and a line of meta, a favorite and duration mark, a check for multiple selection and quick actions.',
  status: 'beta',
  states: [
    { name: 'Thumbnail', description: 'The image, cropped to a square, with the name and meta under it.' },
    { name: 'Placeholder', description: 'No thumbnail yet, or one that fails: the file type\'s large icon. `loading` pulses the square while it comes in.' },
    { name: 'Selected', description: '`selected`: an accent ring, a filled check and the name in the accent text color. `selecting` shows the empty check on every tile while anything is selected.' },
    { name: 'Range preview', description: '`preview` dashes the ring while Shift is held: in the accent for tiles a Shift + click would add, quiet for those it would remove.' },
    { name: 'Marks', description: '`favorite`, `duration` (a video\'s length) and `source` (a site\'s icon) sit in the thumbnail\'s corners on the media dock.' },
    { name: 'With actions', description: '`actions` appear over the thumbnail on hover and keyboard focus; the favorite mark steps aside for them.' },
    { name: 'Dimmed', description: '`dimmed`: hidden or unavailable items, in the quiet text color.' },
  ],
  variants: [
    { name: 'Folder', description: '`kind="folder"`: a folder in place of the thumbnail and no check; the meta line can count its items.' },
    { name: 'Overlay caption', description: '`caption="overlay"`: the name and meta over the thumbnail\'s lower edge on the media dock, shown on hover and focus, so the tile is all picture at rest (a folder keeps its name showing).' },
  ],
  keyboard: [],
  labels: ['favorite'],
  aria: [
    'The tile only draws: put it in a MediaGrid, whose cells are the options of a listbox and carry the selection and the focus.',
    'The check is decorative (`aria-hidden`); the cell\'s `aria-selected` says whether the item is selected.',
    'The favorite mark is an image named "Favorite", so the state is never only an icon.',
    'Quick actions also need a place in the item\'s context menu: hover is never the only way to an action.',
  ],
  related: ['MediaGrid', 'CoverArt', 'FileIcon'],
};
