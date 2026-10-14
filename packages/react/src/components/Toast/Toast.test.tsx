import React, { createRef } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast, ToastRegion } from './Toast';
import { useToasts } from './useToasts';

describe('Toast', () => {
  it('shows its message with an icon, and its tone as a class', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Toast ref={ref} tone="warning" message="2 tasks have no date" className="mine" />);
    expect(ref.current?.className).toBe('ps-toast is-warning mine');
    expect(ref.current?.querySelector('.ps-toast-message')?.textContent).toBe('2 tasks have no date');
    expect(ref.current?.querySelector('.ps-toast-icon svg')).toBeTruthy();
    expect(ref.current?.querySelector('.ps-toast-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('interrupts only for errors', () => {
    const { rerender } = render(<Toast tone="success" message="Saved" />);
    expect(screen.queryByRole('alert')).toBeNull();
    rerender(<Toast tone="error" message="Couldn't save" />);
    expect(screen.getByRole('alert').textContent).toBe('Couldn\'t save');
  });

  it('marks a toast that is leaving', () => {
    render(<Toast tone="info" message="Ready" leaving />);
    expect(screen.getByText('Ready').parentElement?.className).toBe('ps-toast is-info is-leaving');
  });
});

describe('ToastRegion', () => {
  it('is a polite live region with one toast per item', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ToastRegion
        ref={ref}
        className="mine"
        toasts={[{ id: 'a', message: 'Saved', tone: 'success' }, { id: 'b', message: 'Ready', tone: 'info', leaving: true }]}
      />
    );
    expect(screen.getByRole('status')).toBe(ref.current);
    expect(ref.current?.getAttribute('aria-live')).toBe('polite');
    expect(ref.current?.className).toBe('ps-toast-region mine');
    expect(Array.from(ref.current!.children).map((toast) => toast.className)).toEqual(['ps-toast is-success', 'ps-toast is-info is-leaving']);
  });
});

describe('useToasts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast, success by default, then lets it slide out and removes it', () => {
    const { result } = renderHook(() => useToasts());
    act(() => result.current.showToast('Saved'));
    act(() => result.current.showToast('Couldn\'t save', 'error'));
    expect(result.current.toasts.map(({ message, tone, leaving }) => [message, tone, leaving])).toEqual([
      ['Saved', 'success', undefined],
      ['Couldn\'t save', 'error', undefined],
    ]);
    expect(new Set(result.current.toasts.map((t) => t.id)).size).toBe(2);

    act(() => vi.advanceTimersByTime(3500));
    expect(result.current.toasts.every((t) => t.leaving)).toBe(true);
    act(() => vi.runOnlyPendingTimers());
    expect(result.current.toasts).toEqual([]);
  });

  it('stops its timers when the component goes away', () => {
    const { result, unmount } = renderHook(() => useToasts());
    act(() => result.current.showToast('Saved'));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
