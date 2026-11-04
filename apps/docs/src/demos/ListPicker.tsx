import React, { useRef, useState } from 'react';
import { Button, Chip, CoverArt, IconPlus, ListPicker, ListPickerPanel, type ListPickerState } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const noop = () => {};
const startingTags = ['Beach', 'Family', 'Work', 'Sunsets', 'Screenshots', 'Receipts', 'Pets', 'Trips'];
const toOptions = (names: string[], counts: Record<string, number> = {}) => names.map((name) => ({ value: name, label: name, meta: counts[name] }));

function Demo() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState(startingTags);
  // Three selected photos: which of them carry each tag.
  const [on, setOn] = useState<Record<string, number>>({ Beach: 3, Sunsets: 1, Family: 2 });
  const [recent, setRecent] = useState<string[]>(['Sunsets']);
  const state = (tag: string): ListPickerState => (on[tag] === 3 ? true : on[tag] ? 'mixed' : false);
  const change = (tag: string, checked: boolean) => {
    setOn((prev) => ({ ...prev, [tag]: checked ? 3 : 0 }));
    if (checked) setRecent((prev) => [tag, ...prev.filter((t) => t !== tag)].slice(0, 3));
  };
  return (
    <div className="docs-demo-stack">
      <Button ref={anchor} icon={<IconPlus size={16} />} onClick={() => setOpen(!open)}>Tag 3 photos</Button>
      <ListPicker
        open={open}
        anchorRef={anchor}
        onClose={() => setOpen(false)}
        label="Tags"
        options={toOptions(tags)}
        stateOf={state}
        onChange={change}
        recent={recent}
        onCreate={(name) => {
          setTags((prev) => [...prev, name]);
          change(name, true);
        }}
      />
      <div className="docs-demo-row">
        {tags.filter((t) => on[t]).map((t) => <Chip key={t} tone={on[t] === 3 ? 'accent' : 'default'}>{on[t] === 3 ? t : `${t} (${on[t]} of 3)`}</Chip>)}
      </div>
    </div>
  );
}

const panel = (props: Partial<React.ComponentProps<typeof ListPickerPanel>>) => (
  <StaticPopover>
    <ListPickerPanel label="Tags" options={toOptions(startingTags.slice(0, 5), { Beach: 12, Family: 40, Work: 3, Sunsets: 7, Screenshots: 210 })} stateOf={(v) => v === 'Beach'} onChange={noop} {...props} />
  </StaticPopover>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Open: panel({ recent: ['Sunsets'] }),
    Mixed: panel({ stateOf: (v) => (v === 'Beach' ? true : v === 'Family' ? 'mixed' : false) }),
    Searching: (
      <StaticPopover>
        <ListPickerPanel
          label="Collections"
          defaultQuery="co"
          options={[
            { value: 'coast', label: 'Coast', meta: 48, leading: <CoverArt src={covers.tidal} size="xs" /> },
            { value: 'cooking', label: 'Cooking', meta: 9, leading: <CoverArt src={covers.orchard} size="xs" /> },
            { value: 'pets', label: 'Pets', meta: 30, leading: <CoverArt src={covers.dune} size="xs" /> },
          ]}
          stateOf={() => false}
          onChange={noop}
          onCreate={noop}
        />
      </StaticPopover>
    ),
    'No matches': panel({ options: [] }),
  },
  variants: {},
  dos: [
    'Use it for many-to-many choices: tags, collections, people on a photo.',
    'Pass `mixed` states when it applies to a selection, so the person sees what is already partly there.',
    'Offer `onCreate` where new names are normal, like tags.',
  ],
  donts: [
    'Don\'t use it to pick one value from a list: that is a Select.',
    'Don\'t apply changes on close: each check applies at once, so closing never loses work.',
  ],
};
