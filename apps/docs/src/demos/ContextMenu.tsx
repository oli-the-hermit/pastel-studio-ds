import React, { useState } from 'react';
import { IconCopy, IconEdit, IconTrash, MenuList, useContextMenuState, type MenuItem } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [last, setLast] = useState('Nothing picked yet');
  // One area with its own menu. An app wraps itself in ContextMenuProvider instead.
  const menu = useContextMenuState();
  const items: MenuItem[] = [
    { key: 'rename', label: 'Rename', icon: <IconEdit size={16} />, onSelect: () => setLast('Rename') },
    { key: 'div', divider: true },
    { key: 'delete', label: 'Delete', icon: <IconTrash size={16} />, danger: true, onSelect: () => setLast('Delete') },
  ];
  return (
    <div className="docs-demo-stack">
      <div className="docs-context-area" tabIndex={0} onContextMenu={(e) => menu.openMenu(e, items)}>
        Right-click here, or focus it and press Shift + F10. Select some of this text first to get Copy.
      </div>
      <span className="docs-demo-status" role="status">{last}</span>
      {menu.element}
    </div>
  );
}

const rename: MenuItem = { key: 'rename', label: 'Rename', icon: <IconEdit size={16} />, onSelect: noop };
const remove: MenuItem = { key: 'delete', label: 'Delete', icon: <IconTrash size={16} />, danger: true, onSelect: noop };
const copy: MenuItem = { key: 'copy', label: 'Copy', icon: <IconCopy size={15} />, onSelect: noop };

const still = (items: MenuItem[]) => (
  <StaticPopover className="ps-menu ps-context-menu">
    <MenuList items={items} onPicked={noop} />
  </StaticPopover>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Open: still([rename, { key: 'div', divider: true }, remove]),
    'With selected text': still([copy, { key: 'copy-div', divider: true }, rename, { key: 'div', divider: true }, remove]),
  },
  variants: {},
  dos: [
    'Wrap the app once in `ContextMenuProvider`, and give it the items for the page background.',
    'Use the same items as the row\'s `Menu`, so both ways show the same actions.',
  ],
  donts: [
    'Don\'t make it the only way to reach an action: touch screens have no right-click.',
    'Don\'t replace the menu of text fields: people need paste and spelling suggestions there.',
  ],
};
