// For tests: what an element's tooltip says, read the way a person sees it (hover, then wait).
import { act, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TOOLTIP_DELAY } from '../components/Tooltip';

/** Hovers the element long enough for its tooltip, returns the tooltip's text (or null), and moves away. */
export function tooltipText(el: Element): string | null {
  vi.useFakeTimers();
  try {
    fireEvent.pointerEnter(el);
    act(() => void vi.advanceTimersByTime(TOOLTIP_DELAY));
    const text = screen.queryByRole('tooltip')?.textContent ?? null;
    fireEvent.pointerLeave(el);
    return text;
  } finally {
    vi.useRealTimers();
  }
}
