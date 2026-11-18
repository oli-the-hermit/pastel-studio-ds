import React, { useState } from 'react';
import { Combobox, Field, IconButton, IconClock, IconFolder, IconFolderOpen, type ComboboxOption } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};
const folders = ['Photos', 'Photos\\2025', 'Photos\\2026', 'Photos\\2026\\Summer', 'Projects', 'Projects\\Website', 'Music'];
const recent = {
  label: 'Recent',
  items: [
    { id: 'r1', label: 'D:\\Photos\\2026', value: 'D:\\Photos\\2026', icon: <IconClock size={16} /> },
    { id: 'r2', label: 'E:\\Archive', value: 'E:\\Archive', icon: <IconClock size={16} /> },
  ],
};

/** Path completion over a small made-up drive: the folders under what is typed. */
function complete(text: string): ComboboxOption[] {
  const typed = text.replace(/^D:\\?/i, '').toLowerCase();
  return folders
    .filter((f) => f.toLowerCase().startsWith(typed) && f.toLowerCase() !== typed)
    .slice(0, 6)
    .map((f) => ({ id: f, label: f.split('\\').pop()!, detail: `D:\\${f}`, value: `D:\\${f}`, icon: <IconFolder size={16} />, group: 'Folders' }));
}

function Demo() {
  const [path, setPath] = useState('');
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState('Nothing chosen yet');
  return (
    <div className="docs-demo-stack" style={{ maxWidth: 420 }}>
      <Field label="Folder" htmlFor="docs-combobox-path">
        <Combobox
          id="docs-combobox-path"
          value={path}
          onChange={setPath}
          onSubmit={(v) => setChosen(v)}
          suggestions={path ? complete(path) : []}
          recent={recent}
          placeholder="e.g. D:\Photos\2026"
          endAdornment={
            <IconButton label="Browse" description="Pick a folder with the system's dialog" size="sm" onClick={() => setChosen('Browse…')}>
              <IconFolderOpen size={16} />
            </IconButton>
          }
        />
      </Field>
      <Combobox
        variant="search"
        value={query}
        onChange={setQuery}
        onPick={(o) => setChosen(o.value ?? o.label)}
        loadSuggestions={async (text) => complete(text.startsWith('D:') ? text : `D:\\${text}`)}
        placeholder="Search folders"
      />
      <span className="docs-demo-status" role="status">{chosen}</span>
    </div>
  );
}

/** The field with its list open, in place. */
function open(value: string, options: ComboboxOption[], active = -1) {
  return (
    <div className="docs-demo-stack" style={{ width: 320 }}>
      <Combobox value={value} onChange={noop} placeholder="e.g. D:\Photos\2026" />
      <StaticPopover className="ps-combobox-popover">
        <div role="listbox" aria-label="Suggestions" className="ps-combobox-list">
          {options[0]?.group && <div className="ps-combobox-group">{options[0].group}</div>}
          {options.map((o, i) => (
            <div key={o.id} role="option" aria-selected={i === active} className={i === active ? 'ps-combobox-option is-active' : 'ps-combobox-option'}>
              {o.icon && <span className="ps-combobox-option-icon">{o.icon}</span>}
              <span className="ps-combobox-option-text">
                <span className="ps-combobox-option-label">{o.label}</span>
                {o.detail && <span className="ps-combobox-option-detail">{o.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      </StaticPopover>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Empty: <Combobox value="" onChange={noop} placeholder="e.g. D:\Photos\2026" />,
    Recent: open('', recent.items.map((o) => ({ ...o, group: 'Recent' }))),
    Suggesting: open('D:\\Photos\\20', complete('D:\\Photos\\20'), 1),
    Disabled: <Combobox value="" onChange={noop} placeholder="e.g. D:\Photos\2026" disabled />,
  },
  variants: {
    field: <Combobox value="D:\Photos" onChange={noop} placeholder="e.g. D:\Photos\2026" />,
    search: <Combobox variant="search" value="" onChange={noop} placeholder="Search folders" />,
  },
  dos: [
    'Put an example of what to type in the placeholder: "e.g. D:\\Photos\\2026".',
    'Offer what was used recently while the field is empty.',
    'Keep the text as typed usable: Enter with nothing highlighted submits it.',
  ],
  donts: [
    'Don\'t use it to choose one of a short fixed list: that is a Select.',
    'Don\'t put a label in the placeholder; name it with a Field.',
  ],
};
