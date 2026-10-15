import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('reads its counts as a status and keeps the end slot apart', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<StatusBar ref={ref} end={<button type="button">List</button>}><span>24 items</span></StatusBar>);
    expect(screen.getByRole('status').textContent).toBe('24 items');
    expect(screen.getByRole('button', { name: 'List' }).closest('.ps-status-bar-end')).toBeTruthy();
    expect(ref.current?.className).toBe('ps-status-bar');
  });
});
