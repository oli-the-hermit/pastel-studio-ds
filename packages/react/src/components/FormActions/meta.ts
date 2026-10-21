import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FormActions',
  group: 'Overlays',
  summary: 'The footer of a form dialog: the main action at the right, and Cancel, which appears only once something was edited.',
  status: 'beta',
  states: [
    { name: 'Untouched', description: 'Only the main action; the form closes with the dialog\'s X.' },
    { name: 'Edited', description: '`dirty`: Cancel pops in before the main action.' },
    { name: 'Not ready', description: '`primaryDisabled` while the form can\'t be saved yet.' },
  ],
  variants: [
    { name: 'With a leading action', description: '`leading` puts something at the left, e.g. Delete.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'In a text field of the form, submits it (the main action is a submit button unless `onPrimary` is given).' },
  ],
  labels: ['cancel'],
  aria: [
    'Without `onPrimary` the main action is `type="submit"`, so the form\'s own submit handles it.',
    'Cancel appears in the tab order only while the form is edited.',
  ],
  related: ['ActionRow', 'FormLayout', 'Modal'],
};
