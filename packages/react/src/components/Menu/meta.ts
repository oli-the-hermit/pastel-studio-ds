import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Menu',
  group: 'Overlays',
  summary: 'An icon button that opens a short list of actions for the thing it sits on.',
  status: 'beta',
  states: [
    { name: 'Items', description: 'Each item has a label and may have an icon.' },
    { name: 'With hints', description: 'A `hint` on the right shows the keyboard shortcut.' },
    { name: 'Danger', description: '`danger` marks the item that deletes or discards.' },
    { name: 'Disabled', description: 'A `disabled` item stays in place and is skipped by the arrow keys.' },
    { name: 'With dividers', description: 'A divider separates groups of actions.' },
    { name: 'With header', description: 'A `header` above the items says what or who the actions are for. It lines up with the text of the items.' },
    { name: 'Long header', description: 'The menu grows with its header up to `--ps-menu-max-width` (280px); past that each line of the header ends with an ellipsis, and the inset around it stays the same.' },
  ],
  variants: [
    { name: 'Small trigger', description: '`triggerSize="sm"` for card headers and rows.' },
    { name: 'Custom trigger', description: '`trigger` replaces the "more" glyph; `triggerClassName` replaces the icon button look.' },
    { name: 'Aligned to the start', description: '`align="start"` lines the menu up with the left edge of the trigger.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'On the trigger, opens the menu. On an item, picks it.' },
    { keys: 'Space', action: 'The same as Enter.' },
    { keys: '↓', action: 'Moves to the next item, and from the last to the first.' },
    { keys: '↑', action: 'Moves to the previous item, and from the first to the last.' },
    { keys: 'Home', action: 'Moves to the first item.' },
    { keys: 'End', action: 'Moves to the last item.' },
    { keys: 'Escape', action: 'Closes the menu and returns focus to the trigger.' },
  ],
  labels: ['moreActions'],
  aria: [
    'The trigger has `aria-haspopup="menu"` and `aria-expanded`. Its name is `ariaLabel`, or "More actions".',
    'The panel is a `menu` and its rows are `menuitem`s; dividers are separators.',
    'While a menu is open, `isBlockingOverlayOpen()` is true, so an app can pause its shortcuts.',
  ],
  related: ['ContextMenu', 'Popover', 'IconButton'],
};
