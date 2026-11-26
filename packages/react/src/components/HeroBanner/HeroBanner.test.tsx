import React, { createRef, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroBanner, type HeroBannerItem } from './HeroBanner';

const items: HeroBannerItem[] = [
  {
    id: 'a',
    overline: 'Continue watching',
    title: 'Polar Nights',
    facts: ['Season 1 · Episode 3', '48 min'],
    summary: 'A winter at the station.',
    image: 'polar.jpg',
    actions: <button type="button">Play Polar Nights</button>,
  },
  { id: 'b', title: 'Orchard', actions: <button type="button">Play Orchard</button> },
  { id: 'c', title: 'Tidal' },
];
const many = (count: number): HeroBannerItem[] => Array.from({ length: count }, (_, i) => ({ id: `i${i}`, title: `Title ${i + 1}` }));

const banner = () => screen.getByRole('region');
const slide = () => screen.getByRole('group');
const title = () => screen.getByRole('heading').textContent;
const arrow = (name: string) => screen.queryByRole('button', { name }) as HTMLButtonElement | null;
const dots = () => Array.from(banner().querySelectorAll('.ps-hero-banner-dot')).map((dot) => dot.classList.contains('is-current'));

/** Says whether the system asks for reduced motion, as a browser would. */
function reducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query, addEventListener: () => {}, removeEventListener: () => {} }));
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('HeroBanner', () => {
  it('is a named carousel that shows one item, as a group named by its place', () => {
    render(<HeroBanner ariaLabel="Suggested" items={items} />);
    expect(screen.getByRole('region', { name: 'Suggested' })).toBe(banner());
    expect(banner().getAttribute('aria-roledescription')).toBe('carousel');
    expect(banner().className).toBe('ps-hero-banner is-pictured');
    expect(screen.getAllByRole('group')).toHaveLength(1);
    expect(slide().getAttribute('aria-label')).toBe('1 of 3');
    expect(screen.getByRole('heading', { level: 2, name: 'Polar Nights' })).toBeTruthy();
    expect(screen.getByText('Continue watching').className).toBe('ps-hero-banner-overline');
    expect(screen.getByText('Season 1 · Episode 3 · 48 min').className).toBe('ps-hero-banner-facts');
    expect(screen.getByText('A winter at the station.').className).toBe('ps-hero-banner-summary');
    expect(screen.getByRole('button', { name: 'Play Polar Nights' }).parentElement?.className).toBe('ps-hero-banner-actions');
    const img = banner().querySelector('img')!;
    expect(img.getAttribute('src')).toBe('polar.jpg');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('leaves out what an item does not have', () => {
    render(<HeroBanner ariaLabel="Suggested" items={[{ id: 'c', title: 'Tidal', facts: [] }]} headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Tidal' })).toBeTruthy();
    expect(banner().className).toBe('ps-hero-banner');
    expect(banner().querySelector('img, .ps-hero-banner-overline, .ps-hero-banner-facts, .ps-hero-banner-summary, .ps-hero-banner-actions')).toBeNull();
  });

  it('drops a picture that fails to load', () => {
    render(<HeroBanner ariaLabel="Suggested" items={items} />);
    fireEvent.error(banner().querySelector('img')!);
    expect(banner().querySelector('img')).toBeNull();
    expect(banner().className).toBe('ps-hero-banner');
  });

  it('has no dots and no arrows with one item, and draws nothing with none', () => {
    const { rerender, container } = render(<HeroBanner ariaLabel="Suggested" items={[items[0]]} />);
    expect(arrow('Previous')).toBeNull();
    expect(arrow('Next')).toBeNull();
    expect(dots()).toEqual([]);
    expect(slide().getAttribute('aria-label')).toBe('1 of 1');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Play Polar Nights' }), { key: 'ArrowRight' });
    expect(title()).toBe('Polar Nights');
    rerender(<HeroBanner ariaLabel="Suggested" items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('moves with Previous and Next, round and round, and the dots follow', async () => {
    const onIndexChange = vi.fn();
    const user = userEvent.setup();
    render(<HeroBanner ariaLabel="Suggested" items={items} onIndexChange={onIndexChange} />);
    expect(dots()).toEqual([true, false, false]);
    expect(banner().querySelector('.ps-hero-banner-dots')?.getAttribute('aria-hidden')).toBe('true');
    expect(arrow('Next')!.getAttribute('aria-controls')).toBe(banner().querySelector('.ps-hero-banner-slides')!.id);

    await user.click(arrow('Next')!);
    expect(title()).toBe('Orchard');
    expect(slide().getAttribute('aria-label')).toBe('2 of 3');
    expect(dots()).toEqual([false, true, false]);
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    await user.click(arrow('Next')!);
    await user.click(arrow('Next')!);
    expect(title()).toBe('Polar Nights');
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    await user.click(arrow('Previous')!);
    expect(title()).toBe('Tidal');
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
  });

  it('shows at most six items', async () => {
    const user = userEvent.setup();
    render(<HeroBanner ariaLabel="Suggested" items={many(8)} />);
    expect(dots()).toHaveLength(6);
    expect(slide().getAttribute('aria-label')).toBe('1 of 6');
    await user.click(arrow('Previous')!);
    expect(title()).toBe('Title 6');
  });

  it('follows the index it is given, kept inside the items', async () => {
    const onIndexChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<HeroBanner ariaLabel="Suggested" items={items} index={1} onIndexChange={onIndexChange} />);
    expect(title()).toBe('Orchard');
    await user.click(arrow('Next')!);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(title()).toBe('Orchard');
    rerender(<HeroBanner ariaLabel="Suggested" items={items} index={2} onIndexChange={onIndexChange} />);
    expect(title()).toBe('Tidal');
    rerender(<HeroBanner ariaLabel="Suggested" items={items} index={9} onIndexChange={onIndexChange} />);
    expect(title()).toBe('Tidal');
    rerender(<HeroBanner ariaLabel="Suggested" items={items} index={-2} onIndexChange={onIndexChange} />);
    expect(title()).toBe('Polar Nights');
  });

  it('changes item with ← and → while the focus is in it, and keeps the focus there', async () => {
    const user = userEvent.setup();
    render(<HeroBanner ariaLabel="Suggested" items={items} />);
    screen.getByRole('button', { name: 'Play Polar Nights' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(title()).toBe('Orchard');
    // The button that had the focus left with its item: the banner takes it, and the keys go on.
    expect(document.activeElement).toBe(banner());
    await user.keyboard('{ArrowRight}');
    expect(title()).toBe('Tidal');
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(title()).toBe('Tidal');
    arrow('Next')!.focus();
    await user.keyboard('{ArrowLeft}');
    expect(title()).toBe('Orchard');
    expect(document.activeElement).toBe(arrow('Next'));
  });

  it('leaves the arrow keys to a field inside it, and to a handler that took them', async () => {
    const user = userEvent.setup();
    const withField: HeroBannerItem[] = [{ id: 'a', title: 'One', actions: <input aria-label="Search" /> }, { id: 'b', title: 'Two' }];
    const { rerender } = render(<HeroBanner ariaLabel="Suggested" items={withField} />);
    screen.getByRole('textbox').focus();
    await user.keyboard('{ArrowRight}');
    expect(title()).toBe('One');
    rerender(<HeroBanner ariaLabel="Suggested" items={withField} onKeyDown={(e) => e.preventDefault()} />);
    arrow('Next')!.focus();
    await user.keyboard('{ArrowRight}');
    expect(title()).toBe('One');
  });

  it('reads out an item shown by hand, and keeps quiet while it advances by itself', () => {
    vi.useFakeTimers();
    const { rerender } = render(<HeroBanner ariaLabel="Suggested" items={items} />);
    const live = () => banner().querySelector('.ps-hero-banner-slides')!.getAttribute('aria-live');
    expect(live()).toBe('polite');
    rerender(<HeroBanner ariaLabel="Suggested" items={items} autoAdvance={8000} />);
    expect(live()).toBe('off');
    fireEvent.pointerEnter(banner());
    expect(live()).toBe('polite');
  });

  it('advances by itself every so often, round and round, and not at all by default', () => {
    vi.useFakeTimers();
    const { rerender } = render(<HeroBanner ariaLabel="Suggested" items={items} />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(title()).toBe('Polar Nights');
    rerender(<HeroBanner ariaLabel="Suggested" items={items} autoAdvance={8000} />);
    act(() => void vi.advanceTimersByTime(7999));
    expect(title()).toBe('Polar Nights');
    act(() => void vi.advanceTimersByTime(1));
    expect(title()).toBe('Orchard');
    act(() => void vi.advanceTimersByTime(8000));
    expect(title()).toBe('Tidal');
    act(() => void vi.advanceTimersByTime(8000));
    expect(title()).toBe('Polar Nights');
    rerender(<HeroBanner ariaLabel="Suggested" items={items} autoAdvance={false} />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(title()).toBe('Polar Nights');
  });

  it('waits while the pointer is over it, and starts the count again when it leaves', () => {
    vi.useFakeTimers();
    render(<HeroBanner ariaLabel="Suggested" items={items} autoAdvance={8000} />);
    act(() => void vi.advanceTimersByTime(6000));
    fireEvent.pointerEnter(banner());
    act(() => void vi.advanceTimersByTime(60000));
    expect(title()).toBe('Polar Nights');
    fireEvent.pointerLeave(banner());
    act(() => void vi.advanceTimersByTime(7999));
    expect(title()).toBe('Polar Nights');
    act(() => void vi.advanceTimersByTime(1));
    expect(title()).toBe('Orchard');
  });

  it('waits while the focus is in it', () => {
    vi.useFakeTimers();
    render(<><HeroBanner ariaLabel="Suggested" items={items} autoAdvance={8000} /><button type="button">Outside</button></>);
    act(() => screen.getByRole('button', { name: 'Play Polar Nights' }).focus());
    act(() => void vi.advanceTimersByTime(60000));
    expect(title()).toBe('Polar Nights');
    // From one button to another inside it: still in the banner.
    act(() => arrow('Next')!.focus());
    act(() => void vi.advanceTimersByTime(60000));
    expect(title()).toBe('Polar Nights');
    act(() => screen.getByRole('button', { name: 'Outside' }).focus());
    act(() => void vi.advanceTimersByTime(8000));
    expect(title()).toBe('Orchard');
  });

  it('starts the count again after a move by hand', () => {
    vi.useFakeTimers();
    render(<HeroBanner ariaLabel="Suggested" items={items} autoAdvance={8000} />);
    act(() => void vi.advanceTimersByTime(6000));
    fireEvent.click(arrow('Next')!);
    expect(title()).toBe('Orchard');
    act(() => void vi.advanceTimersByTime(7999));
    expect(title()).toBe('Orchard');
    act(() => void vi.advanceTimersByTime(1));
    expect(title()).toBe('Tidal');
  });

  it('never advances by itself with reduced motion', () => {
    vi.useFakeTimers();
    reducedMotion(true);
    render(<HeroBanner ariaLabel="Suggested" items={items} autoAdvance={8000} />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(title()).toBe('Polar Nights');
    expect(banner().querySelector('.ps-hero-banner-slides')!.getAttribute('aria-live')).toBe('polite');
  });

  it('asks a controlled banner for the next item when it is time', () => {
    vi.useFakeTimers();
    function Controlled({ onChange }: { onChange: (i: number) => void }) {
      const [i, setI] = useState(2);
      return <HeroBanner ariaLabel="Suggested" items={items} autoAdvance={5000} index={i} onIndexChange={(next) => { onChange(next); setI(next); }} />;
    }
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    act(() => void vi.advanceTimersByTime(5000));
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(title()).toBe('Polar Nights');
  });

  it('takes its words from labels, and forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLElement>();
    render(
      <HeroBanner
        ref={ref}
        ariaLabel="Sugerencias"
        items={items}
        className="mine"
        data-id="7"
        labels={{ previous: 'Anterior', next: 'Siguiente', carousel: 'carrusel', slideOf: '{current} de {total}' }}
      />
    );
    expect(ref.current).toBe(banner());
    expect(banner().className).toBe('ps-hero-banner is-pictured mine');
    expect(banner().dataset.id).toBe('7');
    expect(banner().getAttribute('aria-roledescription')).toBe('carrusel');
    expect(slide().getAttribute('aria-label')).toBe('1 de 3');
    expect(arrow('Anterior')).toBeTruthy();
    expect(arrow('Siguiente')).toBeTruthy();
  });
});
