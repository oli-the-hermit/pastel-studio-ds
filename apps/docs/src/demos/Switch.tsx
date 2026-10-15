import React, { useState } from 'react';
import { Switch } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-demo-wide">{node}</div>;

function Demo() {
  const [sound, setSound] = useState(true);
  const [autoBreaks, setAutoBreaks] = useState(false);
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <Switch label="Sound alerts" hint="A short chime when a session or a break ends" checked={sound} onChange={setSound} />
      <Switch label="Start breaks automatically" checked={autoBreaks} onChange={setAutoBreaks} />
      <span className="docs-demo-status" role="status">Sound {sound ? 'on' : 'off'}, breaks start {autoBreaks ? 'by themselves' : 'when you press play'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Off: wide(<Switch label="Sound alerts" checked={false} onChange={noop} />),
    On: wide(<Switch label="Sound alerts" checked onChange={noop} />),
    'With hint': wide(<Switch label="Sound alerts" hint="A chime when a session ends" checked onChange={noop} />),
    Disabled: wide(<Switch label="Desktop notifications" hint="Blocked by your system settings" checked={false} onChange={noop} disabled />),
  },
  variants: {},
  dos: [
    'Name the setting, not the action: "Sound alerts", not "Turn on sound".',
    'Use it for a setting that applies at once; nothing waits for a Save button.',
    'Add a `hint` when the effect isn\'t obvious from the name.',
  ],
  donts: [
    'Don\'t use a switch inside a form that is saved later: use a checkbox.',
    'Don\'t leave a disabled switch unexplained: say why in its `hint`.',
  ],
};
