import React, { useState } from 'react';
import { Checkbox } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
/** A list row on a card, where a checkbox usually sits. */
const row = (box: React.ReactNode, text: string) => (
  <label className="docs-check-row">{box}<span>{text}</span></label>
);

const tasks = [
  { key: 'draft', text: 'Write the draft' },
  { key: 'figures', text: 'Check the figures' },
  { key: 'send', text: 'Send it' },
];

function Demo() {
  const [done, setDone] = useState<Record<string, boolean>>({ draft: true });
  return (
    <div className="docs-check-list">
      {tasks.map((t) => (
        <React.Fragment key={t.key}>{row(<Checkbox checked={!!done[t.key]} onChange={(on) => setDone((d) => ({ ...d, [t.key]: on }))} />, t.text)}</React.Fragment>
      ))}
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Unchecked: <div className="docs-check-list">{row(<Checkbox checked={false} onChange={noop} />, 'A task to do')}</div>,
    Checked: <div className="docs-check-list">{row(<Checkbox checked onChange={noop} />, 'A task done')}</div>,
    'Read-only': <div className="docs-check-list">{row(<Checkbox checked={false} onChange={noop} aria-disabled="true" title="Done when its sessions are" />, 'Follows its sessions')}</div>,
    Disabled: <div className="docs-check-list">{row(<Checkbox checked={false} onChange={noop} disabled />, 'Not available')}</div>,
  },
  variants: {},
  dos: [
    'Put the label beside it, and let the whole row toggle it.',
    'On a surface where the default fill is too close to the row, set `--ps-checkbox-fill` a step further down.',
  ],
  donts: [
    'Don\'t use it for a setting that applies at once: a Switch says that better.',
  ],
};
