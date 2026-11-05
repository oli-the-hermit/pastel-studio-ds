import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('is a button named by its title and described by its description', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ListRow icon={<svg />} title="Keyboard shortcuts" description="Every key the app knows" onClick={onClick} />);
    const row = screen.getByRole('button', { name: 'Keyboard shortcuts', description: 'Every key the app knows' });
    await user.click(row);
    expect(onClick).toHaveBeenCalled();
  });

  it('marks a row that leaves the app', () => {
    const { container } = render(<ListRow icon={<svg />} title="Report a problem" external />);
    expect(container.querySelectorAll('.ps-list-row-trail svg')).toHaveLength(1);
  });
});
