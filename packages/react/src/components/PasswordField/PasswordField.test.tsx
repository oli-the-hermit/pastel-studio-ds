import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PasswordField, type PasswordFieldProps } from './PasswordField';

function Controlled(props: Partial<PasswordFieldProps>) {
  const [value, setValue] = useState('');
  return <PasswordField label="Password" value={value} onChange={setValue} {...props} />;
}

describe('PasswordField', () => {
  it('is a password input named by its label, hidden to start with', () => {
    render(<PasswordField label="Password" value="" onChange={() => {}} autoComplete="current-password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(input.getAttribute('autocomplete')).toBe('current-password');
    expect(input.getAttribute('spellcheck')).toBe('false');
  });

  it('reports what is typed as a string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordField label="Password" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Password'), 'x');
    expect(onChange).toHaveBeenLastCalledWith('x');
  });

  it('shows the password and hides it again, the button naming what it will do', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    await user.type(input, 'tide');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input.type).toBe('text');
    expect(input.value).toBe('tide');
    const hide = screen.getByRole('button', { name: 'Hide password' });
    expect(hide.getAttribute('aria-controls')).toBe(input.id);
    await user.click(hide);
    expect(input.type).toBe('password');
  });

  it('starts shown with defaultShown', () => {
    render(<PasswordField label="Password" value="tide" onChange={() => {}} defaultShown />);
    expect((screen.getByLabelText('Password') as HTMLInputElement).type).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });

  it('links its hint, or its error instead, to the input', () => {
    const { rerender } = render(<PasswordField label="New password" value="" onChange={() => {}} hint="At least 8 characters." />);
    const input = screen.getByLabelText('New password');
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe('At least 8 characters.');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    rerender(<PasswordField label="New password" value="abc" onChange={() => {}} hint="At least 8 characters." error="Too short." />);
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe('Too short.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Too short.');
  });

  it('disables its button with the field, and takes its words from labels', () => {
    render(<PasswordField label="Contraseña" value="" onChange={() => {}} disabled labels={{ showPassword: 'Mostrar contraseña' }} />);
    expect((screen.getByRole('button', { name: 'Mostrar contraseña' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
