import type { Album, Track } from '@pastel-studio/react';
import { covers } from './covers';

// A placeholder catalogue: invented bands and titles.
const t = (id: string, title: string, duration: number, extra: Partial<Track> = {}): Track => ({
  id,
  title,
  artist: 'Glass Harbor',
  album: 'Midnight Static',
  duration,
  cover: covers.midnight,
  year: 2026,
  ...extra,
});

export const album: Album = {
  id: 'midnight-static',
  title: 'Midnight Static',
  artist: 'Glass Harbor',
  kind: 'Album',
  year: 2026,
  cover: covers.midnight,
  label: 'Lantern Tape Co.',
  releaseDate: '2026-03-20',
  copyright: '℗ 2026 Lantern Tape Co. (placeholder credits)',
  description:
    'A placeholder description for the album page: where the record was made, who played on it and what it sounds like. Long text folds after four lines so the track list stays in view; "Show more" opens the rest.',
  tracks: [
    t('t1', 'Signal Fires', 214, { number: 1 }),
    t('t2', 'Low Tide Radio', 248, { number: 2 }),
    t('t3', 'Copper Lights (feat. Ana Rey)', 197, { number: 3, explicit: true }),
    t('t4', 'Northbound', 276, { number: 4 }),
    t('t5', 'Paper Satellites', 231, { number: 5 }),
    t('t6', 'Static Bloom', 302, { number: 6 }),
  ],
};

/** A playlist mixing albums, with dates added. */
export const playlist: Track[] = [
  t('p1', 'Orchard Lights', 203, { artist: 'Velvet Orchard', album: 'Orchard', cover: covers.orchard, addedAt: '2026-09-02' }),
  t('p2', 'Tidal Lines', 241, { artist: 'Harbour Moss', album: 'Tidal', cover: covers.tidal, addedAt: '2026-09-14' }),
  t('p3', 'Paper Moons', 188, { artist: 'Inkwell', album: 'Paper', cover: covers.paper, addedAt: '2026-10-01' }),
  t('p4', 'Neon Prayer', 266, { artist: 'Sodium', album: 'Neon', cover: covers.neon, addedAt: '2026-10-09' }),
];
