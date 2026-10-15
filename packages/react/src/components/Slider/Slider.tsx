import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { cx } from '../../lib/cx';

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'role'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** Fires while dragging and on each key step. */
  onChange?: (value: number) => void;
  /** Fires once when a drag, a click or a key step ends: commit a seek here. */
  onChangeEnd?: (value: number) => void;
  /** The loaded range, drawn under the fill (media buffering). */
  buffered?: number;
  /** Splits the track at these values (chapters). */
  marks?: SliderMark[];
  /** Accessible name. */
  label: string;
  /** The spoken value, e.g. "1:04 of 3:20". */
  valueText?: (value: number) => string;
  /** A bubble above the pointer while hovering or dragging, e.g. the time. */
  preview?: (value: number) => React.ReactNode;
  /** `sm` for bars and volume. */
  size?: 'md' | 'sm';
  /** `always` draws a knob; `hover` shows it on hover, focus and drag; `none` a plain bar. */
  knob?: 'always' | 'hover' | 'none';
  /** Shows progress that can't be changed, like a running timer: no drag or keys, read out as progress. */
  readOnly?: boolean;
  disabled?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The track behind seeking, volume and timer progress: a knob, pointer drag, keyboard steps, a
 * buffered range, chapter gaps and a hover preview. Keyboard: arrows ±step, Page Up/Down ±10%,
 * Home/End. The ref and other attributes go to the outer element.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      onChangeEnd,
      buffered,
      marks,
      label,
      valueText,
      preview,
      size = 'md',
      knob = 'always',
      readOnly = false,
      disabled = false,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const [drag, setDrag] = useState<number | null>(null);
    const [hover, setHover] = useState<number | null>(null);
    const range = max - min || 1;
    const shown = clamp(drag ?? value, min, max);
    const pct = (v: number) => ((clamp(v, min, max) - min) / range) * 100;
    const snap = (v: number) => clamp(step > 0 ? Math.round((v - min) / step) * step + min : v, min, max);
    const interactive = !readOnly && !disabled;

    const fromPointer = (clientX: number) => {
      const r = rootRef.current!.getBoundingClientRect();
      return snap(min + clamp((clientX - r.left) / (r.width || 1), 0, 1) * range);
    };

    const segments = useMemo(() => {
      const cuts = (marks ?? []).map((m) => m.value).filter((v) => v > min && v < max).sort((a, b) => a - b);
      const edges = [min, ...cuts, max];
      return edges.slice(0, -1).map((start, i) => ({ start, end: edges[i + 1] }));
    }, [marks, min, max]);

    const fillOf = (v: number | undefined, seg: { start: number; end: number }) =>
      v === undefined ? 0 : clamp((v - seg.start) / (seg.end - seg.start), 0, 1) * 100;

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || e.button !== 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const v = fromPointer(e.clientX);
      setDrag(v);
      onChange?.(v);
      thumbRef.current?.focus({ preventScroll: true });
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const v = fromPointer(e.clientX);
      setHover(v);
      if (drag !== null) {
        setDrag(v);
        onChange?.(v);
      }
    };
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (drag === null) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      const v = fromPointer(e.clientX);
      setDrag(null);
      onChangeEnd?.(v);
    };
    const onKeyDown = (e: React.KeyboardEvent) => {
      const big = range / 10;
      const next =
        e.key === 'ArrowRight' || e.key === 'ArrowUp' ? value + step
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? value - step
        : e.key === 'PageUp' ? value + big
        : e.key === 'PageDown' ? value - big
        : e.key === 'Home' ? min
        : e.key === 'End' ? max
        : null;
      if (next === null || !interactive) return;
      e.preventDefault();
      e.stopPropagation();
      const v = snap(next);
      onChange?.(v);
      onChangeEnd?.(v);
    };

    const bubble = interactive && preview ? drag ?? hover : null;
    const spoken = valueText?.(shown);
    const progress = readOnly
      ? { role: 'progressbar', 'aria-label': label, 'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': Math.round(shown * 100) / 100, 'aria-valuetext': spoken }
      : {};

    return (
      <div
        ref={(el) => {
          rootRef.current = el;
          if (typeof forwardedRef === 'function') forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        className={cx(
          'ps-slider',
          size === 'sm' && 'ps-slider--sm',
          knob !== 'always' && `ps-slider--knob-${knob}`,
          readOnly && 'is-read-only',
          drag !== null && 'is-dragging',
          disabled && 'is-disabled',
          className
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        onPointerLeave={() => setHover(null)}
        {...progress}
        {...rest}
      >
        <div className="ps-slider-track">
          {segments.map((seg) => (
            <div key={seg.start} className="ps-slider-segment" style={{ flexGrow: seg.end - seg.start }}>
              {buffered !== undefined && <div className="ps-slider-buffer" style={{ width: `${fillOf(buffered, seg)}%` }} />}
              <div className="ps-slider-fill" style={{ width: `${fillOf(shown, seg)}%` }} />
            </div>
          ))}
        </div>
        <div
          ref={thumbRef}
          className="ps-slider-thumb"
          {...(readOnly
            ? { 'aria-hidden': true }
            : {
                role: 'slider',
                tabIndex: disabled ? -1 : 0,
                'aria-label': label,
                'aria-valuemin': min,
                'aria-valuemax': max,
                'aria-valuenow': Math.round(shown * 100) / 100,
                'aria-valuetext': spoken,
                'aria-disabled': disabled || undefined,
                onKeyDown,
              })}
          style={{ left: `${pct(shown)}%` }}
        />
        {bubble !== null && (
          <div className="ps-slider-preview" style={{ left: `${pct(bubble)}%` }} aria-hidden="true">
            {preview!(bubble)}
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';
