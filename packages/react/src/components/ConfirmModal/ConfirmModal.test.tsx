import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelsProvider } from '../../labels';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal', () => {
  it('asks, gives the danger action focus, and confirms then closes', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(), onClose = vi.fn();
    render(<ConfirmModal message="Delete Errands?" onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByText('Delete Errands?')).toBeTruthy();
    const del = screen.getByRole('button', { name: 'Delete' });
    expect(document.activeElement).toBe(del);
    await user.click(del);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('cancels without confirming', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(), onClose = vi.fn();
    render(<ConfirmModal message="Reset?" confirmLabel="Reset" onConfirm={onConfirm} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy();
  });

  it('takes its words from the shared list', () => {
    render(<LabelsProvider labels={{ cancel: 'Cancelar', delete: 'Eliminar' }}><ConfirmModal message="?" onConfirm={() => {}} onClose={() => {}} /></LabelsProvider>);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeTruthy();
  });
});
