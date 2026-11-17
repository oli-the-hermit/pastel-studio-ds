import React, { useState } from 'react';
import { Button, PasswordField } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const narrow = (node: React.ReactNode) => <div className="docs-demo-narrow">{node}</div>;

function Demo() {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState(false);
  const tooShort = tried && next.length < 8 ? 'Use at least 8 characters.' : undefined;
  const mismatch = tried && !tooShort && confirm !== next ? 'The two passwords don\'t match.' : undefined;
  return (
    <form
      className="docs-demo-form docs-demo-narrow"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        setSaved(next.length >= 8 && confirm === next);
      }}
    >
      <PasswordField label="New password" hint="At least 8 characters." error={tooShort} autoComplete="new-password" value={next} onChange={setNext} />
      <PasswordField label="Confirm password" error={mismatch} autoComplete="new-password" value={confirm} onChange={setConfirm} />
      <div className="docs-demo-actions">
        <Button variant="primary" type="submit">Change password</Button>
      </div>
      <span className="docs-demo-status" role="status">{saved ? 'Password changed' : 'Nothing changed yet'}</span>
    </form>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Hidden: narrow(<PasswordField label="Password" value="harbour lights" onChange={noop} />),
    Shown: narrow(<PasswordField label="Password" value="harbour lights" onChange={noop} defaultShown />),
    'With hint': narrow(<PasswordField label="New password" value="" onChange={noop} hint="At least 8 characters." />),
    'With error': narrow(<PasswordField label="New password" value="tide" onChange={noop} error="Use at least 8 characters." />),
    Disabled: narrow(<PasswordField label="Password" value="harbour lights" onChange={noop} disabled />),
  },
  variants: {},
  dos: [
    'Use it for every password, so anyone can check what they typed before signing in or saving it.',
    'Set `autoComplete` to `current-password` to sign in and `new-password` to choose one, so password managers help.',
    'Say the rules for a new password in `hint` before it is typed, not only in the error.',
  ],
  donts: [
    'Don\'t use it for a recovery code or a key the app shows once: show those as text with a copy button.',
    'Don\'t start with the password shown unless the app made it up and the person needs to read it.',
  ],
};
