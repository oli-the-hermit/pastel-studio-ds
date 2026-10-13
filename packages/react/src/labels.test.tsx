import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defaultLabels, LabelsProvider, useLabels, type LabelOverrides, type Labels } from './labels';

function Word({ name, labels }: { name: keyof Labels; labels?: LabelOverrides<keyof Labels> }) {
  return <span data-testid={name}>{useLabels(labels)[name]}</span>;
}

const shown = (name: keyof Labels) => screen.getByTestId(name).textContent;

describe('labels', () => {
  it('gives the defaults when nothing overrides them', () => {
    render(<Word name="close" />);
    expect(shown('close')).toBe(defaultLabels.close);
  });

  it('takes a word from the provider and keeps the rest', () => {
    render(<LabelsProvider labels={{ close: 'Cerrar' }}><Word name="close" /><Word name="copy" /></LabelsProvider>);
    expect(shown('close')).toBe('Cerrar');
    expect(shown('copy')).toBe(defaultLabels.copy);
  });

  it("lets a component's own labels win over the provider, for that component only", () => {
    render(
      <LabelsProvider labels={{ close: 'Cerrar', copy: 'Copiar' }}>
        <Word name="close" labels={{ close: 'Tancar' }} />
        <Word name="copy" labels={{ close: 'Tancar' }} />
      </LabelsProvider>
    );
    expect(shown('close')).toBe('Tancar');
    expect(shown('copy')).toBe('Copiar');
  });

  it('nests: an inner provider replaces some words and inherits the rest', () => {
    render(
      <LabelsProvider labels={{ close: 'Cerrar', copy: 'Copiar' }}>
        <LabelsProvider labels={{ close: 'Tancar' }}>
          <Word name="close" />
          <Word name="copy" />
        </LabelsProvider>
      </LabelsProvider>
    );
    expect(shown('close')).toBe('Tancar');
    expect(shown('copy')).toBe('Copiar');
  });
});
