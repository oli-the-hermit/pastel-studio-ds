import React, { useState } from 'react';
import { Button, Field, FormHint, TextArea, TextInput } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-demo-wide">{node}</div>;

function Demo() {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState('');
  const error = tried && !name.trim() ? 'Give the list a name.' : undefined;
  return (
    <form
      className="docs-demo-form docs-demo-narrow"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (name.trim()) setSaved(name.trim());
      }}
    >
      <Field label="List name" error={error}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend errands" />
      </Field>
      <Field label="Notes" labelHint="Optional" hint="Shown under the list's title.">
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <FormHint>Lists are only stored on this device.</FormHint>
      <div className="docs-demo-actions">
        <Button variant="primary" type="submit">Save</Button>
      </div>
      <span className="docs-demo-status" role="status">{saved ? `Saved "${saved}"` : 'Nothing saved yet'}</span>
    </form>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Empty: wide(<Field label="List name"><TextInput placeholder="Weekend errands" /></Field>),
    Filled: wide(<Field label="List name"><TextInput defaultValue="Weekend errands" /></Field>),
    'With hint': wide(<Field label="Daily goal" hint="In minutes of focus."><TextInput defaultValue="90" inputMode="numeric" /></Field>),
    'With error': wide(<Field label="List name" error="Give the list a name."><TextInput value="" onChange={noop} /></Field>),
    Optional: wide(<Field label="Notes" labelHint="Optional"><TextInput /></Field>),
  },
  variants: {
    TextArea: wide(<Field label="Notes"><TextArea defaultValue="Bring the receipts for the returns." /></Field>),
    'Group label': wide(
      <Field label="Repeat on" group>
        <div className="docs-demo-row"><Button size="sm">Mon</Button><Button size="sm">Wed</Button><Button size="sm">Fri</Button></div>
      </Field>
    ),
  },
  dos: [
    'Put every control in a Field, so it has a visible label.',
    'Write the error as the fix: "Give the list a name.", not "Invalid input".',
    'Show an error after the person tries to save, not while they are still typing.',
  ],
  donts: [
    'Don\'t use the placeholder as the label: it disappears when they type.',
    'Don\'t mark every field "Required": mark the few that are optional instead.',
  ],
};
