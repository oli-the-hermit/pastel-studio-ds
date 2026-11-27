import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBar, StatusCount } from './StatusBar';

describe('StatusBar', () => {
  it('reads its counts as a status and keeps the end slot apart', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<StatusBar ref={ref} end={<button type="button">List</button>}><span>24 items</span></StatusBar>);
    expect(screen.getByRole('status').textContent).toBe('24 items');
    expect(screen.getByRole('button', { name: 'List' }).closest('.ps-status-bar-end')).toBeTruthy();
    expect(ref.current?.className).toBe('ps-status-bar');
  });

  it('says a count with an icon, and reads it out in words', () => {
    render(
      <StatusBar>
        <StatusCount icon={<svg data-testid="video" />} label="12 videos">12</StatusCount>
        <StatusCount icon={<svg />} label="1,204 images">1,204</StatusCount>
      </StatusBar>
    );
    const counts = [...screen.getByRole('status').querySelectorAll('.ps-status-count')];
    expect(counts).toHaveLength(2);
    // What is seen: the icon and the number. What is read: the words.
    expect(counts[0].querySelector('.ps-status-count-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(counts[0].querySelector('.ps-status-count-icon svg')).toBeTruthy();
    expect([...counts[0].children].filter((el) => el.getAttribute('aria-hidden') !== 'true').map((el) => el.textContent)).toEqual(['12 videos']);
    expect(counts[1].querySelector('[aria-hidden="true"]:not(.ps-status-count-icon)')?.textContent).toBe('1,204');
  });
});
