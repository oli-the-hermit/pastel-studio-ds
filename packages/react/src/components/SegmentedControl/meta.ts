import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'SegmentedControl',
  group: 'Inputs',
  summary: 'A row of two to five pill options, one always selected: a view, a range, a theme.',
  status: 'beta',
  states: [
    { name: 'Selected', description: 'The chosen option is filled with the accent; the others are quiet until hovered.' },
    { name: 'Nothing selected', description: 'A `value` that matches no option leaves all of them quiet; the first one takes the tab stop.' },
  ],
  variants: [
    { name: 'md', description: 'The default, for page toolbars.' },
    { name: 'lg', description: '`size="lg"`: taller, with larger text, for settings.' },
    { name: 'On a card', description: '`surface={1}` in a card or a dialog: the track steps up with it.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves into the group, to the selected option, and out again.' },
    { keys: '← →', action: 'Moves to the previous or next option and selects it.' },
    { keys: '↑ ↓', action: 'The same as ← and →.' },
    { keys: 'Home', action: 'Selects the first option.' },
    { keys: 'End', action: 'Selects the last option.' },
  ],
  labels: [],
  aria: [
    'A `radiogroup` named by `ariaLabel`; each option is a `radio` with `aria-checked`.',
    'One tab stop for the whole group, as for native radio buttons.',
  ],
  related: ['Switch', 'Select'],
};
