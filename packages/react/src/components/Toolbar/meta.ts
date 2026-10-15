import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Toolbar',
  group: 'Files',
  summary: 'A row of commands in groups with dividers: a file browser\'s command bar, an editor\'s tools.',
  status: 'beta',
  states: [
    { name: 'Some unavailable', description: 'Commands that don\'t apply, such as Delete with nothing selected, are disabled and skipped by ← and →.' },
  ],
  variants: [
    { name: 'Groups', description: '`ToolbarGroup` packs related commands closer; `ToolbarDivider` draws a thin line between groups.' },
    { name: 'With spacer', description: '`ToolbarSpacer` pushes what follows, such as a search field or a view switch, to the end.' },
  ],
  keyboard: [
    { keys: '← / →', action: 'Moves between its enabled buttons, wrapping at the ends. A search field inside keeps its arrows for the text.' },
    { keys: 'Tab', action: 'Moves through its controls and on to the next part of the page.' },
  ],
  labels: [],
  aria: [
    'A `role="toolbar"` named by `label`, e.g. "File commands".',
    'Dividers are `role="separator"` with a vertical orientation.',
    'It wraps rather than scrolls, so no command is ever out of reach.',
  ],
  related: ['IconButton', 'SearchField', 'AddressBar'],
};
