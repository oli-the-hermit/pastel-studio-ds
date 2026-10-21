import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormRow, ModalForm, Subform } from './FormLayout';

describe('ModalForm', () => {
  it('is a form that submits, or a div when the dialog saves through its own buttons', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container, rerender } = render(<ModalForm onSubmit={onSubmit} aria-label="Session"><button type="submit">Save</button></ModalForm>);
    expect(container.querySelector('form.ps-modal-form')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalled();
    rerender(<ModalForm as="div"><span>Fields</span></ModalForm>);
    expect(container.querySelector('div.ps-modal-form')).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
  });
});

describe('FormRow', () => {
  it('lays out a pair by default, the emoji layout on request, and can be spaced', () => {
    const { container, rerender } = render(<FormRow><span /><span /></FormRow>);
    expect(container.firstElementChild?.className).toBe('ps-form-row');
    rerender(<FormRow variant="emoji" spaced><span /><span /></FormRow>);
    expect(container.firstElementChild?.className).toBe('ps-form-row ps-form-row--emoji is-spaced');
  });
});

describe('Subform', () => {
  it('has a title, an action beside it, and its fields', () => {
    render(<Subform title="New reward" action={<button>Remove</button>}><input aria-label="Reward" /></Subform>);
    expect(screen.getByText('New reward')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Reward' })).toBeTruthy();
  });
});
