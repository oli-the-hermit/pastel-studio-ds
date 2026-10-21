import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Tour',
  group: 'Overlays',
  summary: 'A guided tour: a welcome card, steps that spotlight elements across the app, and a closing card. The app writes the steps; the tour shows them.',
  status: 'beta',
  states: [
    { name: 'Welcome', description: 'A `welcome` step: a card in the middle with the app\'s `mark`, Maybe later and Show me around.' },
    { name: 'Spotlight', description: 'A `spot` step: the target (its `data-tour`) in a clear hole, everything else dimmed and inert; the card beside it with an arrow, the chapter and its count, the chapters as dots.' },
    { name: 'Done', description: 'A `done` step: the closing card with a check.' },
  ],
  variants: [],
  keyboard: [
    { keys: '→ / Enter', action: 'Next step (Enter only when focus isn\'t on a button).' },
    { keys: '←', action: 'Previous step.' },
    { keys: 'Esc', action: 'Closes the tour.' },
    { keys: 'Tab', action: 'Moves through the card\'s buttons only.' },
  ],
  labels: ['tour', 'tourStart', 'tourLater', 'tourDone', 'tourClose', 'tourStepCount', 'back', 'next'],
  aria: [
    'A modal `dialog` named "Tour"; the next button takes focus at each step.',
    'The step\'s text is a polite live region, so each step is read out as it appears.',
    'A step whose target isn\'t on screen (a feature this device lacks) is skipped in the direction of travel.',
  ],
  related: ['Modal', 'Popover'],
};
