import React, { useState } from 'react';
import { Button, CrashScreen, IconSparkle } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const stage = (node: React.ReactNode) => <div className="docs-gallery-span docs-crash-stage">{node}</div>;

function Demo() {
  const [crashed, setCrashed] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!crashed) {
    return (
      <div className="docs-demo-row">
        <Button variant="danger" onClick={() => setCrashed(true)}>Simulate a crash</Button>
        <span className="docs-demo-status">In an app, CrashBoundary shows this screen when anything below it fails to draw.</span>
      </div>
    );
  }
  return stage(
    <CrashScreen
      mark={<IconSparkle size={30} />}
      onReload={() => { setCrashed(false); setCopied(false); }}
      onCopyDetails={() => setCopied(true)}
      copied={copied}
    />,
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Crashed: stage(<CrashScreen mark={<IconSparkle size={30} />} onReload={noop} onCopyDetails={noop} />),
    'Details copied': stage(<CrashScreen mark={<IconSparkle size={30} />} onReload={noop} onCopyDetails={noop} copied />),
  },
  variants: {},
  dos: [
    'Wrap each window in a CrashBoundary, with `details` adding the version and platform to the report.',
    'Say plainly that the saved data is safe, if it is.',
  ],
  donts: [
    'Don\'t show the error\'s text on the screen: it means nothing to most people; Copy details carries it.',
  ],
};
