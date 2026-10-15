import React, { useState } from 'react';
import { Chip, Field, IconCheck, IconPlus, IconSearch, Select, type SelectOption } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-demo-wide">{node}</div>;

const startingLists = ['Weekend errands', 'Reading', 'Garden', 'Work: launch', 'Work: inbox', 'Groceries', 'Gifts', 'Travel', 'Health'];
const toOptions = (names: string[]): SelectOption[] => names.map((n) => ({ value: n, label: n }));
const sounds: SelectOption[] = [
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'wood', label: 'Wood block' },
  { value: 'none', label: 'No sound', disabled: true },
];

function Demo() {
  const [lists, setLists] = useState(startingLists);
  const [list, setList] = useState('Reading');
  const [recent, setRecent] = useState(['Garden', 'Weekend errands']);
  const [sound, setSound] = useState('');
  const pick = (name: string) => {
    setList(name);
    setRecent((r) => [name, ...r.filter((v) => v !== name)].slice(0, 3));
  };
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <Field label="Task list" htmlFor="demo-list">
        <Select
          id="demo-list"
          value={list}
          onChange={pick}
          options={toOptions(lists)}
          recent={{ values: recent, label: 'Recent' }}
          createOption={{
            label: 'New list',
            placeholder: 'List name',
            onCreate: (name) => {
              setLists((l) => [...l, name]);
              return name;
            },
          }}
        />
      </Field>
      <Field label="End of session sound" htmlFor="demo-sound">
        <Select id="demo-sound" value={sound} onChange={setSound} options={sounds} placeholder="Pick a sound" />
      </Field>
      <span className="docs-demo-status" role="status">List: {list}. Sound: {sound || 'none yet'}.</span>
    </div>
  );
}

const row = (name: string, { selected = false, highlighted = false, meta }: { selected?: boolean; highlighted?: boolean; meta?: string } = {}) => (
  <li key={name} role="presentation">
    <button type="button" role="option" aria-selected={selected} className={['ps-select-option', selected && 'is-selected', highlighted && 'is-highlighted'].filter(Boolean).join(' ')}>
      <span className="ps-select-option-check">{selected && <IconCheck size={15} strokeWidth={2.6} />}</span>
      <span className="ps-select-option-label">{name}</span>
      {meta && <span className="ps-select-option-meta">{meta}</span>}
    </button>
  </li>
);

/* The open panel, standing still: the markup Select renders, with its real classes. */
const openPanel = (
  <StaticPopover className="ps-select-menu" style={{ width: 260 }}>
    <div className="ps-select-search">
      <IconSearch size={15} />
      <input type="text" placeholder="Search…" aria-label="Search options" readOnly />
    </div>
    <ul className="ps-select-options" role="listbox" aria-label="Task list">
      <li role="presentation" className="ps-select-group-label">Recent</li>
      {row('Garden', { selected: true, meta: '2 left' })}
      {row('Weekend errands', { meta: '5 left' })}
      <li role="separator" className="ps-select-separator" />
      {row('Reading', { highlighted: true, meta: '4 left' })}
      {row('Groceries', { meta: '12 left' })}
    </ul>
    <div className="ps-select-create">
      <button type="button" className="ps-select-create-button"><IconPlus size={16} strokeWidth={2.4} />New list</button>
    </div>
  </StaticPopover>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Placeholder: wide(<Select value="" onChange={noop} options={sounds} placeholder="Pick a sound" ariaLabel="Sound" />),
    Chosen: wide(<Select value="bell" onChange={noop} options={sounds} ariaLabel="Sound" />),
    Open: <div className="docs-gallery-span">{openPanel}</div>,
    Disabled: wide(<Select value="bell" onChange={noop} options={sounds} disabled ariaLabel="Sound" />),
  },
  variants: {
    field: wide(<Select value="chime" onChange={noop} options={sounds} ariaLabel="Sound" />),
    header: wide(<Select value="Weekend errands" onChange={noop} options={toOptions(startingLists)} variant="header" ariaLabel="Task list" />),
    'With addon': wide(<Select value="Reading" onChange={noop} options={toOptions(startingLists)} valueAddon={<Chip tone="accent">4 left</Chip>} ariaLabel="Task list" />),
  },
  dos: [
    'Use it for a choice from more than five options, or from a list that grows.',
    'Label it with a Field, or with `ariaLabel` when the place already names it.',
    'Turn on `createOption` when the right choice may not exist yet, like a new list.',
  ],
  donts: [
    'Don\'t use it for two to five fixed options: show them all with a SegmentedControl.',
    'Don\'t put actions in it: a Menu holds actions, a Select holds values.',
  ],
};
