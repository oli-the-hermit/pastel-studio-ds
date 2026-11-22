import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { formatTimeLeft } from '../../lib/format';
import { TransferCard, TransferIndicator, TransferRow } from './TransferCard';

const GB = 1024 ** 3;

describe('TransferRow', () => {
  it('says how much of how much, the percent, the time left and the speed, and can be stopped', async () => {
    const onStop = vi.fn();
    render(
      <TransferRow
        title="Copying 48 files to Art"
        state="running"
        current="beach.png"
        doneBytes={2.6 * GB}
        totalBytes={4.1 * GB}
        bytesPerSecond={38 * 1024 ** 2}
        secondsLeft={170}
        onStop={onStop}
      />
    );
    expect(screen.getByRole('progressbar', { name: 'Copying 48 files to Art' }).getAttribute('aria-valuenow')).toBe('63');
    expect(screen.getByText(/2\.6 GB of 4\.1 GB · 63% · 3 min left · 38 MB\/s/)).toBeTruthy();
    expect(screen.getByText('beach.png')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalled();
  });

  it('waits in line, or counts, with a sweeping bar', () => {
    const { rerender } = render(<TransferRow title="Moving 3 files to Raw" state="queued" />);
    expect(screen.getByText('Waiting…')).toBeTruthy();
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
    rerender(<TransferRow title="Moving 3 files to Raw" state="sizing" />);
    expect(screen.getByText('Counting…')).toBeTruthy();
  });

  it('asks about a taken name, with the choice for the rest', async () => {
    const onResolve = vi.fn();
    const beach = { name: 'beach.png', path: 'E:/Art/beach.png', incoming: { size: 2048 }, existing: { size: 1024 }, remaining: 4 };
    const { rerender } = render(<TransferRow title="Copying 10 files to Art" state="waiting" conflict={beach} onResolve={onResolve} />);
    expect(screen.getByRole('group', { name: '"beach.png" is already there' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onResolve).toHaveBeenLastCalledWith('skip', false, beach);
    const dune = { name: 'dune.png', path: 'E:/Art/dune.png', incoming: { size: 2048 }, existing: { size: 1024 }, remaining: 3 };
    rerender(<TransferRow title="Copying 10 files to Art" state="waiting" conflict={dune} onResolve={onResolve} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Do this for the rest (3)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep both' }));
    expect(onResolve).toHaveBeenLastCalledWith('keep_both', true, dune);
  });

  it('answers each question once, so a double click never answers the next one unseen', async () => {
    const onResolve = vi.fn();
    const first = { name: 'a.png', path: 'E:/Art/a.png', incoming: { size: 2 }, existing: { size: 1 }, remaining: 2 };
    const { rerender } = render(<TransferRow title="Moving 3 files to Art" state="waiting" conflict={first} onResolve={onResolve} />);
    await userEvent.dblClick(screen.getByRole('button', { name: 'Replace' }));
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button', { name: 'Skip' }) as HTMLButtonElement).disabled).toBe(true);
    // The next question has its buttons back, and "for the rest" unticked.
    await userEvent.click(screen.getByRole('checkbox', { name: 'Do this for the rest (2)' }));
    const second = { name: 'b.png', path: 'E:/Art/b.png', incoming: { size: 2 }, existing: { size: 1 }, remaining: 1 };
    rerender(<TransferRow title="Moving 3 files to Art" state="waiting" conflict={second} onResolve={onResolve} />);
    expect((screen.getByRole('button', { name: 'Skip' }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('checkbox', { name: 'Do this for the rest (1)' }) as HTMLInputElement).checked).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onResolve).toHaveBeenLastCalledWith('skip', false, second);
  });

  it('gives the buttons back when the answer could not be sent', async () => {
    const onResolve = vi.fn(() => Promise.reject(new Error('offline')));
    const conflict = { name: 'a.png', incoming: { size: 2 }, existing: { size: 1 } };
    render(<TransferRow title="Moving 1 file to Art" state="waiting" conflict={conflict} onResolve={onResolve} />);
    await userEvent.click(screen.getByRole('button', { name: 'Replace' }));
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button', { name: 'Replace' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('when finished, says how it went and lists what went wrong on demand', async () => {
    const onDismiss = vi.fn();
    render(<TransferRow title="Copying 5 files to Art" state="done" result="4 copied, 1 skipped" errors={['old.png: in use']} onDismiss={onDismiss} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText('4 copied, 1 skipped')).toBeTruthy();
    expect(screen.queryByText('old.png: in use')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /What went wrong/ }));
    expect(screen.getByText('old.png: in use')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('TransferRow retry', () => {
  it('offers Retry on a row where something went wrong, with the reason in view', async () => {
    const onRetry = vi.fn();
    render(<TransferRow title="Moving 3 files to Art" state="failed" result="2 moved, 1 failed" errors={['clip.mp4 is open in another program']} onRetry={onRetry} />);
    expect(screen.getByText('clip.mp4 is open in another program')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no Retry while running, or when nothing went wrong', () => {
    const { rerender } = render(<TransferRow title="Moving" state="running" errors={['x']} onRetry={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    rerender(<TransferRow title="Moving" state="done" result="Done" onRetry={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    rerender(<TransferRow title="Moving" state="done" result="1 failed" errors={['x: in use']} onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.getByText('x: in use')).toBeTruthy();
  });
});

describe('TransferCard', () => {
  it('folds to its header and hides, with the count of what is going', async () => {
    const onCollapsedChange = vi.fn();
    const onHide = vi.fn();
    const { rerender } = render(
      <TransferCard activeCount={2} collapsed={false} onCollapsedChange={onCollapsedChange} onHide={onHide} onClearFinished={() => {}}>
        <TransferRow title="Copying" state="running" />
      </TransferCard>
    );
    expect(screen.getByRole('region', { name: 'Transfers' })).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Make smaller' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    rerender(
      <TransferCard activeCount={2} collapsed onCollapsedChange={onCollapsedChange} onHide={onHide}>
        <TransferRow title="Copying" state="running" />
      </TransferCard>
    );
    expect(screen.queryByText('Copying')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(onHide).toHaveBeenCalled();
  });
});

describe('TransferIndicator', () => {
  it('is a named button showing the count, its ring following the progress', () => {
    const { container, rerender } = render(<TransferIndicator label="Transfers" count={3} progress={0.5} />);
    expect(screen.getByRole('button', { name: 'Transfers' }).textContent).toBe('3');
    const fill = container.querySelector('.ps-transfer-indicator-fill')!;
    const half = Number(fill.getAttribute('stroke-dashoffset'));
    rerender(<TransferIndicator label="Transfers" count={3} progress={1} />);
    expect(Number(fill.getAttribute('stroke-dashoffset'))).toBeLessThan(half);
    rerender(<TransferIndicator label="Transfers" count={1} attention />);
    expect(screen.getByRole('button').className).toContain('is-indeterminate');
    expect(screen.getByRole('button').className).toContain('is-attention');
  });
});

describe('formatTimeLeft', () => {
  it('rounds the way a person says it', () => {
    expect(formatTimeLeft(3)).toBe('5 sec');
    expect(formatTimeLeft(41)).toBe('45 sec');
    expect(formatTimeLeft(170)).toBe('3 min');
    expect(formatTimeLeft(4320)).toBe('1 hr 12 min');
  });
});
