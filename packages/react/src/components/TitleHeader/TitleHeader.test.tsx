import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TitleHeader } from './TitleHeader';

const header = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const part = (container: HTMLElement, name: string) => container.querySelector<HTMLElement>(`.ps-title-header-${name}`);

describe('TitleHeader', () => {
  it('is a header whose title is a heading, of level 2 unless told otherwise', () => {
    const { container, rerender } = render(<TitleHeader title="Harbour at dusk" />);
    expect(header(container).tagName).toBe('HEADER');
    expect(header(container).className).toBe('ps-title-header');
    expect(screen.getByRole('heading', { level: 2, name: 'Harbour at dusk' }).className).toBe('ps-title-header-title');
    expect(header(container).hasAttribute('title')).toBe(false);
    for (const level of [1, 3] as const) {
      rerender(<TitleHeader title="Harbour at dusk" headingLevel={level} />);
      expect(screen.getByRole('heading', { level, name: 'Harbour at dusk' })).toBeTruthy();
    }
  });

  it('shows only what it is given', () => {
    const { container } = render(<TitleHeader title="Harbour at dusk" />);
    expect(part(container, 'text')?.children).toHaveLength(1);
    expect(part(container, 'backdrop')).toBeNull();
    expect(part(container, 'poster')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('puts the overline above the title and joins the facts with a middle dot', () => {
    const { container, rerender } = render(<TitleHeader title="Harbour at dusk" overline="Film" facts={['2001', '1 h 52 min', 'Drama, Mystery']} summary="The ferry is late again." />);
    expect(screen.getByText('Film').className).toBe('ps-title-header-overline');
    expect(part(container, 'facts')?.textContent).toBe('2001 · 1 h 52 min · Drama, Mystery');
    expect(screen.getByText('The ferry is late again.').className).toBe('ps-title-header-summary');
    expect(Array.from(part(container, 'text')!.children, (el) => el.className)).toEqual([
      'ps-title-header-overline', 'ps-title-header-title', 'ps-title-header-facts', 'ps-title-header-summary',
    ]);
    rerender(<TitleHeader title="Harbour at dusk" facts={[]} />);
    expect(part(container, 'facts')).toBeNull();
  });

  it('shows the rating as a chip beside the facts, named by its label when it has one', () => {
    const { container, rerender } = render(<TitleHeader title="a" facts={['2001']} rating={{ value: '7.8', source: 'IMDb', label: 'IMDb rating 7.8 out of 10' }} />);
    const chip = screen.getByRole('img', { name: 'IMDb rating 7.8 out of 10' });
    expect(chip.className).toBe('ps-chip ps-title-header-rating');
    expect(chip.parentElement).toBe(part(container, 'facts'));
    expect(chip.textContent).toBe('IMDb 7.8');
    // Without a label it reads as its text.
    rerender(<TitleHeader title="a" rating={{ value: '7.8', source: 'IMDb' }} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(part(container, 'rating')?.hasAttribute('aria-label')).toBe(false);
    expect(part(container, 'facts')?.textContent).toBe('IMDb 7.8');
    rerender(<TitleHeader title="a" rating={{ value: '92%' }} />);
    expect(part(container, 'rating')?.textContent).toBe('92%');
    expect(part(container, 'rating-source')).toBeNull();
  });

  it('puts the backdrop behind as decoration, and is as without one when it fails', () => {
    const { container, rerender } = render(<TitleHeader title="a" backdrop="wide.jpg" />);
    expect(header(container).className).toBe('ps-title-header is-backdropped');
    const img = part(container, 'backdrop')!.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('wide.jpg');
    expect(img.getAttribute('alt')).toBe('');
    // Behind: before the text in the page, so the text is drawn over it.
    expect(header(container).firstElementChild).toBe(part(container, 'backdrop'));
    fireEvent.error(img);
    expect(header(container).className).toBe('ps-title-header');
    expect(part(container, 'backdrop')).toBeNull();
    rerender(<TitleHeader title="a" backdrop="other.jpg" />);
    expect(header(container).className).toBe('ps-title-header is-backdropped');
    expect(part(container, 'backdrop')?.querySelector('img')?.getAttribute('src')).toBe('other.jpg');
    rerender(<TitleHeader title="a" />);
    expect(part(container, 'backdrop')).toBeNull();
  });

  it('shows the poster beside the text, the icon in its place when it fails, and nothing with neither', () => {
    const { container, rerender } = render(<TitleHeader title="a" poster="poster.jpg" icon={<svg data-testid="icon" />} />);
    expect(header(container).className).toBe('ps-title-header ps-title-header--poster');
    const img = part(container, 'poster')!.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('poster.jpg');
    expect(img.getAttribute('alt')).toBe('');
    expect(screen.queryByTestId('icon')).toBeNull();
    fireEvent.error(img);
    expect(part(container, 'poster')?.querySelector('img')).toBeNull();
    expect(screen.getByTestId('icon').parentElement?.className).toBe('ps-title-header-icon');
    expect(header(container).className).toBe('ps-title-header ps-title-header--poster');
    // The same address again is still the one that failed; another one is shown.
    rerender(<TitleHeader title="a" poster="poster.jpg" />);
    expect(part(container, 'poster')).toBeNull();
    expect(header(container).className).toBe('ps-title-header');
    rerender(<TitleHeader title="a" poster="other.jpg" />);
    expect(part(container, 'poster')?.querySelector('img')?.getAttribute('src')).toBe('other.jpg');
    rerender(<TitleHeader title="a" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('keeps the two pictures apart: one failing does not take the other with it', () => {
    const { container } = render(<TitleHeader title="a" backdrop="wide.jpg" poster="poster.jpg" />);
    fireEvent.error(part(container, 'backdrop')!.querySelector('img')!);
    expect(part(container, 'backdrop')).toBeNull();
    expect(part(container, 'poster')?.querySelector('img')?.getAttribute('src')).toBe('poster.jpg');
  });

  it('renders the actions, then the last line under them', () => {
    const { container } = render(
      <TitleHeader title="a" summary="s" actions={<button type="button">Play</button>}>
        <a href="#more">More like this</a>
      </TitleHeader>
    );
    expect(screen.getByRole('button', { name: 'Play' }).parentElement?.className).toBe('ps-title-header-actions');
    expect(screen.getByRole('link', { name: 'More like this' }).parentElement?.className).toBe('ps-title-header-note');
    expect(Array.from(part(container, 'text')!.children, (el) => el.className).slice(-2)).toEqual(['ps-title-header-actions', 'ps-title-header-note']);
  });

  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLElement>();
    render(<TitleHeader ref={ref} title="a" className="mine" data-title-id="t1" aria-label="About the film" />);
    expect(ref.current?.className).toBe('ps-title-header mine');
    expect(ref.current?.dataset.titleId).toBe('t1');
    expect(ref.current?.getAttribute('aria-label')).toBe('About the film');
  });
});
