import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Checkbox',
  group: 'Inputs',
  summary: 'A square check box, recessed into the row it sits on: filled a step darker, with a thin ring; checked, the accent with a check.',
  status: 'beta',
  states: [
    { name: 'Unchecked', description: 'A filled square a step darker than its surface (`--ps-checkbox-fill`, the page background by default), with a thin ring in `--ps-text-3` that brightens on hover.' },
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
    'Its thin ring in `--ps-text-3` gives the box\'s edge at least 4.8:1 on the page, a card, a row or a panel (WCAG 1.4.11 asks 3:1); the fill alone would be about 1.1:1.',
  ],
  related: ['Switch', 'SortableList'],
};
