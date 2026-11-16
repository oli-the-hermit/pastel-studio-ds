import React, { useState } from 'react';
import { Button, WindowControls, WindowFrame } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};

function SignIn() {
  return (
    <div className="docs-window-frame-screen">
      <Button variant="primary">Sign in</Button>
    </div>
  );
}

const stage = (node: React.ReactNode) => <div className="docs-gallery-span docs-window-frame-stage">{node}</div>;

function Demo() {
  const [maximized, setMaximized] = useState(false);
  return (
    <div className="docs-window-frame-stage">
      <WindowFrame windowControls={<WindowControls maximized={maximized} onMinimize={noop} onToggleMaximize={() => setMaximized((m) => !m)} onClose={noop} />}>
        <SignIn />
      </WindowFrame>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Maximized: stage(
      <WindowFrame windowControls={<WindowControls maximized onMinimize={noop} onToggleMaximize={noop} onClose={noop} />}>
        <SignIn />
      </WindowFrame>
    ),
    'Without window controls': stage(
      <WindowFrame>
        <SignIn />
      </WindowFrame>
    ),
  },
  variants: {},
  dos: [
    'Wrap every screen shown before the app\'s pages (starting up, signing in, a first-run step) so the window can always be moved, minimized and closed.',
    'In a Tauri app use `DesktopWindowFrame` from `@pastel-studio/desktop`: it wires the buttons and the drag region, and leaves the screen alone in a browser.',
  ],
  donts: [
    'Don\'t use it on a screen with a TopBar: the TopBar, with `windowControls` and `dragRegionProps`, is the title bar there.',
    'Don\'t put content in the bar: it stays empty so all of it can move the window.',
  ],
};
