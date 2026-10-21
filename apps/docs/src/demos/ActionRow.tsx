import React from 'react';
import { ActionRow, Button } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const stage = (node: React.ReactNode) => <div className="docs-gallery-span docs-appearance-stage">{node}</div>;

function Demo() {
  return stage(
    <ActionRow>
      <Button>Cancel</Button>
      <Button variant="primary">Save</Button>
    </ActionRow>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {},
  variants: {
    'Two actions': stage(<ActionRow><Button>Cancel</Button><Button variant="primary">Save</Button></ActionRow>),
    'One action': stage(<ActionRow><Button variant="primary">Done</Button></ActionRow>),
  },
  dos: [
    'Put the main action last, at the right; name each button for what it does.',
  ],
  donts: [
    'Don\'t add a third button; put rarer actions elsewhere in the dialog.',
  ],
};
