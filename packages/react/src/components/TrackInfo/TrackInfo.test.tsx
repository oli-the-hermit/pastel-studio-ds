import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrackInfo } from './TrackInfo';

describe('TrackInfo', () => {
  it('shows the title over artist, album and year, with the full title as tooltip', () => {
    const { container } = render(<TrackInfo title="Signal Fires" artist="Glass Harbor" album="Midnight Static" year={2026} />);
    const title = container.querySelector('.ps-track-info-title')!;
    expect(title.tagName).toBe('SPAN');
    expect(title.getAttribute('title')).toBe('Signal Fires');
    expect(container.querySelector('.ps-track-info-meta')?.textContent).toBe('Glass Harbor·Midnight Static·2026');
  });

  it('names the explicit mark and makes the title a heading when asked', () => {
    render(<TrackInfo title="Copper Lights" explicit headingLevel={3} labels={{ explicit: 'Explícito' }} />);
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Copper Lights');
    expect(screen.getByRole('img', { name: 'Explícito' })).toBeTruthy();
  });

  it('turns artist and album into buttons when they lead somewhere', async () => {
    const onArtist = vi.fn();
    const onAlbum = vi.fn();
    const user = userEvent.setup();
    render(<TrackInfo title="Low Tide Radio" artist="Glass Harbor" album="Midnight Static" onArtistClick={onArtist} onAlbumClick={onAlbum} />);
    await user.click(screen.getByRole('button', { name: 'Glass Harbor' }));
    await user.click(screen.getByRole('button', { name: 'Midnight Static' }));
    expect(onArtist).toHaveBeenCalledTimes(1);
    expect(onAlbum).toHaveBeenCalledTimes(1);
  });

  it('turns size and align into classes, leaves out an empty meta line, and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<TrackInfo ref={ref} title="Northbound" size="lg" align="center" className="mine" />);
    expect(ref.current?.className).toBe('ps-track-info ps-track-info--lg ps-track-info--center mine');
    expect(container.querySelector('.ps-track-info-meta')).toBeNull();
  });
});
