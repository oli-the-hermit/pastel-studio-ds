import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelsProvider } from '../../labels';
import { WindowButton, WindowControls } from './WindowControls';

describe('WindowControls', () => {
  it('is a group of three named buttons that report what was pressed', async () => {
    const user = userEvent.setup();
    const onMinimize = vi.fn(), onToggleMaximize = vi.fn(), onClose = vi.fn();
    render(<WindowControls onMinimize={onMinimize} onToggleMaximize={onToggleMaximize} onClose={onClose} />);
    expect(screen.getByRole('group')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Minimize' }));
    await user.click(screen.getByRole('button', { name: 'Maximize' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onMinimize).toHaveBeenCalledOnce();
    expect(onToggleMaximize).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('turns the middle button into Restore while the window is maximized', () => {
    render(<WindowControls maximized onMinimize={() => {}} onToggleMaximize={() => {}} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Restore' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Maximize' })).toBeNull();
  });

  it('takes its words from the shared list or its own labels', () => {
    const { rerender } = render(
      <LabelsProvider labels={{ minimize: 'Minimizar', close: 'Cerrar' }}>
        <WindowControls onMinimize={() => {}} onToggleMaximize={() => {}} onClose={() => {}} />
      </LabelsProvider>
    );
    expect(screen.getByRole('button', { name: 'Minimizar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeTruthy();
    rerender(<WindowControls maximized labels={{ restore: 'Restaurar' }} onMinimize={() => {}} onToggleMaximize={() => {}} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Restaurar' })).toBeTruthy();
  });
});

describe('WindowButton', () => {
  it('names itself, is a plain button, and uses the name as its tooltip', () => {
    render(<WindowButton label="Pin"><svg /></WindowButton>);
    const button = screen.getByRole('button', { name: 'Pin' });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('title')).toBe('Pin');
  });

  it('is a toggle with aria-pressed and the active look only when pressed is given', () => {
    const { rerender } = render(<WindowButton label="Pin" size="sm" pressed><svg /></WindowButton>);
    let button = screen.getByRole('button', { name: 'Pin' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('is-active')).toBe(true);
    expect(button.classList.contains('ps-window-button--sm')).toBe(true);
    rerender(<WindowButton label="Pin" size="sm" pressed={false}><svg /></WindowButton>);
    button = screen.getByRole('button', { name: 'Pin' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList.contains('is-active')).toBe(false);
    rerender(<WindowButton label="Pin"><svg /></WindowButton>);
    expect(screen.getByRole('button', { name: 'Pin' }).hasAttribute('aria-pressed')).toBe(false);
  });

  it('marks the close button as danger', () => {
    render(<WindowButton danger label="Close"><svg /></WindowButton>);
    expect(screen.getByRole('button', { name: 'Close' }).classList.contains('ps-window-button--danger')).toBe(true);
  });
});
