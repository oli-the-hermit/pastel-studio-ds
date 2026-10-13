import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Modal',
  group: 'Overlays',
  summary: 'A dialog over the page, for a task that needs an answer before anything else: a form, a confirmation, details.',
  status: 'beta',
  states: [
    { name: 'Open', description: 'A title, a close button and its content, over a scrim that dims the page.' },
    { name: 'Long content', description: 'Taller than the window: the dialog stops at its edges and the content scrolls under the title.' },
  ],
  variants: [
    { name: 'wide', description: '`wide` for content with two columns or a long form.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the controls of the dialog and stays inside it.' },
    { keys: 'Shift + Tab', action: 'The same, backwards.' },
    { keys: 'Escape', action: 'Closes it, only when `dismissible`.' },
  ],
  labels: ['close'],
  aria: [
    'A `dialog` with `aria-modal`, named by its title.',
    'When it opens, focus goes to its first field, or to the dialog itself; a child with `autoFocus` wins. When it closes, focus returns to what opened it.',
    'Clicking the scrim never closes it, and Escape only does when `dismissible`: a form is not lost by accident.',
    'While it is open, `isBlockingOverlayOpen()` is true, so an app can pause its shortcuts.',
  ],
  related: ['Popover', 'Button'],
};
