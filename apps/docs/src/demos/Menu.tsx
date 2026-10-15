import React, { useState } from 'react';
import { IconCopy, IconEdit, IconPin, IconTrash, Menu, MenuList, type MenuItem } from '@pastel-studio/react';
import { OnVideo } from '../blocks/OnVideo';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [last, setLast] = useState('Nothing picked yet');
  const items: MenuItem[] = [
    { key: 'rename', label: 'Rename', icon: <IconEdit size={16} />, hint: 'F2', onSelect: () => setLast('Rename') },
    { key: 'duplicate', label: 'Duplicate', icon: <IconCopy size={16} />, onSelect: () => setLast('Duplicate') },
    { key: 'pin', label: 'Pin to top', icon: <IconPin size={16} />, onSelect: () => setLast('Pin to top') },
    { key: 'div', divider: true },
    { key: 'delete', label: 'Delete', icon: <IconTrash size={16} />, danger: true, onSelect: () => setLast('Delete') },
  ];
  return (
    <div className="docs-demo-stack">
      <div className="docs-demo-card">
        <span>Weekend errands</span>
        <Menu items={items} ariaLabel="List actions" triggerSurface={2} />
      </div>
      <span className="docs-demo-status" role="status">{last}</span>
    </div>
  );
}

const rename: MenuItem = { key: 'rename', label: 'Rename', icon: <IconEdit size={16} />, onSelect: noop };
const duplicate: MenuItem = { key: 'duplicate', label: 'Duplicate', icon: <IconCopy size={16} />, onSelect: noop };
const remove: MenuItem = { key: 'delete', label: 'Delete', icon: <IconTrash size={16} />, danger: true, onSelect: noop };

const still = (items: MenuItem[], header?: React.ReactNode) => (
  <StaticPopover className="ps-menu">
    {header && <div className="ps-menu-header">{header}</div>}
    <MenuList items={items} onPicked={noop} />
  </StaticPopover>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Items: still([rename, duplicate]),
    'With hints': still([{ ...rename, hint: 'F2' }, { ...duplicate, hint: 'Ctrl+D' }]),
    Danger: still([rename, remove]),
    Disabled: still([rename, { ...duplicate, disabled: true }]),
    'With dividers': still([rename, duplicate, { key: 'div', divider: true }, remove]),
    'With header': still([rename, duplicate], <p className="docs-menu-header">Weekend errands</p>),
    Submenu: still([{ key: 'speed', label: 'Playback speed', hint: '1×', items: [] }, { key: 'quality', label: 'Quality', hint: 'Auto', items: [] }]),
    'Check rows': still([{ key: 'n', label: 'Normal', checked: true, radio: true, onSelect: noop }, { key: 'f', label: '1.5×', checked: false, radio: true, onSelect: noop }, { key: 'div', divider: true }, { key: 'loop', label: 'Loop', checked: true, keepOpen: true, onSelect: noop }]),
    'Long header': still([rename, duplicate], <p className="docs-menu-header">Everything to sort out before the move at the end of the month</p>),
  },
  variants: {
    'On video': (
      <OnVideo>
        <StaticPopover className="ps-menu ps-menu--overlay">
          <MenuList items={[{ key: 'speed', label: 'Playback speed', hint: '1×', items: [] }, { key: 'loop', label: 'Loop', checked: true, onSelect: noop }]} onPicked={noop} />
        </StaticPopover>
      </OnVideo>
    ),
    'Small trigger': <Menu items={[rename, duplicate]} triggerSize="sm" />,
    'Custom trigger': <Menu items={[rename, duplicate]} trigger="Options" triggerClassName="ps-button ps-button--sm" ariaLabel="Options" />,
    'Aligned to the start': <Menu items={[rename, duplicate]} align="start" />,
  },
  dos: [
    'Keep it short: the handful of actions that belong to one thing.',
    'Put the action that deletes last, after a divider, and mark it `danger`.',
    'Build the list with `tidyMenuItems` when items are conditional: it drops stray dividers.',
  ],
  donts: [
    'Don\'t hide the main action of a row in a menu: give it a button.',
    'Don\'t use it to choose a value: that is a select.',
  ],
};
