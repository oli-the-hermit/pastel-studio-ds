import { useEffect, useState } from 'react';

/** What a player shows. Times in seconds; volume 0–1; `buffered` is the end of the loaded range. */
export interface MediaState {
  playing: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  rate: number;
  /** Stalled while loading more data. */
  waiting: boolean;
  ended: boolean;
  /** The picture's own size in pixels, as the element reports it (rotation applied). 0 for audio and until it is known. */
  width: number;
  height: number;
}

/**
 * One object every media component reads: the state and the actions that change it. Bind it to a
 * real `<audio>` or `<video>` with `useMediaElement`, or drive it with a simulation in demos and tests.
 */
export interface MediaController extends MediaState {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRate: (rate: number) => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const INITIAL_MEDIA_STATE: MediaState = {
  playing: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 0.8,
  muted: false,
  rate: 1,
  waiting: false,
  ended: false,
  width: 0,
  height: 0,
};

const EVENTS = ['play', 'pause', 'timeupdate', 'durationchange', 'progress', 'volumechange', 'ratechange', 'waiting', 'playing', 'ended', 'loadedmetadata', 'seeked', 'resize'];

/** A MediaController bound to an `<audio>` or `<video>` element. */
export function useMediaElement(ref: React.RefObject<HTMLMediaElement>): MediaController {
  const [s, setS] = useState<MediaState>(INITIAL_MEDIA_STATE);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () =>
      setS({
        playing: !el.paused && !el.ended,
        currentTime: el.currentTime,
        duration: Number.isFinite(el.duration) ? el.duration : 0,
        buffered: el.buffered.length ? el.buffered.end(el.buffered.length - 1) : 0,
        volume: el.volume,
        muted: el.muted,
        rate: el.playbackRate,
        waiting: el.readyState < 3 && !el.paused,
        ended: el.ended,
        width: 'videoWidth' in el ? (el as HTMLVideoElement).videoWidth : 0,
        height: 'videoHeight' in el ? (el as HTMLVideoElement).videoHeight : 0,
      });
    EVENTS.forEach((e) => el.addEventListener(e, sync));
    sync();
    return () => EVENTS.forEach((e) => el.removeEventListener(e, sync));
  }, [ref]);

  const el = () => ref.current;
  return {
    ...s,
    play: () => void el()?.play(),
    pause: () => el()?.pause(),
    toggle: () => {
      const m = el();
      if (!m) return;
      if (m.paused || m.ended) void m.play();
      else m.pause();
    },
    seek: (t) => {
      const m = el();
      if (m) m.currentTime = clamp(t, 0, m.duration || 0);
    },
    skip: (d) => {
      const m = el();
      if (m) m.currentTime = clamp(m.currentTime + d, 0, m.duration || 0);
    },
    setVolume: (v) => {
      const m = el();
      if (!m) return;
      m.volume = clamp(v, 0, 1);
      m.muted = v === 0;
    },
    toggleMute: () => {
      const m = el();
      if (m) m.muted = !m.muted;
    },
    setRate: (r) => {
      const m = el();
      if (m) m.playbackRate = r;
    },
  };
}
