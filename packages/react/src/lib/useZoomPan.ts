import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ZoomPanState {
  /** 1 is the content fitted to its stage. */
  scale: number;
  /** The content's offset from the stage's center, in screen pixels. */
  x: number;
  y: number;
}

export interface ZoomPanOptions {
  /** The content's own size in pixels (an image's natural size), for "actual size" and pan limits. */
  content?: { width: number; height: number };
  /** The smallest and largest scale, relative to fitted. Default 1 and 12. */
  min?: number;
  max?: number;
  /** One wheel notch or zoom button multiplies the scale by this. Default 1.25. */
  step?: number;
  /** Anything that means "new content": the view goes back to fitted when it changes. */
  resetKey?: unknown;
}

export interface ZoomPan {
  /** Put it on the element the content is fitted to; the wheel and drags are read there. */
  stageRef: React.RefCallback<HTMLElement>;
  state: ZoomPanState;
  /** For the transformed element: `transform`, origin at its center. */
  style: React.CSSProperties;
  zoomed: boolean;
  dragging: boolean;
  /** Pixels of content per pixel of screen at the current scale, when the content's size is known: 1 is actual size. */
  pixelRatio: number | undefined;
  zoomBy: (factor: number, point?: { x: number; y: number }) => void;
  /** Sets the scale, keeping `point` (client coordinates) where it is on screen. */
  zoomTo: (scale: number, point?: { x: number; y: number }) => void;
  /** Back to fitted. */
  reset: () => void;
  /** Fitted ↔ actual size (or twice fitted when the content is smaller than the stage), around `point`. */
  toggle: (point?: { x: number; y: number }) => void;
  /** Pointer handlers for the stage: drag to pan while zoomed. */
  panHandlers: Pick<React.HTMLAttributes<HTMLElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;
}

const FITTED: ZoomPanState = { scale: 1, x: 0, y: 0 };

/**
 * Wheel zoom toward the pointer, drag to pan and a fitted / actual-size toggle for content fitted
 * to a stage (an image with `object-fit: contain`). The content is moved with a transform, so it
 * stays sharp to the screen and nothing reflows.
 */
export function useZoomPan({ content, min = 1, max = 12, step = 1.25, resetKey }: ZoomPanOptions = {}): ZoomPan {
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const [state, setState] = useState<ZoomPanState>(FITTED);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; from: ZoomPanState } | null>(null);

  useLayoutEffect(() => {
    if (!stage) return;
    const measure = () => {
      const r = stage.getBoundingClientRect();
      setBox({ width: r.width, height: r.height, left: r.left, top: r.top });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [stage]);

  useEffect(() => setState(FITTED), [resetKey]);

  // The content's size on screen when fitted.
  const fit = content && content.width > 0 && content.height > 0 && box.width > 0
    ? Math.min(box.width / content.width, box.height / content.height)
    : undefined;
  const fitted = content && fit ? { width: content.width * fit, height: content.height * fit } : { width: box.width, height: box.height };

  const clamp = useCallback((next: ZoomPanState): ZoomPanState => {
    const scale = Math.min(max, Math.max(min, next.scale));
    // The content may move until its edge meets the stage's edge, and not past it.
    const limitX = Math.max(0, (fitted.width * scale - box.width) / 2);
    const limitY = Math.max(0, (fitted.height * scale - box.height) / 2);
    return { scale, x: Math.min(limitX, Math.max(-limitX, next.x)), y: Math.min(limitY, Math.max(-limitY, next.y)) };
  }, [min, max, fitted.width, fitted.height, box.width, box.height]);

  // Scales to `target(previous scale)`; the point under the pointer stays under it.
  const zoomWith = useCallback((target: (scale: number) => number, point?: { x: number; y: number }) => {
    setState((prev) => {
      const scale = Math.min(max, Math.max(min, target(prev.scale)));
      const k = scale / prev.scale;
      if (!point) return clamp({ scale, x: prev.x * k, y: prev.y * k });
      // The point's offset from the center scales with the content.
      const px = point.x - (box.left + box.width / 2);
      const py = point.y - (box.top + box.height / 2);
      return clamp({ scale, x: px - (px - prev.x) * k, y: py - (py - prev.y) * k });
    });
  }, [clamp, min, max, box.left, box.top, box.width, box.height]);

  const zoomTo = useCallback((scale: number, point?: { x: number; y: number }) => zoomWith(() => scale, point), [zoomWith]);
  // Relative to the latest scale, so wheel notches that arrive together all count.
  const zoomBy = useCallback((factor: number, point?: { x: number; y: number }) => zoomWith((scale) => scale * factor, point), [zoomWith]);
  const reset = useCallback(() => setState(FITTED), []);
  const actual = fit ? 1 / fit : undefined;
  const toggle = useCallback((point?: { x: number; y: number }) => {
    if (state.scale > 1.001) return reset();
    zoomTo(actual && actual > 1.001 ? actual : 2, point);
  }, [state.scale, actual, reset, zoomTo]);

  // The wheel needs a listener that may cancel scrolling, which React's is not.
  const zoomByRef = useRef(zoomBy);
  zoomByRef.current = zoomBy;
  useEffect(() => {
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomByRef.current(e.deltaY < 0 ? step : 1 / step, { x: e.clientX, y: e.clientY });
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [stage, step]);

  const zoomed = state.scale > 1.001;
  const panHandlers: ZoomPan['panHandlers'] = {
    onPointerDown: (e) => {
      if (!zoomed || e.button !== 0) return;
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: state };
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setDragging(true);
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      setState(clamp({ scale: d.from.scale, x: d.from.x + e.clientX - d.x, y: d.from.y + e.clientY - d.y }));
    },
    onPointerUp: (e) => {
      if (drag.current?.id !== e.pointerId) return;
      drag.current = null;
      setDragging(false);
    },
    onPointerCancel: () => {
      drag.current = null;
      setDragging(false);
    },
  };

  return {
    stageRef: setStage,
    state,
    style: { transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`, transformOrigin: 'center' },
    zoomed,
    dragging,
    pixelRatio: fit ? fit * state.scale : undefined,
    zoomBy,
    zoomTo,
    reset,
    toggle,
    panHandlers,
  };
}
