import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Field',
  group: 'Inputs',
  summary: 'A label above a control, with help or an error under it; with TextInput and TextArea, the text fields of every form.',
  status: 'beta',
  states: [
    { name: 'Empty', description: 'The placeholder shows in the tertiary text color.' },
    { name: 'Filled', description: 'The value in the primary text color.' },
    { name: 'With hint', description: '`hint` puts muted help under the control; screen readers read it with the field.' },
    { name: 'With error', description: '`error` says what is wrong and how to fix it: a red ring, the message in red, read out at once.' },
    { name: 'Optional', description: '`labelHint` adds a quiet word after the label, like "Optional".' },
  ],
  variants: [
    { name: 'TextArea', description: 'Several lines; it can be made taller by dragging its corner.' },
    { name: 'Group label', description: '`group` names a set of controls (chips, options) instead of one; the label is plain text.' },
  ],
  keyboard: [],
  labels: [],
  aria: [
    'The label is a `<label>` pointing at the control. With a single TextInput or TextArea inside, Field creates the id and wires it.',
    'A `hint` or an `error` is linked to the control with `aria-describedby`; an error also sets `aria-invalid` and is an `alert`.',
    'For another control (a Select), pass `htmlFor` with the control\'s id; the hint and error ids are that id plus `-hint` or `-error`.',
    'FormHint and FormError stand alone for a note or a problem that belongs to the whole form.',
  ],
  related: ['Select', 'Switch'],
};
