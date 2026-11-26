import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MediaRow',
  group: 'Media',
  summary: 'A heading over one row of tiles that scrolls sideways: "Continue watching", "Recently added", with See all and arrows to move a page at a time.',
  status: 'beta',
  states: [
    { name: 'Scrolls', description: 'More items than fit: Previous and Next show beside the heading and scroll about one page; the row comes to rest on an item and shows no scrollbar.' },
    { name: 'At an end', description: 'Previous is disabled at the start and Next at the end.' },
    { name: 'Everything fits', description: 'When every item is in view, the arrows are not shown.' },
    { name: 'With See all', description: '`onSeeAll` adds "See all" at the heading\'s end, for the page with everything.' },
  ],
  variants: [
    { name: 'Covers', description: 'Square TitleTiles: albums and playlists.' },
    { name: 'Wide tiles', description: '`shape="wide"` TitleTiles: episodes and videos, with their progress.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to See all, to the arrows, then into the row at one item, and out again.' },
    { keys: '← →', action: 'Moves to the previous or next item and scrolls it into view.' },
    { keys: 'Home', action: 'Moves to the first item.' },
    { keys: 'End', action: 'Moves to the last item.' },
    { keys: 'Enter', action: 'Opens the focused item.' },
  ],
  labels: ['seeAll', 'previous', 'next'],
  aria: [
    'A `region` named by its heading (`h2`, or the `headingLevel` given); the items are a `list`, each child in a list item.',
    'One tab stop for the whole row: the row sets `tabIndex` on each child, so a child must be one focusable element that passes it on, like a TitleTile.',
    'See all and the arrows are described by the heading, so "See all" is read with the row it belongs to; the arrows say which list they move with `aria-controls`.',
    'An arrow pressed at the last page hands the focus to the other one before it is disabled.',
    'The row scrolls smoothly, and at once with reduced motion.',
  ],
  related: ['TitleTile', 'TextButton', 'IconButton'],
};
