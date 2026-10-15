import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, FormError, FormHint, TextArea, TextInput } from './Field';

describe('Field', () => {
  it('labels a single TextInput or TextArea it wires itself', () => {
    render(
      <>
        <Field label="List name"><TextInput /></Field>
        <Field label="Notes"><TextArea /></Field>
      </>
    );
    expect(screen.getByRole('textbox', { name: 'List name' }).className).toBe('ps-input');
    expect(screen.getByRole('textbox', { name: 'Notes' }).className).toBe('ps-input ps-input--area');
  });

  it('keeps an id the control already has, and points at the one given in htmlFor', () => {
    render(
      <>
        <Field label="Name"><TextInput id="name" /></Field>
        <Field label="Sound" htmlFor="sound"><select id="sound" /></Field>
      </>
    );
    expect(screen.getByLabelText('Name').id).toBe('name');
    expect(screen.getByLabelText('Sound').id).toBe('sound');
  });

  it('links its hint to the control', () => {
    render(<Field label="Daily goal" hint="In minutes of focus."><TextInput aria-describedby="other" /></Field>);
    const input = screen.getByRole('textbox');
    const hint = screen.getByText('In minutes of focus.');
    expect(hint.className).toBe('ps-field-hint');
    expect(input.getAttribute('aria-describedby')).toBe(`other ${hint.id}`);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows an error instead of the hint: linked, invalid, and announced', () => {
    render(<Field label="List name" hint="Short and clear." error="Give the list a name."><TextInput /></Field>);
    const input = screen.getByRole('textbox');
    const error = screen.getByRole('alert');
    expect(error.textContent).toBe('Give the list a name.');
    expect(error.className).toBe('ps-field-error');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByText('Short and clear.')).toBeNull();
  });

  it('names a group with plain text, adds a label hint, and spaces itself', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Field ref={ref} label="Repeat on" labelHint="Optional" group spaced className="mine"><button>Mon</button></Field>);
    expect(ref.current?.className).toBe('ps-field ps-field--spaced mine');
    expect(ref.current?.querySelector('label')).toBeNull();
    expect(ref.current?.querySelector('.ps-field-label')?.textContent).toBe('Repeat on Optional');
  });
});

describe('TextInput, TextArea, FormHint, FormError', () => {
  it('forward their refs and attributes', () => {
    const input = createRef<HTMLInputElement>();
    const area = createRef<HTMLTextAreaElement>();
    render(
      <>
        <TextInput ref={input} className="mine" placeholder="Name" />
        <TextArea ref={area} rows={3} />
        <FormHint>Stored on this device.</FormHint>
        <FormError>Couldn&apos;t save.</FormError>
      </>
    );
    expect(input.current?.type).toBe('text');
    expect(input.current?.className).toBe('ps-input mine');
    expect(area.current?.rows).toBe(3);
    expect(screen.getByText('Stored on this device.').className).toBe('ps-field-hint');
    expect(screen.getByRole('alert').textContent).toBe('Couldn\'t save.');
  });
});
