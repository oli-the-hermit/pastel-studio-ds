import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Combobox',
  group: 'Inputs',
  summary: 'A text field that suggests as you type, and offers what was used recently while it\'s empty: a path, a place, a name.',
  status: 'beta',
  states: [
    { name: 'Empty', description: 'Its placeholder shows an example of what to type; it goes with the first character and comes back when the field is empty again.' },
    { name: 'Recent', description: 'Empty and clicked (or ↓): the list offers what was used last. Focus alone, from Tab or a dialog opening, leaves it closed; `openOnFocus` opens it on focus too.' },
    { name: 'Suggesting', description: 'The list follows the text, in groups, with the highlighted suggestion filled.' },
    { name: 'Disabled', description: 'Dimmed; it can\'t be typed in.' },
  ],
  variants: [
    { name: 'field', description: 'The rounded box of TextInput, for a form; it can hold a button at its end.' },
    { name: 'search', description: 'The pill of SearchField, with its search icon and clear button.' },
  ],
  keyboard: [
    { keys: '↓ / ↑', action: 'Opens the list (also with Alt), then moves through the suggestions.' },
    { keys: 'Enter', action: 'Picks the highlighted suggestion; with none highlighted, uses the text as typed.' },
    { keys: 'Tab', action: 'Fills the field with the highlighted suggestion and stays in it, to keep typing (a path\'s next folder).' },
    { keys: 'Escape', action: 'Closes the list; with the list closed, clears the text. Neither reaches a dialog around it.' },
  ],
  labels: ['suggestions', 'clearSearch', 'loading'],
  aria: [
    'The input is a `combobox` with `aria-autocomplete="list"`, `aria-expanded` and `aria-controls` pointing at a `listbox`; the highlighted `option` is its `aria-activedescendant`, so focus never leaves the text.',
    'Groups are `group`s named by their heading. When the empty field offers recent items, a polite live region says so.',
    'Its name comes from a Field label (`id`/`htmlFor`), or `ariaLabel`, or the placeholder.',
    'Suggestions come from `suggestions`, from `loadSuggestions` (debounced; a stale answer is dropped), or both.',
  ],
  related: ['SearchField', 'Field', 'Select', 'Popover'],
};
