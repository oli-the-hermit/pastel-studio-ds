import React, { useState } from 'react';
import { Button, Modal } from '@pastel-studio/react';
import { ModalStage } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [name, setName] = useState('Weekend errands');
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState<'rename' | 'about' | null>(null);
  return (
    <div className="docs-demo-row">
      <Button onClick={() => { setDraft(name); setOpen('rename'); }}>Rename list</Button>
      <Button onClick={() => setOpen('about')}>About lists</Button>
      <span className="docs-demo-status" role="status">List: {name}</span>

      <Modal isOpen={open === 'rename'} title="Rename list" onClose={() => setOpen(null)}>
        <form className="docs-demo-form" onSubmit={(e) => { e.preventDefault(); setName(draft.trim() || name); setOpen(null); }}>
          <input className="docs-input" aria-label="List name" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="docs-demo-actions">
            <Button onClick={() => setOpen(null)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={open === 'about'} title="About lists" onClose={() => setOpen(null)} dismissible>
        <p>A list groups the tasks of one project or one day. This dialog only shows something, so Escape closes it.</p>
        <div className="docs-demo-actions">
          <Button variant="primary" onClick={() => setOpen(null)}>Got it</Button>
        </div>
      </Modal>
    </div>
  );
}

const question = (
  <>
    <p>Its 4 tasks are deleted with it. This can't be undone.</p>
    <div className="docs-demo-actions">
      <Button>Cancel</Button>
      <Button variant="danger">Delete</Button>
    </div>
  </>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Open: <ModalStage><Modal isOpen title="Delete this list?" onClose={noop}>{question}</Modal></ModalStage>,
    'Long content': (
      <ModalStage>
        <Modal isOpen title="What's new" onClose={noop}>
          {['A new look for the session card.', 'Task rows have their own menu.', 'Lists you opened recently come first.', 'A floating navigation drawer.', 'Pick or create a list from one place.', 'The mini player follows your theme.'].map((line) => <p key={line}>{line}</p>)}
        </Modal>
      </ModalStage>
    ),
  },
  variants: {
    wide: <ModalStage><Modal isOpen wide title="Delete this list?" onClose={noop}>{question}</Modal></ModalStage>,
  },
  dos: [
    'Write the title as the question or the task: "Delete this list?", "Rename list".',
    'End with the actions on the right: Cancel first, then the one that does the thing.',
    'Leave `dismissible` off for forms, so Escape can\'t throw away what was typed.',
  ],
  donts: [
    'Don\'t open a modal from a modal: change the content of the one that is open.',
    'Don\'t use it for a message that needs no answer: that is a toast.',
  ],
};
