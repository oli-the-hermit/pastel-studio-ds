import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Button',
  group: 'Actions',
  summary: 'A pill-shaped button for the actions on a screen, from the one main action to quiet secondary ones.',
  status: 'beta',
  states: [
    { name: 'Default', description: 'Ready to press.' },
    { name: 'Disabled', description: 'Set `disabled`. It stays readable but cannot be pressed or focused.' },
    { name: 'With icon', description: 'A leading `icon` before the text.' },
    { name: 'Trailing icon', description: 'A `trailingIcon` after the text, e.g. a chevron on a button that opens a menu.' },
    { name: 'Block', description: '`block` fills the width of its container.' },
    { name: 'Collapsible', description: '`collapsible` shows only the leading icon on screens up to 600px wide.' },
  ],
  variants: [
    { name: 'secondary', description: 'The default: neutral, one step above the surface.' },
    { name: 'primary', description: 'The one main action of a surface.' },
    { name: 'tonal', description: 'A softer accent, for a second action that still matters.' },
    { name: 'danger', description: 'Deletes or discards something.' },
    { name: 'lg', description: '`size="lg"`: the one call to action on a card.' },
    { name: 'sm', description: '`size="sm"` for toolbars and dense rows.' },
    { name: 'xs', description: '`size="xs"` for compact cards: taller than a chip, smaller than a title.' },
    { name: 'On the page', description: '`surface={0}`: the fill steps down to stay one step above the page.' },
    { name: 'On a raised surface', description: '`surface={2}` or `surface={3}`: the fill steps up with it.' },
    { name: 'On accent', description: '`surface="accent"`: a primary button inverts, so it still stands out.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'Presses the button.' },
    { keys: 'Space', action: 'Presses the button.' },
  ],
  labels: [],
  aria: [
    'A native `<button>`: its text is its accessible name.',
    'It is `type="button"` unless you set `type="submit"`.',
    'With `collapsible`, give it an `aria-label` and a `title`: on phones the text is hidden.',
  ],
  related: ['IconButton', 'TextButton'],
};
