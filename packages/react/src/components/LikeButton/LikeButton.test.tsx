import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LikeButton } from './LikeButton';

describe('LikeButton', () => {
  it('is a toggle named for what a press does', async () => {
    const onLikedChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const user = userEvent.setup();
    const { rerender } = render(<LikeButton ref={ref} liked={false} onLikedChange={onLikedChange} />);
    const button = screen.getByRole('button', { name: 'Add to Liked' });
    expect(ref.current).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.className).toBe('ps-player-control ps-player-control--ghost ps-player-control--sm ps-like-button');
    await user.click(button);
    expect(onLikedChange).toHaveBeenCalledWith(true);
    rerender(<LikeButton liked onLikedChange={onLikedChange} size="md" />);
    expect(screen.getByRole('button', { name: 'Remove from Liked' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button').className).toBe('ps-player-control ps-player-control--ghost is-on ps-like-button');
  });
});
