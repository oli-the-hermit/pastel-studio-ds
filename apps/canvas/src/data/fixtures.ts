// Sample data for components that show content (an album, a player, a computer's files), borrowed from
// the docs' examples. A page file names them ({ "$fixture": "album" }) instead of copying them in, so
// it stays small and readable; anything can still be written out in full instead.
import { INITIAL_MEDIA_STATE, type MediaController } from '@pastel-studio/react';
import { covers } from '../../../docs/src/fixtures/covers';
import { computer } from '../../../docs/src/fixtures/files';
import { album, playlist } from '../../../docs/src/fixtures/music';

const noop = () => {};

/** A player paused a minute into a four-minute track; overrides set any of its state. */
const media = (overrides: Record<string, unknown>): MediaController => ({
  ...INITIAL_MEDIA_STATE,
  duration: 241,
  currentTime: 63,
  buffered: 140,
  ...overrides,
  play: noop, pause: noop, toggle: noop, seek: noop, skip: noop, setVolume: noop, toggleMute: noop, setRate: noop,
});

export const FIXTURES: Record<string, (overrides: Record<string, unknown>) => unknown> = {
  album: (o) => ({ ...album, ...o }),
  track: (o) => ({ ...album.tracks[0], ...o }),
  playlist: () => playlist,
  computer: () => computer,
  media,
};

export const COVERS = covers as Record<string, string>;
