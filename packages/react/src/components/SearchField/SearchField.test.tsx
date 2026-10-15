import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('is a search box named by its placeholder, with a clear button once filled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<SearchField placeholder="Search Music" value="" onChange={onChange} />);
    expect(screen.getByRole('searchbox', { name: 'Search Music' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    rerender(<SearchField placeholder="Search Music" value="tide" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('clears on Escape without letting it through, and submits on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const outer = vi.fn();
    render(<div onKeyDown={(e) => e.key === 'Escape' && outer()}><SearchField placeholder="Search" value="tide" onChange={onChange} onSubmit={onSubmit} labels={{ clearSearch: 'Vaciar' }} /></div>);
    screen.getByRole('searchbox').focus();
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('tide');
    await user.keyboard('{Escape}');
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(outer).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Vaciar' })).toBeTruthy();
  });
});
