import React, { useEffect, useState } from 'react';
import { Button, IconSparkle, ProgressBar, UpdateCard } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const icon = <IconSparkle size={20} />;
const title = 'Version 1.4.0 is ready';
const later = <Button size="sm">Later</Button>;
const span = (node: React.ReactNode) => <div className="docs-gallery-span">{node}</div>;

function Demo() {
  const [phase, setPhase] = useState<'offer' | 'downloading' | 'restarting' | 'later'>('offer');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (phase !== 'downloading') return;
    const id = window.setInterval(() => setProgress((p) => {
      if (p >= 1) { setPhase('restarting'); return 1; }
      return Math.min(1, p + 0.1);
    }), 300);
    return () => window.clearInterval(id);
  }, [phase]);
  if (phase === 'later') return <Button onClick={() => { setPhase('offer'); setProgress(0); }}>Show the card again</Button>;
  return (
    <UpdateCard
      title={title}
      icon={icon}
      actions={phase === 'offer' && (
        <>
          <Button size="sm" onClick={() => setPhase('later')}>Later</Button>
          <Button size="sm" variant="primary" onClick={() => setPhase('downloading')}>Install</Button>
        </>
      )}
    >
      {phase === 'offer' && <p>New: notes. It installs in a minute and restarts the app.</p>}
      {phase !== 'offer' && (
        <div className="docs-update-status" role="status">
          <p>{phase === 'downloading' ? `Downloading… ${Math.round(progress * 100)}%` : 'Restarting…'}</p>
          {phase === 'downloading' && <ProgressBar value={progress * 100} label="Downloading" />}
        </div>
      )}
    </UpdateCard>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Offer: span(<UpdateCard title={title} icon={icon} actions={<>{later}<Button size="sm" variant="primary">Install</Button></>}><p>New: notes. It installs in a minute and restarts the app.</p></UpdateCard>),
    Downloading: span(<UpdateCard title={title} icon={icon}><div className="docs-update-status"><p>Downloading… 40%</p><ProgressBar value={40} label="Downloading" /></div></UpdateCard>),
    Failed: span(<UpdateCard title={title} icon={icon} actions={<>{later}<Button size="sm" variant="primary" onClick={noop}>Try again</Button></>}><p>The download stopped. Check the connection and try again.</p></UpdateCard>),
  },
  variants: {},
  dos: [
    'Offer it when the person is between tasks, never while a timer or a recording runs.',
    'Once they say yes, keep it until the app restarts, so the progress stays visible.',
  ],
  donts: [
    'Don\'t install without asking, and don\'t ask again the same day after Later.',
  ],
};
