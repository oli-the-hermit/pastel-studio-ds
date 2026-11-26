import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FilterChips',
  group: 'Inputs',
  summary: 'A row of separate chips that filter what a list or a grid shows, one always chosen: albums, artists, songs.',
  status: 'beta',
  states: [
    { name: 'Chosen', description: 'The chosen chip takes the accent container; the others sit on a raised surface and step up when hovered.' },
    { name: 'With counts', description: 'An option\'s `count` shows as a quieter number after its label.' },
    { name: 'Wrapped', description: 'Short of room, the chips wrap to more lines; none is cut off or scrolled away.' },
    { name: 'Nothing chosen', description: 'A `value` that matches no option leaves all of them quiet; the first one takes the tab stop.' },
  ],
  variants: [
    { name: 'md', description: 'The default, over a list or a grid.' },
    { name: 'lg', description: '`size="lg"`: taller, with larger text, where the chips are the page\'s main control.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves into the group, to the chosen chip, and out again.' },
    { keys: '← →', action: 'Moves to the previous or next chip and chooses it.' },
    { keys: '↑ ↓', action: 'The same as ← and →.' },
    { keys: 'Home', action: 'Chooses the first chip.' },
    { keys: 'End', action: 'Chooses the last chip.' },
  ],
  labels: [],
  aria: [
    'A `radiogroup` named by `ariaLabel`; each chip is a `radio` with `aria-checked`.',
    'One tab stop for the whole group, as for native radio buttons.',
    'A chip\'s count is part of its name: "Albums 12".',
  ],
  related: ['SegmentedControl', 'Tabs', 'Chip'],
};
