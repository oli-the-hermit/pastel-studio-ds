import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'StatusBar',
  group: 'Files',
  summary: 'A quiet line under a view: counts on the left, view controls on the right.',
  status: 'beta',
  states: [
    { name: 'Counts', description: 'How many items, and how many are selected with their size.' },
    { name: 'With end', description: '`end` holds a view switch or a zoom at the right.' },
    { name: 'Counts by kind', description: '`StatusCount`: an icon and a number for each kind the view holds (videos, images, other files), in place of one total.' },
  ],
  variants: [],
  keyboard: [],
  labels: [],
  aria: [
    'The counts are a `role="status"`, so a screen reader reads the new count politely after a selection or a filter.',
    'Long text ends with "…"; the controls at the end never shrink.',
    'A `StatusCount` hides its icon and its bare number from screen readers and reads its `label` ("12 videos") instead; the same words show as its tooltip.',
  ],
  related: ['FileView', 'Toolbar'],
};
