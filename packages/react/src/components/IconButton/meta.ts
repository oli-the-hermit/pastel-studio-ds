import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'IconButton',
  group: 'Actions',
  summary: 'A round button that shows only an icon, for actions whose meaning is clear without words.',
  status: 'beta',
  states: [
    { name: 'Default', description: 'Quiet until hovered: no fill, secondary text color.' },
    { name: 'Disabled', description: 'Set `disabled`. It cannot be pressed or focused.' },
    { name: 'Active', description: '`active` shows it as on, e.g. the toggle of an open panel.' },
    { name: 'Pressed', description: '`pressed` makes it a toggle: it announces on or off and shows the active look when on.' },
  ],
  variants: [
    { name: 'md', description: 'The default size.' },
    { name: 'sm', description: '`size="sm"` for card headers and rows.' },
    { name: 'xs', description: '`size="xs"` for dense rows; its corners are squarer.' },
    { name: 'danger', description: '`tone="danger"`: hovers in the danger color, for delete and remove.' },
    { name: 'On a raised surface', description: '`surface={2}` or `surface={3}`: the hover steps up with it.' },
    { name: 'On video', description: '`surface="overlay"` on the see-through dock over video: a light icon and a see-through hover.' },
    { name: 'On accent', description: '`surface="accent"`: the icon takes the color for text on accent.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'Presses the button.' },
    { keys: 'Space', action: 'Presses the button.' },
  ],
  labels: [],
  aria: [
    '`label` is required: it becomes the accessible name and the tooltip.',
    'With `pressed`, it sets `aria-pressed`, so a screen reader says whether the toggle is on.',
    'Use `active` alone only when something else already says the state, like the panel it opens.',
  ],
  related: ['Button', 'TextButton'],
};
