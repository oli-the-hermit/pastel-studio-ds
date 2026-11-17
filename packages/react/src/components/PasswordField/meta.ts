import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'PasswordField',
  group: 'Inputs',
  summary: 'A Field for a password, with a button at its end that shows what was typed and hides it again.',
  status: 'beta',
  states: [
    { name: 'Hidden', description: 'The start: dots, and an eye that shows the password.' },
    { name: 'Shown', description: 'After the button, or from the start with `defaultShown`: the password in plain text, and a struck-through eye that hides it again.' },
    { name: 'With hint', description: '`hint` puts muted help under it, such as how long a new password must be.' },
    { name: 'With error', description: '`error` says what is wrong and how to fix it: a red ring, the message in red, read out at once.' },
    { name: 'Disabled', description: '`disabled` greys out the field and its button.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves from the password to its show/hide button.' },
    { keys: 'Enter / Space', action: 'On the button: shows or hides the password.' },
  ],
  labels: ['showPassword', 'hidePassword'],
  aria: [
    'Field\'s `<label>` names the input; a `hint` or an `error` is linked to it with `aria-describedby`, and an error sets `aria-invalid`.',
    'The button is named for what it will do, "Show password" or "Hide password", and points at the input with `aria-controls`.',
    'Spell check, autocorrect and capitalization are off, so a shown password is not sent to a spell checker or changed.',
    'Pass `autoComplete="current-password"` or `"new-password"`, so password managers fill it or offer to save it.',
  ],
  related: ['Field', 'IconButton'],
};
