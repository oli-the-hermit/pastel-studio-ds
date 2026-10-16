import React from 'react';
import { Button, ProgressBar } from '@pastel-studio/react';
import { OnSurface } from '../blocks/OnSurface';
import { useSimulatedTask } from '../sim/useSimulatedTask';
import type { ComponentDemo } from './types';

function Demo() {
  const task = useSimulatedTask();
  const words = {
    idle: 'Not started',
    starting: 'Preparing the report…',
    processing: `Exporting, ${task.value}%`,
    completed: 'Report exported',
    failed: 'The export failed. Try again.',
  }[task.status];
  return (
    <div className="docs-demo-stack">
      <div className="docs-demo-progress">
        <ProgressBar value={task.value} status={task.status === 'idle' ? 'processing' : task.status} label="Exporting report" />
        <span className="docs-demo-status" role="status">{words}</span>
      </div>
      <div className="docs-demo-row">
        <Button variant="primary" onClick={() => task.start()}>Export report</Button>
        <Button onClick={() => task.start({ fail: true })}>Export and fail</Button>
      </div>
    </div>
  );
}

const wide = (bar: React.ReactNode) => <div className="docs-demo-wide">{bar}</div>;

export const demo: ComponentDemo = {
  Demo,
  states: {
    Starting: wide(<ProgressBar status="starting" label="Preparing" />),
    Processing: wide(<ProgressBar value={42} label="Exporting" />),
    Completed: wide(<ProgressBar status="completed" label="Exported" />),
    Failed: wide(<ProgressBar value={60} status="failed" label="Export failed" />),
  },
  variants: {
    md: wide(<ProgressBar value={42} label="Exporting" />),
    lg: wide(<ProgressBar value={42} size="lg" label="Exporting" />),
    Warning: wide(<ProgressBar value={82} tone="warning" label="Drive used" />),
    Danger: wide(<ProgressBar value={94} tone="danger" label="Drive used" />),
    'Custom track': (
      <OnSurface surface={3} className="docs-demo-wide">
        <ProgressBar value={42} label="Exporting" className="docs-progress-on-3" />
      </OnSurface>
    ),
  },
  dos: [
    'Start with `starting` while the amount is unknown, then pass `value` as it becomes known.',
    'Say what is happening in words beside it: "Exporting, 42%", "Report exported".',
    'Use `lg` for the main progress of a card and `md` in rows.',
  ],
  donts: [
    'Don\'t move it backwards: if the work starts over, say so in words.',
    'Don\'t leave a failed bar without a way forward: say what went wrong and offer to try again.',
  ],
};
