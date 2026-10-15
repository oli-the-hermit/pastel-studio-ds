import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LabelsProvider } from '../../labels';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is a status named Loading that keeps turning with reduced motion', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} size="lg" className="mine" />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBe(ref.current);
    expect(ref.current?.className).toBe('ps-spinner ps-spinner--lg mine');
    expect(ref.current?.querySelector('svg')?.hasAttribute('data-ps-keep-motion')).toBe(true);
  });

  it('takes its word from the provider or its own labels', () => {
    const { rerender } = render(<LabelsProvider labels={{ loading: 'Cargando' }}><Spinner /></LabelsProvider>);
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeTruthy();
    rerender(<Spinner labels={{ loading: 'Buffering' }} />);
    expect(screen.getByRole('status', { name: 'Buffering' })).toBeTruthy();
  });
});
