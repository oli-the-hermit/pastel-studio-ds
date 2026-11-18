import React, { useState } from 'react';
import { IconCopy, IconEdit, IconFolder, IconHeart, IconStar, IconTrash, MenuList, useContextMenuState, type MenuItem } from '@pastel-studio/react';
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
      <div className="docs-context-area" tabIndex={0} onContextMenu={(e) => menu.openMenu(e, longItems((label) => setLast(label)))}>
        Right-click here for a long menu. Make the window short: it slides to stay whole, then spreads into columns.
      </div>
      <span className="docs-demo-status" role="status">{last}</span>
      {menu.element}
    </div>
  );
}

const rename: MenuItem = { key: 'rename', label: 'Rename', icon: <IconEdit size={16} />, onSelect: noop };
const remove: MenuItem = { key: 'delete', label: 'Delete', icon: <IconTrash size={16} />, danger: true, onSelect: noop };
const copy: MenuItem = { key: 'copy', label: 'Copy', icon: <IconCopy size={15} />, onSelect: noop };

/** A media file's menu: sixteen rows in five groups. */
function longItems(pick: (label: string) => void): MenuItem[] {
  const row = (label: string, icon?: React.ReactNode, hint?: string): MenuItem => ({ key: label, label, icon, hint, onSelect: () => pick(label) });
  return [
    row('Open'), row('Open with…'), row('Show in folder', <IconFolder size={16} />),
    { key: 'd1', divider: true },
    row('Cut', undefined, 'Ctrl+X'), row('Copy', <IconCopy size={15} />, 'Ctrl+C'), row('Move to…'), row('Copy to…'), row('Rename', <IconEdit size={16} />, 'F2'),
    { key: 'd2', divider: true },
    row('Favorite', <IconHeart size={16} />, 'H'), row('Labels…'), row('Add to collection', <IconStar size={16} />),
    { key: 'd3', divider: true },
    row('Copy path'), row('Properties', undefined, 'Alt+Enter'),
    { key: 'd4', divider: true },
    { key: 'trash', label: 'Move to Trash', icon: <IconTrash size={16} />, hint: 'Del', danger: true, onSelect: () => pick('Move to Trash') },
  ];
}

const still = (items: MenuItem[], columns?: number) => (
  <StaticPopover className="ps-menu ps-context-menu" columns={columns}>
    <MenuList items={items} onPicked={noop} />
  </StaticPopover>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Open: still([rename, { key: 'div', divider: true }, remove]),
    'With selected text': still([copy, { key: 'copy-div', divider: true }, rename, { key: 'div', divider: true }, remove]),
    'In a short window': still(longItems(noop), 2),
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
