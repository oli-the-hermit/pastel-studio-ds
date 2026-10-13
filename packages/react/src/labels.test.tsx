import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LabelsProvider, useLabels, type Labels } from './labels';

// The shared list is empty until the first component adds a word, so these tests bring their own.
type Words = Record<string, string>;
const asLabels = (words: Words) => words as Partial<Labels>;

function Word({ name, labels }: { name: string; labels?: Words }) {
  const words = useLabels(labels && asLabels(labels)) as Words;
  return <span data-testid={name}>{words[name] ?? 'none'}</span>;
}

const shown = (name: string) => screen.getByTestId(name).textContent;

describe('labels', () => {
  it('gives the defaults when nothing overrides them', () => {
    render(<Word name="close" />);
    expect(shown('close')).toBe('none');
  });

  it('takes a word from the provider', () => {
    render(<LabelsProvider labels={asLabels({ close: 'Cerrar' })}><Word name="close" /></LabelsProvider>);
    expect(shown('close')).toBe('Cerrar');
  });

  it("lets a component's own labels win over the provider, for that component only", () => {
    render(
      <LabelsProvider labels={asLabels({ close: 'Cerrar', cancel: 'Cancelar' })}>
        <Word name="close" labels={{ close: 'Tancar' }} />
        <Word name="cancel" labels={{ close: 'Tancar' }} />
      </LabelsProvider>
    );
    expect(shown('close')).toBe('Tancar');
    expect(shown('cancel')).toBe('Cancelar');
  });

  it('nests: an inner provider replaces some words and inherits the rest', () => {
    render(
      <LabelsProvider labels={asLabels({ close: 'Cerrar', cancel: 'Cancelar' })}>
        <LabelsProvider labels={asLabels({ close: 'Tancar' })}>
          <Word name="close" />
          <Word name="cancel" />
        </LabelsProvider>
      </LabelsProvider>
    );
    expect(shown('close')).toBe('Tancar');
    expect(shown('cancel')).toBe('Cancelar');
  });
});
