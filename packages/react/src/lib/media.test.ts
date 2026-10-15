import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { formatTime } from './format';
import { useMediaElement } from './media';

describe('formatTime', () => {
  it('writes minutes and seconds, and hours when there are any', () => {
    expect(formatTime(7)).toBe('0:07');
    expect(formatTime(245)).toBe('4:05');
    expect(formatTime(3729)).toBe('1:02:09');
    expect(formatTime(-3)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
  });
});

describe('useMediaElement', () => {
  it('reads the element on its events and drives it with the actions', () => {
    const el = document.createElement('audio');
    Object.defineProperty(el, 'duration', { value: 200 });
    el.play = vi.fn(() => Promise.resolve());
    el.pause = vi.fn();
    const ref = { current: el };
    const { result } = renderHook(() => useMediaElement(ref));
    expect(result.current.duration).toBe(200);
    expect(result.current.playing).toBe(false);

    act(() => result.current.seek(250));
    expect(el.currentTime).toBe(200);
    act(() => result.current.skip(-30));
    expect(el.currentTime).toBe(170);
    act(() => {
      result.current.setVolume(0.4);
      el.dispatchEvent(new Event('volumechange'));
    });
    expect(result.current.volume).toBeCloseTo(0.4);
    act(() => result.current.toggle());
    expect(el.play).toHaveBeenCalled();
    act(() => result.current.setVolume(0));
    expect(el.muted).toBe(true);
  });
});
