import React, { useState } from 'react';
import { SearchField } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const narrow = (node: React.ReactNode) => <div className="docs-demo-narrow">{node}</div>;
const titles = ['Tidal Lines', 'Harbour Lights', 'Low Tide', 'The Turn', 'High Water', 'Salt Marsh'];

function Demo() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const found = titles.filter((t) => t.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <SearchField placeholder="Search Music" value={query} onChange={setQuery} onSubmit={setSearched} />
      <span className="docs-demo-status" role="status">{found.length ? found.join(', ') : 'No matches'}{searched && ` · Enter searched for "${searched}"`}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Empty: narrow(<SearchField placeholder="Search Music" value="" onChange={noop} />),
    Filled: narrow(<SearchField placeholder="Search Music" value="tide" onChange={noop} />),
    Disabled: narrow(<SearchField placeholder="Search Music" value="" onChange={noop} disabled />),
  },
  variants: {},
  dos: [
    'Say what it searches in the placeholder: "Search Music", not "Search".',
    'Filter as the person types for local lists; use `onSubmit` for searches that cost a request.',
  ],
  donts: [
    'Don\'t use it for entering a value that is saved: use a text field.',
    'Don\'t hide the results\' count: put it in a status line nearby.',
  ],
};
