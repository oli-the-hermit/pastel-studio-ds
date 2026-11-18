import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Tooltip',
  group: 'Overlays',
  summary: 'A small label beside a control: its name, its keyboard shortcut, and a line about what it does when the name alone doesn\'t say.',
  status: 'beta',
  states: [
    { name: 'Name', description: 'Just the name, for a button with only an icon.' },
    { name: 'With shortcut', description: 'The name and the key that does the same, as menus print it.' },
    { name: 'With description', description: 'A line under the name for a control whose name doesn\'t explain it.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moving keyboard focus to the control shows its tooltip.' },
    { keys: 'Escape', action: 'Hides it, without moving focus.' },
  ],
  labels: [],
  aria: [
    'It shows after the pointer rests on the control for 600 ms, or when the control gets keyboard focus; then, for a moment, the next one shows at once, so moving along a toolbar reads each button.',
    'One shows at a time. It hides on leave, a press, Escape, blur and scroll, and never shows for touch.',
    'It is `role="tooltip"`. The control keeps its own accessible name (an IconButton\'s `label`); the description is added with `aria-describedby` while it shows, and a shortcut becomes `aria-keyshortcuts`.',
    'It never takes the pointer and never registers as an overlay, so the app\'s shortcuts keep working while it shows.',
    'IconButton shows its `label` in one already: give it `shortcut` and `description`. Use `Tooltip` around any other element, `useTooltip` to build one in, and `TruncatedText` for text that may end with "…".',
  ],
  related: ['IconButton', 'Button', 'Popover'],
};
