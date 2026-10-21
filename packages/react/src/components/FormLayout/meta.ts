import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'FormLayout',
  group: 'Inputs',
  summary: 'The layout of a dialog\'s form: ModalForm (a column of fields), FormRow (two side by side) and Subform (a form nested in a field).',
  status: 'beta',
  states: [
    { name: 'Dialog form', description: '`ModalForm` lays out its Fields 20px apart; `as="div"` when the dialog saves through its own buttons.' },
    { name: 'Nested form', description: '`Subform` puts a small form on a tinted panel inside a field, its fields one step above it, with a title and an action.' },
  ],
  variants: [
    { name: 'pair', description: '`FormRow` with two equal columns.' },
    { name: 'emoji', description: '`FormRow variant="emoji"`: a narrow emoji button, then a wide field.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'A ModalForm is a `<form>`: Enter in a text field submits it. Give each field a Field with its label.',
    'FormRow keeps the reading order: left field, then right.',
  ],
  related: ['Field', 'Modal', 'FormActions'],
};
