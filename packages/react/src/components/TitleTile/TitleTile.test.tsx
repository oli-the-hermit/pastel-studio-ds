import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TitleGrid, TitleTile } from './TitleTile';

const tile = () => screen.getByRole('button');
const picture = () => tile().querySelector('.ps-title-tile-picture')!;

describe('TitleTile', () => {
  it('is a button named by its title and subtitle', () => {
    render(<TitleTile title="Polar Nights" subtitle="Aurora Collective · 9 songs" />);
    expect(screen.getByRole('button', { name: 'Polar Nights Aurora Collective · 9 songs' })).toBe(tile());
    expect(tile().getAttribute('type')).toBe('button');
    expect(tile().className).toBe('ps-title-tile');
    expect(screen.getByText('Polar Nights').className).toBe('ps-title-tile-title');
    expect(screen.getByText('Aurora Collective · 9 songs').className).toBe('ps-title-tile-subtitle');
    expect(tile().hasAttribute('title')).toBe(false);
    expect(tile().hasAttribute('aria-current')).toBe(false);
  });

  it('leaves the second line out without a subtitle', () => {
    render(<TitleTile title="Polar Nights" />);
    expect(tile().querySelector('.ps-title-tile-subtitle')).toBeNull();
  });

  it('turns its shape into a class', () => {
    const { rerender } = render(<TitleTile title="a" shape="cover" />);
    expect(tile().className).toBe('ps-title-tile');
    for (const shape of ['poster', 'wide', 'round'] as const) {
      rerender(<TitleTile title="a" shape={shape} />);
      expect(tile().className).toBe(`ps-title-tile ps-title-tile--${shape}`);
    }
  });

  it('shows the image as decoration, and the icon without one or when it fails', () => {
    const { rerender } = render(<TitleTile title="a" image="cover.jpg" icon={<svg data-testid="icon" />} />);
    const img = picture().querySelector('img')!;
    expect(img.getAttribute('src')).toBe('cover.jpg');
    expect(img.getAttribute('alt')).toBe('');
    expect(screen.queryByTestId('icon')).toBeNull();
    fireEvent.error(img);
    expect(picture().querySelector('img')).toBeNull();
    expect(screen.getByTestId('icon').parentElement?.className).toBe('ps-title-tile-icon');
    rerender(<TitleTile title="a" image="other.jpg" icon={<svg data-testid="icon" />} />);
    expect(picture().querySelector('img')?.getAttribute('src')).toBe('other.jpg');
    rerender(<TitleTile title="a" icon={<svg data-testid="icon" />} />);
    expect(picture().querySelector('img')).toBeNull();
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('draws the progress only above 0, and never past the ends', () => {
    const fill = () => picture().querySelector<HTMLElement>('.ps-title-tile-progress-fill');
    const { rerender } = render(<TitleTile title="a" />);
    expect(fill()).toBeNull();
    rerender(<TitleTile title="a" progress={0} />);
    expect(fill()).toBeNull();
    rerender(<TitleTile title="a" progress={0.4} />);
    expect(fill()?.style.width).toBe('40%');
    expect(picture().querySelector('.ps-title-tile-progress')?.getAttribute('aria-hidden')).toBe('true');
    rerender(<TitleTile title="a" progress={3} />);
    expect(fill()?.style.width).toBe('100%');
    rerender(<TitleTile title="a" progress={-1} />);
    expect(fill()).toBeNull();
    rerender(<TitleTile title="a" progress={Number.NaN} />);
    expect(fill()).toBeNull();
  });

  it('names the watched check, so it is part of the name', () => {
    const { rerender } = render(<TitleTile title="Pilot" watched />);
    expect(screen.getByRole('img', { name: 'Watched' }).className).toBe('ps-title-tile-watched');
    expect(screen.getByRole('button', { name: 'Watched Pilot' })).toBe(tile());
    rerender(<TitleTile title="Pilot" watched labels={{ watched: 'Visto' }} />);
    expect(screen.getByRole('img', { name: 'Visto' })).toBeTruthy();
    rerender(<TitleTile title="Pilot" />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('marks the title that is playing', () => {
    render(<TitleTile title="a" current shape="poster" />);
    expect(tile().getAttribute('aria-current')).toBe('true');
    expect(tile().className).toBe('ps-title-tile ps-title-tile--poster is-current');
  });

  it('forwards its ref, className and other attributes, and is pressed with a click and the keyboard', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<TitleTile ref={ref} title="a" className="mine" data-tile-id="a1" onClick={onClick} />);
    expect(ref.current).toBe(tile());
    expect(tile().className).toBe('ps-title-tile mine');
    expect(tile().dataset.tileId).toBe('a1');
    await user.click(tile());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe('TitleGrid', () => {
  it('is a named list with one item around each tile', () => {
    render(
      <TitleGrid aria-label="Albums">
        <TitleTile title="One" />
        {false}
        {null}
        <TitleTile title="Two" />
      </TitleGrid>
    );
    const list = screen.getByRole('list', { name: 'Albums' });
    expect(list.className).toBe('ps-title-grid');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.parentElement === list && item.className === 'ps-title-grid-item')).toBe(true);
    expect(items.map((item) => item.firstElementChild)).toEqual(screen.getAllByRole('button'));
  });

  it('keeps its tiles in place by their keys', () => {
    const tiles = (ids: string[]) => ids.map((id) => <TitleTile key={id} title={id} />);
    const { rerender } = render(<TitleGrid>{tiles(['a', 'b', 'c'])}</TitleGrid>);
    const b = screen.getByRole('button', { name: 'b' });
    rerender(<TitleGrid>{tiles(['c', 'b'])}</TitleGrid>);
    expect(screen.getByRole('button', { name: 'b' })).toBe(b);
    expect(screen.getAllByRole('button').map((el) => el.textContent?.trim())).toEqual(['c', 'b']);
  });

  it('is wider for wide tiles, and forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLUListElement>();
    const { rerender } = render(<TitleGrid ref={ref} shape="wide" className="mine" data-id="7" />);
    expect(ref.current?.className).toBe('ps-title-grid ps-title-grid--wide mine');
    expect(ref.current?.dataset.id).toBe('7');
    for (const shape of ['cover', 'poster', 'round'] as const) {
      rerender(<TitleGrid ref={ref} shape={shape} />);
      expect(ref.current?.className).toBe('ps-title-grid');
    }
  });
});
