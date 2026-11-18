import React, { useEffect, useState } from 'react';
import { TextButton, TransferCard, TransferIndicator, TransferRow, type TransferState } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const GB = 1024 ** 3;
const MB = 1024 ** 2;

/** A card shown in the page instead of the window's corner. */
const inPlace = (node: React.ReactNode) => <div className="docs-transfer-stage">{node}</div>;

function Demo() {
  const total = 4.1 * GB;
  const [done, setDone] = useState(0);
  const [state, setState] = useState<TransferState>('running');
  const [collapsed, setCollapsed] = useState(false);
  const [shown, setShown] = useState(true);

  // A pretend copy at about 38 MB/s, paused while it asks about a name.
  useEffect(() => {
    if (state !== 'running') return;
    const t = window.setInterval(() => {
      setDone((d) => {
        const next = Math.min(total, d + 38 * MB * 4);
        if (next >= total) setState('done');
        else if (d < total / 2 && next >= total / 2) setState('waiting');
        return next;
      });
    }, 250);
    return () => window.clearInterval(t);
  }, [state, total]);

  const restart = () => {
    setDone(0);
    setState('running');
    setShown(true);
  };
  const active = state === 'done' || state === 'cancelled' ? 0 : 1;

  return (
    <div className="docs-demo-stack">
      <div className="docs-window-row">
        <TransferIndicator label="Transfers" count={active} progress={done / total} attention={state === 'waiting'} onClick={() => setShown(true)} />
        <TextButton onClick={restart}>Start again</TextButton>
      </div>
      {shown &&
        inPlace(
          <TransferCard activeCount={active} collapsed={collapsed} onCollapsedChange={setCollapsed} onHide={() => setShown(false)} onClearFinished={state === 'done' ? restart : undefined}>
            <TransferRow
              title="Copying 48 files to Art"
              state={state}
              current={`IMG_${String(Math.floor((done / total) * 48) + 1).padStart(4, '0')}.jpg`}
              doneBytes={done}
              totalBytes={total}
              bytesPerSecond={38 * MB}
              secondsLeft={(total - done) / (38 * MB)}
              conflict={{ name: 'IMG_0024.jpg', incoming: { size: 4.2 * MB, modified: '2026-11-12T10:05:00' }, existing: { size: 3.9 * MB, modified: '2026-10-02T18:40:00' }, remaining: 3 }}
              result={state === 'done' ? '48 copied' : 'Stopped'}
              onStop={() => setState('cancelled')}
              onResolve={() => setState('running')}
            />
            <TransferRow title="Moving 3 files to Raw" state={state === 'done' ? 'running' : 'queued'} doneBytes={0} totalBytes={120 * MB} />
          </TransferCard>
        )}
    </div>
  );
}

const card = (children: React.ReactNode, collapsed = false) =>
  inPlace(
    <TransferCard activeCount={1} collapsed={collapsed} onCollapsedChange={noop} onHide={noop}>
      {children}
    </TransferCard>
  );

export const demo: ComponentDemo = {
  Demo,
  states: {
    Running: card(
      <TransferRow title="Copying 48 files to Art" state="running" current="IMG_0031.jpg" doneBytes={2.6 * GB} totalBytes={4.1 * GB} bytesPerSecond={38 * MB} secondsLeft={170} onStop={noop} />
    ),
    Waiting: card(<TransferRow title="Moving 3 files to Raw" state="queued" onStop={noop} />),
    Asking: card(
      <TransferRow
        title="Copying 48 files to Art"
        state="waiting"
        doneBytes={1.2 * GB}
        totalBytes={4.1 * GB}
        conflict={{ name: 'IMG_0024.jpg', incoming: { size: 4.2 * MB }, existing: { size: 3.9 * MB }, remaining: 3 }}
        onResolve={noop}
        onStop={noop}
      />
    ),
    Finished: card(<TransferRow title="Copying 5 files to Art" state="done" result="4 copied, 1 skipped" errors={['old.png: the file is in use']} onDismiss={noop} />),
    Folded: card(<TransferRow title="Copying 48 files to Art" state="running" />, true),
  },
  variants: {},
  dos: [
    'Open the card when a transfer starts, and let it hide by itself a moment after everything has finished.',
    'Keep TransferIndicator in the top bar while anything is going, so a hidden card can come back.',
    'End each transfer with a toast that says the truth: how many went, how many were skipped.',
  ],
  donts: [
    'Don\'t stop a transfer when the card hides or folds.',
    'Don\'t decide a taken name silently; ask, and offer "Do this for the rest".',
  ],
};
