import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ariaKeyShortcuts, Tooltip, TOOLTIP_DELAY, TruncatedText } from './Tooltip';

const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const tip = () => screen.queryByRole('tooltip');

function Toolbar() {
  return (
    <div>
      <Tooltip label="Cut" shortcut="Ctrl+X">
        <button>A</button>
      </Tooltip>
      <Tooltip label="Labels" description="Tag the selection">
        <button>B</button>
      </Tooltip>
    </div>
  );
}

describe('Tooltip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows only after the pointer rests on the element', () => {
    render(<Toolbar />);
    fireEvent.pointerEnter(screen.getByText('A'));
    wait(TOOLTIP_DELAY - 50);
    expect(tip()).toBeNull();
    wait(50);
    expect(tip()?.textContent).toBe('CutCtrl+X');
  });

  it('never shows for touch, nor when the pointer leaves first', () => {
    render(<Toolbar />);
    fireEvent.pointerEnter(screen.getByText('A'), { pointerType: 'touch' });
    wait(TOOLTIP_DELAY);
    expect(tip()).toBeNull();
    fireEvent.pointerEnter(screen.getByText('A'));
    wait(200);
    fireEvent.pointerLeave(screen.getByText('A'));
    wait(TOOLTIP_DELAY);
    expect(tip()).toBeNull();
  });

  it('shows one at a time, and the next one at once while warm', () => {
    render(<Toolbar />);
    fireEvent.pointerEnter(screen.getByText('A'));
    wait(TOOLTIP_DELAY);
    fireEvent.pointerLeave(screen.getByText('A'));
    fireEvent.pointerEnter(screen.getByText('B'));
    wait(0);
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(tip()?.textContent).toBe('LabelsTag the selection');
  });

  it('hides on a press, on Escape and on scroll', () => {
    render(<Toolbar />);
    const a = screen.getByText('A');
    fireEvent.pointerEnter(a);
    wait(TOOLTIP_DELAY);
    fireEvent.pointerDown(a);
    expect(tip()).toBeNull();
    fireEvent.pointerEnter(a);
    wait(TOOLTIP_DELAY);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(tip()).toBeNull();
    fireEvent.pointerEnter(a);
    wait(TOOLTIP_DELAY);
    fireEvent.scroll(document);
    expect(tip()).toBeNull();
  });

  it('shows on keyboard focus and hides on blur', () => {
    render(<Toolbar />);
    // A key press first: focus that follows a pointer press isn't keyboard focus.
    fireEvent.keyDown(document.body, { key: 'Tab' });
    act(() => screen.getByText('B').focus());
    wait(TOOLTIP_DELAY);
    expect(tip()).not.toBeNull();
    act(() => screen.getByText('B').blur());
    expect(tip()).toBeNull();
  });

  it('describes the element with its line, and sets its shortcut', () => {
    render(<Toolbar />);
    expect(screen.getByText('A').getAttribute('aria-keyshortcuts')).toBe('Control+X');
    const b = screen.getByText('B');
    fireEvent.pointerEnter(b);
    wait(TOOLTIP_DELAY);
    expect(document.getElementById(b.getAttribute('aria-describedby')!)?.textContent).toBe('Tag the selection');
  });

  it('TruncatedText shows only when its text is cut off', () => {
    const { rerender } = render(<TruncatedText>short.jpg</TruncatedText>);
    fireEvent.pointerEnter(screen.getByText('short.jpg'));
    wait(TOOLTIP_DELAY);
    expect(tip()).toBeNull();
    const el = screen.getByText('short.jpg');
    Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 300 });
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 100 });
    rerender(<TruncatedText>short.jpg</TruncatedText>);
    fireEvent.pointerLeave(el);
    fireEvent.pointerEnter(el);
    wait(TOOLTIP_DELAY);
    expect(tip()?.textContent).toBe('short.jpg');
  });
});

describe('ariaKeyShortcuts', () => {
  it('spells keys the way aria-keyshortcuts wants them', () => {
    expect(ariaKeyShortcuts('Ctrl+Shift+N')).toBe('Control+Shift+N');
    expect(ariaKeyShortcuts('Del')).toBe('Delete');
    expect(ariaKeyShortcuts('F5 / Ctrl+R')).toBe('F5 Control+R');
    expect(ariaKeyShortcuts(undefined)).toBeUndefined();
  });
});
