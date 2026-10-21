import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tour, type TourStep } from './Tour';

const steps = (onShow = vi.fn()): TourStep[] => [
  { id: 'welcome', kind: 'welcome', title: 'Welcome', body: 'A quick look.' },
  { id: 'play', kind: 'spot', chapter: 'player', target: 'play', title: 'Play', body: 'Starts and stops.', onShow },
  { id: 'gone', kind: 'spot', chapter: 'player', target: 'not-here', title: 'Gone', body: 'Not on screen.' },
  { id: 'done', kind: 'done', title: 'All set', body: 'Enjoy.' },
];
const chapters = [{ key: 'player', label: 'Player' }];

// jsdom lays nothing out: give the target a size so the tour can spotlight it.
const box = { width: 120, height: 40, top: 100, left: 100, right: 220, bottom: 140, x: 100, y: 100, toJSON: () => ({}) };

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const target = document.createElement('button');
  target.setAttribute('data-tour', 'play');
  target.getBoundingClientRect = () => box as DOMRect;
  target.scrollIntoView = () => {};
  document.body.appendChild(target);
});
afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll('[data-tour]').forEach((el) => el.remove());
});

describe('Tour', () => {
  it('opens as a named modal dialog on the welcome card, with the app\'s mark', () => {
    render(<Tour open steps={steps()} chapters={chapters} onClose={() => {}} mark={<svg data-testid="mark" />} />);
    expect(screen.getByRole('dialog', { name: 'Tour' }).getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeTruthy();
    expect(screen.getByTestId('mark')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show me around' })).toBeTruthy();
  });

  it('shows nothing while closed', () => {
    render(<Tour open={false} steps={steps()} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('moves to a spot step, shows its page first, and counts it in its chapter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onShow = vi.fn();
    render(<Tour open steps={steps(onShow)} chapters={chapters} onClose={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Show me around' }));
    expect(onShow).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Play' })).toBeTruthy();
    expect(screen.getByText('Player')).toBeTruthy();
    expect(screen.getByText('1 of 2')).toBeTruthy();
  });

  it('skips a step whose target is not on screen', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Tour open steps={steps()} chapters={chapters} onClose={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Show me around' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(screen.getByRole('heading', { name: 'All set' })).toBeTruthy();
  });

  it('closes from Maybe later, from Escape, and from the last button', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onClose = vi.fn();
    const { rerender } = render(<Tour open steps={steps()} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Maybe later' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
    rerender(<Tour open steps={[steps()[3]]} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('moves with the arrow keys and takes its words from labels', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Tour open steps={steps()} chapters={chapters} onClose={() => {}} labels={{ next: 'Siguiente' }} />);
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: 'Play' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeTruthy();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeTruthy();
  });
});
