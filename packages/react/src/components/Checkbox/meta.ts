import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Checkbox',
  group: 'Inputs',
  summary: 'A square check box, recessed into the row it sits on: filled a step darker, no outline; checked, the accent with a check.',
  status: 'beta',
  states: [
    { name: 'Unchecked', description: 'A filled square a step darker than its surface (`--ps-checkbox-fill`, the page background by default), no outline.' },
    { name: 'Checked', description: 'The accent with a check in `--ps-on-accent`; it pops a little as it is checked.' },
    { name: 'Read-only', description: '`aria-disabled="true"`: its state comes from elsewhere, it keeps its tooltip and does not react to hover.' },
    { name: 'Disabled', description: '`disabled`: it cannot be changed.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Space', action: 'Checks or unchecks it.' },
  ],
  labels: [],
  aria: [
    'A native `<input type="checkbox">`: name it with a `<label>` or `aria-label`.',
    'Without an outline the box relies on its fill and its place in the row; on a surface where the fill is too close to the row, set `--ps-checkbox-fill` a step further.',
  ],
  related: ['Switch', 'SortableList'],
};
