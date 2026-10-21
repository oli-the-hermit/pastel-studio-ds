import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'StatusChip',
  group: 'Feedback',
  summary: 'A pill in the top bar that shows a live status: a dot, a label, an optional value and a small action.',
  status: 'beta',
  states: [
    { name: 'Idle', description: '`tone="idle"`: a grey dot; nothing is going on.' },
    { name: 'Live', description: '`tone="live"`: the dot pulses in the accent, e.g. a timer running or music playing.' },
    { name: 'Paused', description: '`tone="paused"`: an amber dot, still.' },
    { name: 'With value and action', description: '`value` adds a live value (a countdown, the time played) and `action` a round button, e.g. play or pause.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the chip, then to its action.' },
    { keys: 'Enter / Space', action: 'Opens what the chip shows, or runs the action.' },
  ],
  labels: [],
  aria: [
    'The chip is a button whose text is the label and the value; `openTitle` is its tooltip.',
    'The action is a separate button named by `action.label`.',
    'The dot is decoration: the label says the status in words.',
    'A tone of the app\'s own: set `--ps-status-dot` and `--ps-status-value` (and `--ps-status-pulse: ps-status-chip-pulse` to pulse) on a class passed in `className`.',
  ],
  related: ['TopBar', 'Chip'],
};
