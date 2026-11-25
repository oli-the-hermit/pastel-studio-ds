import React, { useLayoutEffect } from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useZoomPan, type ZoomPan } from './useZoomPan';

describe('useZoomPan', () => {
  // Every scale the viewer was drawn with, in order.
  function Viewer({ item, drawn, api }: { item: string; drawn: number[]; api: { current?: ZoomPan } }) {
    const zoom = useZoomPan({ content: { width: 400, height: 300 }, resetKey: item });
    api.current = zoom;
    useLayoutEffect(() => {
      drawn.push(zoom.state.scale);
    });
    return <img alt={item} style={zoom.style} />;
  }

  it('draws the next item fitted at once, never at the last one\'s zoom', () => {
    const drawn: number[] = [];
    const api: { current?: ZoomPan } = {};
    const { rerender } = render(<Viewer item="a.png" drawn={drawn} api={api} />);
    act(() => api.current!.zoomTo(3));
    expect(api.current!.zoomed).toBe(true);
    drawn.length = 0;
    rerender(<Viewer item="b.png" drawn={drawn} api={api} />);
    expect(drawn).toEqual([1]);
    expect(api.current!.zoomed).toBe(false);
    // The same item again keeps its zoom.
    act(() => api.current!.zoomTo(2));
    rerender(<Viewer item="b.png" drawn={drawn} api={api} />);
    expect(api.current!.state.scale).toBe(2);
  });
});
