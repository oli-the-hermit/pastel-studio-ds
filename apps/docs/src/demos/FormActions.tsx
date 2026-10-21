import React, { useState } from 'react';
import { Button, Field, FormActions, ModalForm, TextInput } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const stage = (node: React.ReactNode) => <div className="docs-gallery-span docs-appearance-stage">{node}</div>;

function Demo() {
  const start = 'Errands';
  const [name, setName] = useState(start);
  const [saved, setSaved] = useState(start);
  return stage(
    <ModalForm onSubmit={(e) => { e.preventDefault(); setSaved(name); }}>
      <Field label="List name" hint={`Saved: ${saved}`}><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <FormActions dirty={name !== saved} onCancel={() => setName(saved)} primaryLabel="Save" primaryDisabled={!name.trim()} />
    </ModalForm>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Untouched: stage(<FormActions dirty={false} onCancel={noop} primaryLabel="Save" onPrimary={noop} />),
    Edited: stage(<FormActions dirty onCancel={noop} primaryLabel="Save" onPrimary={noop} />),
    'Not ready': stage(<FormActions dirty onCancel={noop} primaryLabel="Save" primaryDisabled onPrimary={noop} />),
  },
  variants: {
    'With a leading action': stage(<FormActions dirty={false} onCancel={noop} primaryLabel="Save" onPrimary={noop} leading={<Button variant="danger">Delete list</Button>} />),
  },
  dos: [
    'Pass `dirty` from a comparison with what the form opened with, so Cancel appears only when there is something to cancel.',
    'Leave out `onPrimary` inside a ModalForm: the main action submits it.',
  ],
  donts: [
    'Don\'t show Cancel on an untouched form: the dialog\'s X closes it.',
  ],
};
