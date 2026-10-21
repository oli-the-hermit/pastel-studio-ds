import React, { useState } from 'react';
import { IconClose, IconPin, WindowButton, WindowControls } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const row = (children: React.ReactNode) => <div className="docs-window-row">{children}</div>;

function Demo() {
  const [maximized, setMaximized] = useState(false);
  return row(
    <>
      <WindowControls maximized={maximized} onMinimize={noop} onToggleMaximize={() => setMaximized((m) => !m)} onClose={noop} />
      <span className="docs-demo-status" role="status">{maximized ? 'Maximized: the middle button restores it.' : 'Press the middle button to maximize.'}</span>
    </>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Maximized: row(<WindowControls maximized onMinimize={noop} onToggleMaximize={noop} onClose={noop} />),
    'Pin on': row(
      <>
        <WindowButton size="sm" label="Always on top" pressed><IconPin size={14} /></WindowButton>
        <WindowButton size="sm" label="Pin" pressed={false}><IconPin size={14} /></WindowButton>
      </>
    ),
  },
  variants: {
    md: row(<WindowControls onMinimize={noop} onToggleMaximize={noop} onClose={noop} />),
    sm: row(
      <>
        <WindowButton size="sm" label="Pin"><IconPin size={14} /></WindowButton>
        <WindowButton size="sm" label="Close"><IconClose size={13} /></WindowButton>
      </>
    ),
    Close: row(<WindowButton danger label="Close"><IconClose size={17} /></WindowButton>),
  },
  dos: [
    'Pass the app\'s own window calls as `onMinimize`, `onToggleMaximize` and `onClose`, and keep `maximized` in sync with the real window.',
    'Use `size="sm"` and `pressed` for a mini window\'s pin and always-on-top toggles.',
  ],
  donts: [
    'Don\'t place it in a drag region: a drag handle swallows the clicks.',
    'Don\'t show it in a browser tab: the page has no window to control. Render it only where the app owns the window.',
  ],
};
