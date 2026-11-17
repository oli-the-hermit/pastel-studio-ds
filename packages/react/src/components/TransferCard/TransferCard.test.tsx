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
    render(
      <TransferRow
        title="Copying 10 files to Art"
        state="waiting"
        conflict={{ name: 'beach.png', incoming: { size: 2048 }, existing: { size: 1024 }, remaining: 4 }}
        onResolve={onResolve}
      />
    );
    expect(screen.getByRole('group', { name: '"beach.png" is already there' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onResolve).toHaveBeenLastCalledWith('skip', false);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Do this for the rest (4)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep both' }));
    expect(onResolve).toHaveBeenLastCalledWith('keep_both', true);
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
