import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Select',
  group: 'Inputs',
  summary: 'One choice from a list, in a field-shaped trigger; it can search the options, show recent ones first, and create a new one.',
  status: 'beta',
  states: [
    { name: 'Placeholder', description: 'Nothing chosen yet: the placeholder in the tertiary color.' },
    { name: 'Chosen', description: 'The chosen option\'s label, and its icon if it has one.' },
    { name: 'Open', description: 'The options below the trigger; the chosen one is tinted and checked, the arrow keys move a highlight. With more than 8 options (or `searchable`) a search box filters them; `recent` lists up to three recent ones first; `createOption` adds a last row that creates a new one.' },
    { name: 'Disabled', description: '`disabled`: the value in the tertiary color; it does not open.' },
  ],
  variants: [
    { name: 'field', description: 'The default, a form field.' },
    { name: 'header', description: '`variant="header"`: a title-size pill, for picking what a panel shows.' },
    { name: 'With addon', description: '`valueAddon` puts something right after the value, like a count chip.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'On the trigger, opens it. In the list, picks the highlighted option or starts creating.' },
    { keys: 'Space', action: 'The same as Enter on the trigger; in the search box it types a space.' },
    { keys: '↓ ↑', action: 'Opens it, then moves the highlight, skipping disabled options.' },
    { keys: 'Escape', action: 'Leaves the name field when creating; otherwise closes and returns focus to the trigger.' },
    { keys: 'Tab', action: 'Closes it and moves on.' },
  ],
  labels: ['selectPlaceholder', 'options', 'search', 'searchOptions', 'noMatches', 'create', 'newItemName'],
  aria: [
    'The trigger is a `combobox` that controls a `listbox` of `option`s; the chosen one has `aria-selected`.',
    'Focus stays on the trigger (or the search box); `aria-activedescendant` tells a screen reader which option the arrow keys are on.',
    'Name it with a Field label (pass the Select\'s `id` to the Field\'s `htmlFor`) or with `ariaLabel`.',
    '`name` adds a hidden input, so a native form submits the value.',
  ],
  related: ['Field', 'SegmentedControl', 'Menu'],
};
