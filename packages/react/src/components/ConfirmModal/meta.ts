import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ConfirmModal',
  group: 'Overlays',
  summary: 'The body of a confirm dialog: the question, then Cancel and a danger action. Put it inside a Modal.',
  status: 'beta',
  states: [
    { name: 'In a dialog', description: 'Inside a Modal, titled by the question\'s subject; the danger action has focus.' },
  ],
  variants: [
    { name: 'Own word', description: '`confirmLabel` names the action for what it does: "Remove", "Reset"; "Delete" by default.' },
  ],
  keyboard: [
    { keys: 'Enter', action: 'Confirms: the danger action has focus when the dialog opens.' },
    { keys: 'Tab', action: 'Moves to Cancel.' },
    { keys: 'Esc', action: 'Closes the dialog (the Modal\'s own key) without confirming.' },
  ],
  labels: ['cancel', 'delete'],
  aria: [
    'The Modal gives the dialog its role and its title; the message is plain text inside it.',
    'Say what will be lost, and if it can be undone; offer Undo afterwards where it can.',
  ],
  related: ['Modal', 'ActionRow'],
};
