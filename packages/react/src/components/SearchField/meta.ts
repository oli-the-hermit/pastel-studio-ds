import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'SearchField',
  group: 'Files',
  summary: 'A pill-shaped search field with a search icon and a clear button, for filtering a view or a library.',
  status: 'beta',
  states: [
    { name: 'Empty', description: 'The placeholder says what it searches: "Search Music".' },
    { name: 'Filled', description: 'A clear button appears at the end once there is text.' },
    { name: 'Disabled', description: '`disabled`: nothing to search yet.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Escape', action: 'Clears the text (and only then lets Escape reach a dialog around it).' },
    { keys: 'Enter', action: 'Calls `onSubmit`, for searches that run on demand.' },
  ],
  labels: ['clearSearch'],
  aria: [
    'An `<input type="search">` named by its placeholder.',
    'The icon is decoration; the clear button is named "Clear search".',
  ],
  related: ['Field', 'Toolbar', 'Select'],
};
