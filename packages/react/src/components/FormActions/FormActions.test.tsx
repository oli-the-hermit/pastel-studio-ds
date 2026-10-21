import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormActions } from './FormActions';

describe('FormActions', () => {
  it('shows Cancel only once the form is edited', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { rerender } = render(<FormActions dirty={false} onCancel={onCancel} primaryLabel="Save" onPrimary={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    rerender(<FormActions dirty onCancel={onCancel} primaryLabel="Save" onPrimary={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('submits the form when it has no onPrimary, and runs onPrimary when it has one', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { rerender } = render(<form onSubmit={onSubmit}><FormActions dirty={false} onCancel={() => {}} primaryLabel="Save" /></form>);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('submit');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalled();
    const onPrimary = vi.fn();
    rerender(<form onSubmit={onSubmit}><FormActions dirty={false} onCancel={() => {}} primaryLabel="Save" onPrimary={onPrimary} /></form>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onPrimary).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('can disable the main action and put something at the left', () => {
    const { container } = render(<FormActions dirty={false} onCancel={() => {}} primaryLabel="Save" primaryDisabled leading={<button>Delete</button>} />);
    expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector('.ps-form-actions-leading')?.textContent).toBe('Delete');
  });
});
