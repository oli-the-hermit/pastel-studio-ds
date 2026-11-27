import React, { createRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Track } from '../../lib/types';
import { moveById } from '../SortableList';
import { TrackList } from './TrackList';

const t = (id: string, title: string, number: number): Track => ({ id, title, artist: 'Glass Harbor', duration: 200, number, album: 'Midnight Static' });
const tracks = [t('a', 'Signal Fires', 1), t('b', 'Low Tide Radio', 2), t('c', 'Northbound', 3)];
const noop = () => {};
const rows = () => screen.getAllByRole('listitem');

describe('TrackList', () => {
  it('lists named rows with their numbers and lengths, under a hidden header', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<TrackList ref={ref} ariaLabel="Midnight Static" tracks={tracks} onPlay={noop} />);
    expect(screen.getByRole('list', { name: 'Midnight Static' })).toBeTruthy();
    expect(rows().map((r) => r.getAttribute('aria-label'))).toEqual(['Signal Fires, Glass Harbor, 3:20', 'Low Tide Radio, Glass Harbor, 3:20', 'Northbound, Glass Harbor, 3:20']);
    expect(container.querySelector('.ps-track-list-head')?.getAttribute('aria-hidden')).toBe('true');
    expect(rows()[1].querySelector('.ps-track-list-num-text')?.textContent).toBe('2');
    expect(ref.current?.className).toBe('ps-track-list');
  });

  it('plays a row with a double click, Enter or its number button, and pauses the current one', async () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const user = userEvent.setup();
    render(<TrackList tracks={tracks} onPlay={onPlay} onPause={onPause} currentId="b" playing />);
    await user.dblClick(rows()[0]);
    rows()[2].focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Pause Low Tide Radio' }));
    expect(onPlay.mock.calls.map(([track]) => track.id)).toEqual(['a', 'c']);
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(rows()[1].getAttribute('aria-current')).toBe('true');
    expect(rows()[1].className).toContain('is-current');
  });

  it('likes from the heart and opens the row menu named for its track', async () => {
    const onLikedChange = vi.fn();
    const user = userEvent.setup();
    render(<TrackList tracks={tracks} onPlay={noop} likedIds={new Set(['a'])} onLikedChange={onLikedChange} rowActions={() => [{ key: 'q', label: 'Add to queue', onSelect: noop }]} />);
    expect(within(rows()[0]).getByRole('button', { name: 'Remove from Liked' }).className).toContain('ps-track-list-liked');
    await user.click(within(rows()[1]).getByRole('button', { name: 'Add to Liked' }));
    expect(onLikedChange).toHaveBeenCalledWith(tracks[1], true);
    await user.click(screen.getByRole('button', { name: 'More actions for Northbound' }));
    expect(screen.getByRole('menuitem', { name: 'Add to queue' })).toBeTruthy();
  });

  it('dims a track that is unavailable, says why, and calls onUnavailable in place of onPlay', async () => {
    const onPlay = vi.fn();
    const onUnavailable = vi.fn();
    const user = userEvent.setup();
    const missing: Track = { ...tracks[1], unavailable: "Can't find this file" };
    render(
      <TrackList tracks={[tracks[0], missing, tracks[2]]} onPlay={onPlay} onUnavailable={onUnavailable} columns={{ cover: true }} rowActions={() => [{ key: 'find', label: 'Find the file', onSelect: noop }]} />
    );
    const row = rows()[1];
    expect(row.className).toBe('ps-track-list-row is-unavailable');
    expect(rows()[0].className).toBe('ps-track-list-row');
    expect(row.getAttribute('aria-label')).toBe("Low Tide Radio, Glass Harbor, 3:20, Can't find this file");
    // The reason stands where the artist was, and there is no play button.
    expect(row.querySelector('.ps-track-info-meta')?.textContent).toBe("Can't find this file");
    expect(row.querySelector('.ps-track-list-num-play')).toBeNull();
    expect(row.querySelector('.ps-track-list-num-text')?.textContent).toBe('2');
    expect(rows()[0].querySelector('.ps-track-list-num-play')).toBeTruthy();
    await user.dblClick(row);
    row.focus();
    await user.keyboard('{Enter}');
    expect(onUnavailable.mock.calls.map(([track]) => track)).toEqual([missing, missing]);
    expect(onPlay).not.toHaveBeenCalled();
    // Its menu still opens.
    await user.click(screen.getByRole('button', { name: 'More actions for Low Tide Radio' }));
    expect(screen.getByRole('menuitem', { name: 'Find the file' })).toBeTruthy();
  });

  it('leaves an unavailable track alone when nothing handles it, and still moves it', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    function Playlist() {
      const [list, setList] = useState<Track[]>([{ ...tracks[0], unavailable: 'The drive is not connected' }, tracks[1], tracks[2]]);
      return <TrackList tracks={list} onPlay={onPlay} onReorder={(a, b) => setList((l) => moveById(l, a, b) ?? l)} />;
    }
    render(<Playlist />);
    await user.dblClick(rows()[0]);
    rows()[0].focus();
    await user.keyboard('{Enter}');
    expect(onPlay).not.toHaveBeenCalled();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(rows().map((r) => r.querySelector('.ps-track-info-title')?.textContent)).toEqual(['Low Tide Radio', 'Signal Fires', 'Northbound']);
    expect(rows()[1].className).toContain('is-unavailable');
  });

  it('turns columns into classes and reorders with Alt + arrows', async () => {
    const user = userEvent.setup();
    function Playlist() {
      const [list, setList] = useState(tracks);
      return <TrackList tracks={list} onPlay={noop} columns={{ album: true, added: true }} onReorder={(a, b) => setList((l) => moveById(l, a, b) ?? l)} />;
    }
    const { container } = render(<Playlist />);
    expect(container.firstElementChild?.className).toBe('ps-track-list ps-track-list--album ps-track-list--added ps-track-list--reorderable');
    rows()[0].focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(rows().map((r) => r.querySelector('.ps-track-info-title')?.textContent)).toEqual(['Low Tide Radio', 'Signal Fires', 'Northbound']);
  });
});
