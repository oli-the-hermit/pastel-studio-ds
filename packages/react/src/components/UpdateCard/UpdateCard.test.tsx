import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UpdateCard } from './UpdateCard';

describe('UpdateCard', () => {
  it('is an aside named by its title, with the icon, the text and the actions', () => {
    const { container } = render(
      <UpdateCard title="Version 1.4.0 is ready" icon={<svg />} actions={<button>Install</button>}>
        <p>New: notes.</p>
      </UpdateCard>
    );
    expect(screen.getByRole('complementary', { name: 'Version 1.4.0 is ready' })).toBeTruthy();
    expect(container.querySelector('.ps-update-card-icon svg')).toBeTruthy();
    expect(screen.getByText('New: notes.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Install' })).toBeTruthy();
  });

  it('leaves out the icon tile and the actions when there are none, and forwards the ref', () => {
    const ref = React.createRef<HTMLElement>();
    const { container } = render(<UpdateCard ref={ref} title="Downloading" data-tour="update" />);
    expect(container.querySelector('.ps-update-card-icon')).toBeNull();
    expect(container.querySelector('.ps-update-card-actions')).toBeNull();
    expect(ref.current?.getAttribute('data-tour')).toBe('update');
  });
});
