import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBlockingOverlay } from './overlays';
import { useIdle } from './useIdle';

const pass = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const at = (screenX: number, screenY: number) => ({ screenX, screenY });

beforeEach(() => void vi.useFakeTimers());
afterEach(() => void vi.useRealTimers());

describe('useIdle', () => {
  it('is idle after a while without activity, and only while enabled', () => {
    const { result, rerender } = renderHook(({ enabled }) => useIdle(enabled, 1000), { initialProps: { enabled: true } });
    expect(result.current[0]).toBe(false);
    pass(999);
    expect(result.current[0]).toBe(false);
    pass(1);
    expect(result.current[0]).toBe(true);
    rerender({ enabled: false });
    expect(result.current[0]).toBe(false);
    pass(5000);
    expect(result.current[0]).toBe(false);
  });

  it('wakes on a key or a press, and counts again from there', () => {
    const { result } = renderHook(() => useIdle(true, 1000));
    pass(800);
    act(() => result.current[1]());
    pass(800);
    expect(result.current[0]).toBe(false);
    pass(200);
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('wakes on a move to somewhere else, sideways or up and down', () => {
    const { result } = renderHook(() => useIdle(true, 1000));
    act(() => result.current[2](at(100, 100)));
    pass(1000);
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](at(101, 100)));
    expect(result.current[0]).toBe(false);
    pass(1000);
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](at(101, 99)));
    expect(result.current[0]).toBe(false);
    // The count starts again at each real move.
    pass(800);
    act(() => result.current[2](at(140, 99)));
    pass(800);
    expect(result.current[0]).toBe(false);
  });

  it('does not wake on a move that did not move', () => {
    const { result } = renderHook(() => useIdle(true, 1000));
    act(() => result.current[2](at(100, 100)));
    // A stream of moves at the same place, as a web view sends over an embedded video.
    for (let i = 0; i < 9; i++) {
      pass(100);
      act(() => result.current[2](at(100, 100)));
    }
    expect(result.current[0]).toBe(false);
    pass(100);
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](at(100, 100)));
    expect(result.current[0]).toBe(true);
    pass(5000);
    act(() => result.current[2](at(100, 100)));
    expect(result.current[0]).toBe(true);
  });

  it('still wakes on a key or a press where the pointer rests', () => {
    const { result } = renderHook(() => useIdle(true, 1000));
    act(() => result.current[2](at(100, 100)));
    pass(1000);
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
    // The rest of the stream leaves that wake alone: it neither wakes nor holds the count back.
    pass(500);
    act(() => result.current[2](at(100, 100)));
    pass(500);
    expect(result.current[0]).toBe(true);
  });

  it('remembers where the pointer was while it is turned off', () => {
    const { result, rerender } = renderHook(({ enabled }) => useIdle(enabled, 1000), { initialProps: { enabled: true } });
    act(() => result.current[2](at(100, 100)));
    rerender({ enabled: false });
    rerender({ enabled: true });
    pass(600);
    act(() => result.current[2](at(100, 100)));
    pass(400);
    expect(result.current[0]).toBe(true);
  });

  it('takes pointer events as they come from an element', () => {
    function Player() {
      const [idle, wake, wakeOnMove] = useIdle(true, 1000);
      return <div data-testid="player" data-idle={idle} onPointerMove={wakeOnMove} onPointerDown={wake} onKeyDown={wake} />;
    }
    render(<Player />);
    const player = screen.getByTestId('player');
    const idle = () => player.dataset.idle;
    fireEvent.pointerMove(player, at(300, 200));
    pass(1000);
    expect(idle()).toBe('true');
    fireEvent.pointerMove(player, at(300, 200));
    expect(idle()).toBe('true');
    fireEvent.pointerMove(player, at(301, 200));
    expect(idle()).toBe('false');
    pass(1000);
    fireEvent.pointerDown(player, at(301, 200));
    expect(idle()).toBe('false');
    pass(1000);
    fireEvent.keyDown(player, { key: 'k' });
    expect(idle()).toBe('false');
  });

  it('is never idle while a menu or a dialog is open', () => {
    function Overlay() {
      useBlockingOverlay(true);
      return null;
    }
    const { result } = renderHook(() => useIdle(true, 1000));
    const overlay = render(<Overlay />);
    pass(5000);
    expect(result.current[0]).toBe(false);
    overlay.unmount();
    pass(1000);
    expect(result.current[0]).toBe(true);
  });
});
