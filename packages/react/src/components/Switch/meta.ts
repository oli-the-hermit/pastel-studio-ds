import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Switch',
  group: 'Inputs',
  summary: 'A settings row with an on/off toggle, for a choice that takes effect at once.',
  status: 'beta',
  states: [
    { name: 'Off', description: 'A grey track with the knob on the left.' },
    { name: 'On', description: 'The accent track with the knob on the right.' },
    { name: 'With hint', description: '`hint` adds a muted line under the label that says what the setting does.' },
    { name: 'Disabled', description: '`disabled`: it cannot be changed or focused. It looks the same as Focus Space\'s, so say why nearby.' },
  ],
  variants: [
    { name: 'Row', description: 'The default: a tonal settings row, the label on the left and the switch on the right.' },
    { name: 'Inline', description: '`layout="inline"`: a smaller switch with its label beside it and no row, for a toolbar or a dialog\'s footer.' },
  ],
  keyboard: [
    { keys: 'Space', action: 'Turns it on or off.' },
  ],
  labels: [],
  aria: [
    'A checkbox with `role="switch"`, so a screen reader says "on" or "off".',
    'The row is its `<label>`: the label names it and a click anywhere on the row toggles it.',
    'The change applies at once; for a choice that waits for Save, use a checkbox.',
  ],
  related: ['SegmentedControl', 'Field'],
};
