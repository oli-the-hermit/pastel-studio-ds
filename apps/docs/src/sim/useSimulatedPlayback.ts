import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_MEDIA_STATE, type MediaController, type MediaState } from '@pastel-studio/react';

export interface SimulatedPlaybackOptions {
  /** Seconds. */
  duration: number;
  autoplay?: boolean;
  /** Start position, seconds. */
  start?: number;
  /** Called when the end is reached: advance a queue here. */
  onEnded?: () => void;
  /** Seconds of "network" loaded ahead of the playhead. */
  bufferAhead?: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A MediaController with no media: a clock that ticks four times a second. For demos only. */
export function useSimulatedPlayback({ duration, autoplay = false, start = 0, onEnded, bufferAhead = 40 }: SimulatedPlaybackOptions): MediaController {
  const [s, setS] = useState<MediaState>({ ...INITIAL_MEDIA_STATE, duration, currentTime: start, playing: autoplay, buffered: Math.min(duration, start + bufferAhead) });
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  // A new track: reset the clock.
  useEffect(() => {
    setS((p) => ({ ...p, duration, currentTime: start, ended: false, buffered: Math.min(duration, start + bufferAhead) }));
  }, [duration, start, bufferAhead]);

  useEffect(() => {
    if (!s.playing) return;
    const id = setInterval(() => {
      setS((p) => {
        const t = p.currentTime + 0.25 * p.rate;
        if (t >= p.duration) {
          queueMicrotask(() => onEndedRef.current?.());
          return { ...p, currentTime: p.duration, playing: false, ended: true };
        }
        return { ...p, currentTime: t, buffered: Math.min(p.duration, Math.max(p.buffered, t + bufferAhead)) };
      });
    }, 250);
    return () => clearInterval(id);
  }, [s.playing, bufferAhead]);

  const set = useCallback((patch: Partial<MediaState>) => setS((p) => ({ ...p, ...patch })), []);
  return {
    ...s,
    play: () => setS((p) => ({ ...p, playing: true, ended: false, currentTime: p.ended ? 0 : p.currentTime })),
    pause: () => set({ playing: false }),
    toggle: () => setS((p) => ({ ...p, playing: !p.playing, ended: false, currentTime: p.ended ? 0 : p.currentTime })),
    seek: (t) => setS((p) => ({ ...p, currentTime: clamp(t, 0, p.duration), ended: false, buffered: Math.max(p.buffered, Math.min(p.duration, t + bufferAhead / 2)) })),
    skip: (d) => setS((p) => ({ ...p, currentTime: clamp(p.currentTime + d, 0, p.duration), ended: false })),
    setVolume: (v) => set({ volume: clamp(v, 0, 1), muted: v === 0 }),
    toggleMute: () => setS((p) => ({ ...p, muted: !p.muted, volume: p.muted && p.volume === 0 ? 0.5 : p.volume })),
    setRate: (r) => set({ rate: r }),
  };
}
