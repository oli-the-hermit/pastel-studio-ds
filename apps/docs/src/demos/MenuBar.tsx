import React, { useState } from 'react';
import { IconApp, IconCopy, IconEdit, IconInfo, MenuBar, MenuList, type MenuBarMenu, type MenuItem } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};

function menus(pick: (what: string) => void): MenuBarMenu[] {
  const item = (key: string, label: string, extra: Partial<MenuItem> = {}): MenuItem =>
    ({ key, label, onSelect: () => pick(label), ...extra }) as MenuItem;
  return [
    {
      key: 'app',
      label: 'Pastel Studio',
      brand: true,
      icon: <IconApp size={16} />,
      items: [
        item('save', 'Save prompt…', { hint: 'Ctrl+S' }),
        item('save-as', 'Save prompt as…'),
        item('load', 'Load prompt…', { hint: 'Ctrl+O' }),
        { key: 'div', divider: true },
        item('export', 'Export saved prompts…'),
      ],
    },
    {
      key: 'edit',
      label: 'Edit',
      items: [
        item('copy', 'Copy', { icon: <IconCopy size={16} />, hint: 'Ctrl+C' }),
        item('paste', 'Paste', { icon: <IconEdit size={16} />, hint: 'Ctrl+V' }),
      ],
    },
    {
      key: 'help',
      label: 'Help',
      items: [item('tips', 'Tips and shortcuts'), item('about', 'About', { icon: <IconInfo size={16} /> })],
    },
  ];
}

function Demo() {
  const [last, setLast] = useState('Nothing picked yet');
  return (
    <div className="docs-demo-stack">
      <MenuBar menus={menus(setLast)} />
      <span className="docs-demo-status" role="status">{last}</span>
    </div>
  );
}

const still = menus(noop);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Closed: <MenuBar menus={still} />,
    Open: (
      <div className="docs-demo-stack">
        <MenuBar menus={still} />
        <StaticPopover className="ps-menu">
          <MenuList items={still[1].items} onPicked={noop} />
        </StaticPopover>
      </div>
    ),
  },
  variants: {
    'App menu first': <MenuBar menus={still.slice(0, 1)} />,
    'Icon only': <MenuBar menus={[{ ...still[0], iconOnly: true }, still[1], still[2]]} />,
  },
  dos: [
    'Put the app\'s own menu first, with its mark, and keep its file actions there.',
    'Show each action\'s shortcut as a `hint`, so the menu teaches it.',
    'Keep it to a few menus with familiar names: File, Edit, View, Help.',
  ],
  donts: [
    'Don\'t put actions that belong to one item in the bar: give the item a Menu or a right-click menu.',
    'Don\'t nest more than one level of submenus.',
  ],
};
