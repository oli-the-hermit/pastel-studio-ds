import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'PlayerControl',
  group: 'Media',
  summary: 'A round transport button for players: play and pause, skip, reset, and quiet toggles beside them.',
  status: 'beta',
  states: [
    { name: 'Default', description: 'A filled round button; its hover steps up one surface.' },
    { name: 'Pressed', description: '`pressed` on a ghost: a toggle that is on takes the phase color and sets `aria-pressed`.' },
    { name: 'Disabled', description: '`disabled`: the icon in the tertiary color; it cannot be pressed.' },
  ],
  variants: [
    { name: 'primary', description: '`variant="primary"`: the big play or pause in the phase color.' },
    { name: 'secondary', description: 'The default: skip, reset, previous, next.' },
    { name: 'ghost', description: '`variant="ghost"`: no fill, for toggles like sound or loop.' },
    { name: 'sm', description: '`size="sm"` for bars and mini players; the primary stays a step bigger than its neighbours.' },
    { name: 'On video', description: '`surface="overlay"` on the see-through dock over video: light ghosts with no fill; the primary keeps the phase color.' },
    { name: 'Retinted', description: 'Set `--ps-player-control-phase` (and `-hover`, `on-phase`, `-text`) on its class for another phase, like a break.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'Presses it.' },
    { keys: 'Space', action: 'Presses it.' },
  ],
  labels: [],
  aria: [
    '`label` is required: it is the accessible name and the tooltip.',
    'A toggle uses `pressed`, so a screen reader hears on or off; play and pause change the `label` instead.',
    'It shrinks a little while pressed, as feedback; reduced motion turns that off.',
  ],
  related: ['IconSwap', 'IconButton'],
};
