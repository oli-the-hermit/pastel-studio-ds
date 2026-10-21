import React, { useState } from 'react';
import { Button, Field, FormRow, ModalForm, Subform, TextButton, TextInput } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const stage = (node: React.ReactNode) => <div className="docs-gallery-span docs-appearance-stage">{node}</div>;

function SessionForm({ withReward = false }: { withReward?: boolean }) {
  const [name, setName] = useState('Morning focus');
  return (
    <ModalForm onSubmit={(e) => e.preventDefault()}>
      <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <FormRow>
        <Field label="Starts"><TextInput defaultValue="09:00" /></Field>
        <Field label="Ends"><TextInput defaultValue="11:30" /></Field>
      </FormRow>
      {withReward && (
        <Subform title="New reward" action={<TextButton size="xs" type="button">Remove</TextButton>}>
          <Field label="Reward"><TextInput defaultValue="A walk outside" /></Field>
        </Subform>
      )}
    </ModalForm>
  );
}

function Demo() {
  return stage(<SessionForm withReward />);
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Dialog form': stage(<SessionForm />),
    'Nested form': stage(
      <Subform title="New reward" action={<TextButton size="xs" type="button" onClick={noop}>Remove</TextButton>}>
        <Field label="Reward"><TextInput defaultValue="A walk outside" /></Field>
      </Subform>
    ),
  },
  variants: {
    pair: stage(
      <FormRow>
        <Field label="Starts"><TextInput defaultValue="09:00" /></Field>
        <Field label="Ends"><TextInput defaultValue="11:30" /></Field>
      </FormRow>
    ),
    emoji: stage(
      <FormRow variant="emoji">
        <Field label="Icon" group><Button aria-label="Pick an emoji" type="button">🌱</Button></Field>
        <Field label="Goal"><TextInput defaultValue="Read every day" /></Field>
      </FormRow>
    ),
  },
  dos: [
    'Wrap a dialog\'s fields in a ModalForm, so Enter saves and the spacing is the dialog\'s.',
    'Pair only fields that belong together: a start and an end, a first and a last name.',
  ],
  donts: [
    'Don\'t nest a Subform in a Subform.',
  ],
};
