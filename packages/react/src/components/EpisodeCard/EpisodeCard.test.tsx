import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaRow } from '../MediaRow';
import { EpisodeCard } from './EpisodeCard';

const card = () => screen.getByRole('button');
const picture = () => card().querySelector('.ps-title-tile-picture')!;
const described = () => (card().getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean).map((id) => document.getElementById(id)?.textContent);

describe('EpisodeCard', () => {
  it('is a button named by its overline, title and length, and described by its summary', () => {
    render(<EpisodeCard title="Secrets" overline="Episode 3" length="48 min" summary="The ferry is late again." />);
    expect(screen.getByRole('button', { name: 'Episode 3 Secrets 48 min' })).toBe(card());
    expect(described()).toEqual(['The ferry is late again.']);
    expect(card().getAttribute('type')).toBe('button');
    expect(card().className).toBe('ps-episode-card');
    expect(screen.getByText('Episode 3').className).toBe('ps-episode-card-overline');
    expect(screen.getByText('48 min').className).toBe('ps-episode-card-length');
    expect(screen.getByText('Secrets').className).toBe('ps-episode-card-title');
    expect(screen.getByText('The ferry is late again.').className).toBe('ps-episode-card-summary');
    expect(card().hasAttribute('title')).toBe(false);
    expect(card().hasAttribute('aria-current')).toBe(false);
  });

  it('shows only what it is given', () => {
    const { rerender } = render(<EpisodeCard title="Secrets" />);
    expect(screen.getByRole('button', { name: 'Secrets' })).toBe(card());
    expect(card().hasAttribute('aria-describedby')).toBe(false);
    expect(Array.from(card().children, (el) => el.className)).toEqual(['ps-title-tile-picture', 'ps-episode-card-title']);
    rerender(<EpisodeCard title="Secrets" length="48 min" />);
    expect(screen.getByRole('button', { name: 'Secrets 48 min' })).toBe(card());
    expect(card().querySelector('.ps-episode-card-overline')).toBeNull();
  });

  it('takes a name and a description from outside in place of, and beside, its own', () => {
    const { rerender } = render(
      <>
        <span id="hint">Opens the player</span>
        <EpisodeCard title="Secrets" overline="Episode 3" summary="The ferry is late again." aria-label="Play Secrets" aria-describedby="hint" />
      </>
    );
    expect(screen.getByRole('button', { name: 'Play Secrets' })).toBe(card());
    expect(card().hasAttribute('aria-labelledby')).toBe(false);
    expect(described()).toEqual(['Opens the player', 'The ferry is late again.']);
    rerender(
      <>
        <span id="name">Next up</span>
        <EpisodeCard title="Secrets" overline="Episode 3" aria-labelledby="name" />
      </>
    );
    expect(screen.getByRole('button', { name: 'Next up' })).toBe(card());
  });

  it('shows the image as decoration, and the icon without one or when it fails', () => {
    const { rerender } = render(<EpisodeCard title="a" image="frame.jpg" icon={<svg data-testid="icon" />} />);
    const img = picture().querySelector('img')!;
    expect(img.getAttribute('src')).toBe('frame.jpg');
    expect(img.getAttribute('alt')).toBe('');
    expect(screen.queryByTestId('icon')).toBeNull();
    fireEvent.error(img);
    expect(picture().querySelector('img')).toBeNull();
    expect(screen.getByTestId('icon').parentElement?.className).toBe('ps-title-tile-icon');
    rerender(<EpisodeCard title="a" image="other.jpg" icon={<svg data-testid="icon" />} />);
    expect(picture().querySelector('img')?.getAttribute('src')).toBe('other.jpg');
    rerender(<EpisodeCard title="a" icon={<svg data-testid="icon" />} />);
    expect(picture().querySelector('img')).toBeNull();
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('draws the progress only above 0, and never past the ends', () => {
    const fill = () => picture().querySelector<HTMLElement>('.ps-title-tile-progress-fill');
    const { rerender } = render(<EpisodeCard title="a" />);
    expect(fill()).toBeNull();
    rerender(<EpisodeCard title="a" progress={0} />);
    expect(fill()).toBeNull();
    rerender(<EpisodeCard title="a" progress={0.4} />);
    expect(fill()?.style.width).toBe('40%');
    expect(picture().querySelector('.ps-title-tile-progress')?.getAttribute('aria-hidden')).toBe('true');
    rerender(<EpisodeCard title="a" progress={3} />);
    expect(fill()?.style.width).toBe('100%');
    rerender(<EpisodeCard title="a" progress={Number.NaN} />);
    expect(fill()).toBeNull();
  });

  it('names the watched check, so it is part of the name', () => {
    const { rerender } = render(<EpisodeCard title="Pilot" overline="Episode 1" watched />);
    expect(screen.getByRole('img', { name: 'Watched' }).className).toBe('ps-title-tile-watched');
    expect(screen.getByRole('button', { name: 'Episode 1 Pilot Watched' })).toBe(card());
    rerender(<EpisodeCard title="Pilot" overline="Episode 1" watched labels={{ watched: 'Visto' }} />);
    expect(screen.getByRole('button', { name: 'Episode 1 Pilot Visto' })).toBe(card());
    rerender(<EpisodeCard title="Pilot" overline="Episode 1" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('button', { name: 'Episode 1 Pilot' })).toBe(card());
  });

  it('marks the episode that is playing', () => {
    render(<EpisodeCard title="a" current />);
    expect(card().getAttribute('aria-current')).toBe('true');
    expect(card().className).toBe('ps-episode-card is-current');
  });

  it('says why it is unavailable in place of the summary, under a warning mark, and stays a button', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<EpisodeCard title="Secrets" overline="Episode 3" summary="The ferry is late again." image="frame.jpg" unavailable="Can't find this file" onClick={onClick} />);
    expect(screen.getByRole('button', { name: "Episode 3 Secrets Can't find this file" })).toBe(card());
    expect(card().className).toBe('ps-episode-card is-unavailable');
    expect(screen.getByText("Can't find this file").className).toBe('ps-episode-card-summary');
    expect(screen.queryByText('The ferry is late again.')).toBeNull();
    expect(card().hasAttribute('aria-describedby')).toBe(false);
    expect(picture().querySelector('.ps-title-tile-warning')?.getAttribute('aria-hidden')).toBe('true');
    expect((card() as HTMLButtonElement).disabled).toBe(false);
    await user.click(card());
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<EpisodeCard title="Secrets" overline="Episode 3" summary="The ferry is late again." image="frame.jpg" />);
    expect(card().className).toBe('ps-episode-card');
    expect(picture().querySelector('.ps-title-tile-warning')).toBeNull();
    expect(screen.getByText('The ferry is late again.')).toBeTruthy();
  });

  it('forwards its ref, className and other attributes, and is pressed with a click and the keyboard', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<EpisodeCard ref={ref} title="a" className="mine" data-episode-id="e1" tabIndex={-1} onClick={onClick} />);
    expect(ref.current).toBe(card());
    expect(card().className).toBe('ps-episode-card mine');
    expect(card().dataset.episodeId).toBe('e1');
    expect(card().tabIndex).toBe(-1);
    await user.click(card());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('takes its tab stop from a MediaRow, which moves between cards with the arrows', async () => {
    const user = userEvent.setup();
    render(
      <MediaRow title="Season 1">
        <EpisodeCard title="Pilot" overline="Episode 1" />
        <EpisodeCard title="Secrets" overline="Episode 2" />
        <EpisodeCard title="Tides" overline="Episode 3" />
      </MediaRow>
    );
    const cards = screen.getAllByRole('button').filter((el) => el.classList.contains('ps-episode-card'));
    expect(cards.map((el) => el.tabIndex)).toEqual([0, -1, -1]);
    cards[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(cards[1]);
    expect(cards.map((el) => el.tabIndex)).toEqual([-1, 0, -1]);
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(cards[2]);
  });
});
