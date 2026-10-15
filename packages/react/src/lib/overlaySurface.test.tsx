import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chip } from '../components/Chip';
import { IconButton } from '../components/IconButton';
import { MediaTime } from '../components/MediaTime';
import { PlayerControl } from '../components/PlayerControl';
import { Slider } from '../components/Slider';

// The pieces drawn on the see-through dock over video take a light look with surface="overlay".
describe('the overlay surface', () => {
  it('marks every dock piece', () => {
    const { container } = render(
      <>
        <PlayerControl label="Play" surface="overlay"><svg /></PlayerControl>
        <IconButton label="Close" surface="overlay"><svg /></IconButton>
        <Slider label="Seek" value={10} surface="overlay" />
        <MediaTime current={10} duration={60} surface="overlay" />
        <Chip tone="overlay">HD</Chip>
      </>
    );
    expect(screen.getByRole('button', { name: 'Play' }).className).toContain('is-on-overlay');
    expect(screen.getByRole('button', { name: 'Close' }).className).toContain('is-on-overlay');
    expect(container.querySelector('.ps-slider')?.className).toContain('is-on-overlay');
    expect(container.querySelector('.ps-media-time')?.className).toContain('is-on-overlay');
    expect(screen.getByText('HD').className).toBe('ps-chip ps-chip--overlay');
  });
});
