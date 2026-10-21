import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ColorSwatchGrid',
  group: 'Inputs',
  summary: 'Round color swatches to pick one from: a radio group laid out in rows.',
  status: 'beta',
  states: [
    { name: 'Selected', description: 'The chosen swatch shows a check in its readable ink and a ring in its own color, a small gap away.' },
    { name: 'Nothing selected', description: '`value` is null or names a color from another grid: no swatch is checked, and the first is the tab stop.' },
  ],
  variants: [
    { name: 'Columns', description: '`columns` sets the swatches per row (default 8); the up and down arrows move by a row.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Enters the grid at the selected swatch (or the first), and leaves it.' },
    { keys: '← → ↑ ↓', action: 'Moves to the next swatch and selects it.' },
    { keys: 'Home / End', action: 'Jumps to the first or the last swatch.' },
  ],
  labels: [],
  aria: [
    'A `radiogroup` named by `ariaLabel`; each swatch is a `radio` with `aria-checked` and the color\'s name, also its tooltip.',
    'One tab stop for the whole grid.',
    'Pass an `onColor` that reads on each fill: the check is drawn in it.',
  ],
  related: ['AppearancePanel', 'SegmentedControl'],
};
