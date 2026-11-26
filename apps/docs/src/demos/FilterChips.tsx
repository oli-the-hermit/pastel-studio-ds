import React, { useState } from 'react';
import { FilterChips } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
type Kind = 'albums' | 'artists' | 'songs' | 'playlists';
const kinds: { value: Kind; label: string }[] = [
  { value: 'albums', label: 'Albums' },
  { value: 'artists', label: 'Artists' },
  { value: 'songs', label: 'Songs' },
  { value: 'playlists', label: 'Playlists' },
];
const counted: { value: Kind; label: string; count: number }[] = [
  { value: 'albums', label: 'Albums', count: 128 },
  { value: 'artists', label: 'Artists', count: 64 },
  { value: 'songs', label: 'Songs', count: 1432 },
  { value: 'playlists', label: 'Playlists', count: 0 },
];
const genres = ['All', 'Ambient', 'Classical', 'Electronic', 'Folk', 'Hip-hop', 'Jazz', 'Pop', 'Rock', 'Soundtracks'].map((label) => ({ value: label.toLowerCase(), label }));

function Demo() {
  const [kind, setKind] = useState<Kind>('albums');
  return (
    <div className="docs-demo-stack">
      <FilterChips ariaLabel="Show" options={counted} value={kind} onChange={setKind} />
      <span className="docs-demo-status" role="status">Showing {counted.find((o) => o.value === kind)?.count} {kind}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Chosen: <FilterChips ariaLabel="Show" options={kinds} value="artists" onChange={noop} />,
    'With counts': <FilterChips ariaLabel="Show" options={counted} value="albums" onChange={noop} />,
    Wrapped: <div className="docs-filter-chips-narrow"><FilterChips ariaLabel="Genre" options={genres} value="all" onChange={noop} /></div>,
    'Nothing chosen': <FilterChips ariaLabel="Show" options={kinds} value={'films' as Kind} onChange={noop} />,
  },
  variants: {
    md: <FilterChips ariaLabel="Show" options={kinds} value="albums" onChange={noop} />,
    lg: <FilterChips ariaLabel="Show" options={kinds} value="albums" onChange={noop} size="lg" />,
  },
  dos: [
    'Use it to filter what the list or grid under it shows, with one filter always on.',
    'Keep the labels short, and put the one that shows everything first.',
    'Give the group an `ariaLabel` that names the choice: "Show", "Genre".',
  ],
  donts: [
    'Don\'t use it for a setting with two or three values in a form: that is a SegmentedControl.',
    'Don\'t use it when several filters can be on at once: each of those is a toggle of its own.',
    'Don\'t show a count that is out of date: leave it out until it is known.',
  ],
};
