import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CoverArt } from './CoverArt';

describe('CoverArt', () => {
  it('shows the image with its description', () => {
    render(<CoverArt src="cover.png" alt="Midnight Static cover" size="md" />);
    expect(screen.getByRole('img', { name: 'Midnight Static cover' }).tagName).toBe('IMG');
  });

  it('falls back to the placeholder, keeping the name, when there is no image or it fails', () => {
    const { rerender, container } = render(<CoverArt alt="Untitled" />);
    expect(screen.getByRole('img', { name: 'Untitled' }).className).toBe('ps-cover-art-placeholder');
    rerender(<CoverArt src="broken.png" alt="Untitled" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Untitled' })).toBeTruthy();
    rerender(<CoverArt src="other.png" alt="Untitled" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('other.png');
  });

  it('is decorative without alt', () => {
    const { container } = render(<CoverArt />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('.ps-cover-art-placeholder')?.getAttribute('aria-label')).toBeNull();
  });

  it('turns size, shape, loading and progress into classes, with a ring that follows progress', () => {
    const ref = createRef<HTMLDivElement>();
    render(<CoverArt ref={ref} size="sm" shape="round" loading progress={62} badge={<i>eq</i>} className="mine" />);
    expect(ref.current?.className).toBe('ps-cover-art ps-cover-art--sm ps-cover-art--round ps-cover-art--ringed is-loading mine');
    expect((ref.current?.querySelector('.ps-cover-art-ring-fill') as SVGElement).style.strokeDashoffset).toBe('38');
    expect(ref.current?.querySelector('.ps-cover-art-badge')?.textContent).toBe('eq');
  });
});
