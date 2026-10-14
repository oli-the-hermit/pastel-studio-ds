import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ProgressBar',
  group: 'Feedback',
  summary: 'A thin track that shows how far a task has come: a download, an export, a goal.',
  status: 'beta',
  states: [
    { name: 'Starting', description: '`status="starting"`: the work has begun but has no amount yet. Two bars sweep across; with reduced motion one bar fills from start to finish, empties and pauses, in a calm loop.' },
    { name: 'Processing', description: 'The default: the accent fill grows to `value`, easing rather than jumping.' },
    { name: 'Completed', description: '`status="completed"`: full, in the success color.' },
    { name: 'Failed', description: '`status="failed"`: stops where it was, in the danger color.' },
  ],
  variants: [
    { name: 'md', description: 'The default height, for rows and lists.' },
    { name: 'lg', description: '`size="lg"`: a thicker track, for the main progress on a card.' },
    { name: 'Custom track', description: 'Set `--ps-progress-bar-track` on its class when it sits on a raised surface, so the track stays one step above.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'A `progressbar` from 0 to 100 with its value; while starting it has no value, which tells a screen reader the amount is unknown.',
    'Give it a `label` that names the task ("Exporting report"), or point `aria-labelledby` at a visible one.',
    'Completed and failed are shown by color: say it in words beside the bar too.',
  ],
  related: ['Toast', 'Card'],
};
