import React, { useState } from 'react';
import { Button, ConfirmModal, Modal } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
/** A dialog's body standing still and inert, so the danger action's focus doesn't move the page. */
const still = (node: React.ReactNode) => <div className="docs-gallery-span docs-appearance-stage" {...{ inert: '' }}>{node}</div>;

function Demo() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(0);
  return (
    <div className="docs-demo-row">
      <Button variant="danger" onClick={() => setOpen(true)}>Delete the list…</Button>
      <span className="docs-demo-status" role="status">{deleted ? `Deleted ${deleted} time${deleted > 1 ? 's' : ''} (simulated).` : ''}</span>
      <Modal isOpen={open} title="Delete Errands?" onClose={() => setOpen(false)}>
        <ConfirmModal message="Its 6 tasks go with it. This can't be undone." onConfirm={() => setDeleted((n) => n + 1)} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'In a dialog': still(<ConfirmModal message="Its 6 tasks go with it. This can't be undone." onConfirm={noop} onClose={noop} />),
  },
  variants: {
    'Own word': still(<ConfirmModal message="Your accent and theme go back to the defaults." confirmLabel="Reset" onConfirm={noop} onClose={noop} />),
  },
  dos: [
    'Ask only before what can\'t be undone; for the rest, act and offer Undo in a toast.',
    'Title the dialog with the question, and say in the message what will be lost.',
  ],
  donts: [
    'Don\'t name the danger action "OK" or "Yes": name what it does.',
  ],
};
