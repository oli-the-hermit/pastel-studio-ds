import React, { useState } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Track } from '../../lib/types';
import { moveById } from '../SortableList';
import { PlayQueue } from './PlayQueue';

const t = (id: string, title: string, duration = 180): Track => ({ id, title, artist: 'Glass Harbor', duration });
const current = t('c', 'Signal Fires');
const next = [t('a', 'Low Tide Radio', 240), t('b', 'Northbound', 300)];
const noop = () => {};

function Queue({ onPlay = noop }: { onPlay?: (track: Track) => void }) {
  const [upNext, setUpNext] = useState(next);
  return (
    <PlayQueue
      current={current}
      playing
      upNext={upNext}
      source="Midnight Static"
      onPlay={onPlay}
      onRemove={(track) => setUpNext((l) => l.filter((x) => x.id !== track.id))}
      onReorder={(a, b) => setUpNext((l) => moveById(l, a, b) ?? l)}
      onClear={() => setUpNext([])}
    />
  );
}

const upNextTitles = () => within(screen.getByRole('region', { name: 'Up next' })).getAllByRole('listitem').map((li) => li.querySelector('.ps-track-info-title')?.textContent);

describe('PlayQueue', () => {
  it('is an aside named Queue with now playing and up next, and the remaining length', () => {
    render(<Queue />);
    expect(screen.getByRole('complementary', { name: 'Queue' })).toBeTruthy();
    const now = within(screen.getByRole('region', { name: 'Now playing' })).getByRole('listitem');
    expect(now.getAttribute('aria-current')).toBe('true');
    expect(screen.getByText('Next from Midnight Static')).toBeTruthy();
    expect(screen.getByText(/9 min/)).toBeTruthy();
    expect(upNextTitles()).toEqual(['Low Tide Radio', 'Northbound']);
  });

  it('plays a row with a click or Enter, and removes one with its tool', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    render(<Queue onPlay={onPlay} />);
    const rows = within(screen.getByRole('region', { name: 'Up next' })).getAllByRole('listitem');
    await user.click(rows[0]);
    rows[1].focus();
    await user.keyboard('{Enter}');
    expect(onPlay.mock.calls.map(([track]) => track.id)).toEqual(['a', 'b']);
    await user.click(screen.getByRole('button', { name: 'Remove from queue: Low Tide Radio' }));
    expect(upNextTitles()).toEqual(['Northbound']);
    expect(onPlay).toHaveBeenCalledTimes(2);
  });

  it('reorders up next with Alt + arrows', async () => {
    const user = userEvent.setup();
    render(<Queue />);
    within(screen.getByRole('region', { name: 'Up next' })).getAllByRole('listitem')[0].focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(upNextTitles()).toEqual(['Northbound', 'Low Tide Radio']);
  });

  it('says where a track went after a move from the keyboard', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Queue />);
    const status = screen.getByRole('status');
    expect(status.className).toBe('ps-visually-hidden');
    expect(status.textContent).toBe('');
    within(screen.getByRole('region', { name: 'Up next' })).getAllByRole('listitem')[0].focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(status.textContent).toBe('Moved to position 2 of 2');
    // The row that moved has the focus again by the next frame.
    await act(() => new Promise<void>((done) => requestAnimationFrame(() => done())));
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(status.textContent).toBe('Moved to position 1 of 2');
    unmount();
    // A queue that can't be reordered has nothing to announce.
    render(<PlayQueue upNext={next} onPlay={noop} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('dims an unavailable track, says why, and calls onUnavailable in place of onPlay', async () => {
    const onPlay = vi.fn();
    const onUnavailable = vi.fn();
    const onRemove = vi.fn();
    const onReorder = vi.fn();
    const user = userEvent.setup();
    const missing: Track = { ...next[0], unavailable: "Can't find this file" };
    const { rerender } = render(<PlayQueue upNext={[missing, next[1]]} onPlay={onPlay} onUnavailable={onUnavailable} onRemove={onRemove} onReorder={onReorder} />);
    const [row, other] = within(screen.getByRole('region', { name: 'Up next' })).getAllByRole('listitem');
    expect(row.className).toContain('is-unavailable');
    expect(other.className).not.toContain('is-unavailable');
    // The reason stands where the artist was, so it is read with the title.
    expect(row.querySelector('.ps-track-info-meta')?.textContent).toBe("Can't find this file");
    await user.click(row);
    row.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onUnavailable.mock.calls.map(([track]) => track)).toEqual([missing, missing, missing]);
    expect(onPlay).not.toHaveBeenCalled();
    // It can still be moved and removed.
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(onReorder).toHaveBeenCalledWith('a', 'b');
    await user.click(screen.getByRole('button', { name: 'Remove from queue: Low Tide Radio' }));
    expect(onRemove).toHaveBeenCalledWith(missing);
    expect(onUnavailable).toHaveBeenCalledTimes(3);
    // The same in the history, and for the track that is loaded; without a handler nothing happens.
    rerender(<PlayQueue current={missing} upNext={[]} history={[missing]} onPlay={onPlay} tab="history" />);
    await user.click(within(screen.getByRole('list', { name: 'History' })).getByRole('listitem'));
    rerender(<PlayQueue current={missing} upNext={[]} onPlay={onPlay} onUnavailable={onUnavailable} tab="next" />);
    await user.click(within(screen.getByRole('region', { name: 'Now playing' })).getByRole('listitem'));
    expect(onUnavailable).toHaveBeenCalledTimes(4);
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('switches to the history, and says when it or the queue is empty', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PlayQueue upNext={[]} onPlay={noop} />);
    expect(screen.getByText('Nothing queued. Add songs with "Add to queue".')).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: 'History' }));
    expect(screen.getByText('Songs you play show up here.')).toBeTruthy();
    rerender(<PlayQueue upNext={[]} history={[current]} onPlay={noop} tab="history" />);
    expect(screen.getByRole('list', { name: 'History' })).toBeTruthy();
  });

  it('shows the queue menu and the autoplay switch only when asked', async () => {
    const onAutoplay = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<PlayQueue upNext={next} onPlay={noop} />);
    expect(screen.queryByRole('button', { name: 'Queue actions' })).toBeNull();
    expect(screen.queryByRole('switch')).toBeNull();
    rerender(<PlayQueue upNext={next} onPlay={noop} onClear={noop} autoplay={{ value: false, onChange: onAutoplay }} onClose={noop} />);
    expect(screen.getByRole('button', { name: 'Queue actions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close queue' })).toBeTruthy();
    await user.click(screen.getByRole('switch', { name: /Autoplay/ }));
    expect(onAutoplay).toHaveBeenCalledWith(true);
  });
});
