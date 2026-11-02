import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ListPicker',
  group: 'Inputs',
  summary: 'A searchable list to check items off, anchored to its button: tags or collections for one item or a whole selection, with recent picks first and create-as-you-type.',
  status: 'beta',
  states: [
    { name: 'Open', description: 'A search field over a list of check boxes; recent picks come first under "Recent", then "All".' },
    { name: 'Mixed', description: 'For a selection, an option on some of the items is mixed (a dash); checking it applies it to all.' },
    { name: 'Searching', description: 'The typed text filters the list; when nothing has exactly that name, "Create" offers it.' },
    { name: 'No matches', description: 'Nothing matches and nothing can be created: "No matches".' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Typing', action: 'Filters the list' },
    { keys: '↓ / ↑, Home / End', action: 'Move between the search field and the rows' },
    { keys: 'Space or Enter on a row', action: 'Check or uncheck it' },
    { keys: 'Enter in the search field', action: 'Toggle the only match, or create what was typed when nothing matches' },
    { keys: 'Escape', action: 'Clear the search, then close' },
  ],
  labels: ['noMatches', 'recent', 'allItems', 'createNamed'],
  aria: [
    'A dialog anchored to its button, named by `label`; the rows are a group of native check boxes, so each reads out with its state, including mixed.',
    'The search field\'s placeholder is `label` too, and its accessible name.',
    'It pauses the app\'s keyboard shortcuts while open.',
  ],
  related: ['Select', 'Checkbox', 'Popover', 'SearchField'],
};
