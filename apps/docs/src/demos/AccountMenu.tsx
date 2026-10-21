import React, { useState } from 'react';
import {
  AccountMenu, AppearancePanel, IconHome, IconLogOut, IconMusic, IconPalette, IconSettings, IconSparkle, IconUser, MenuList, NavRail,
  useDrawer, type AccentId, type AccountProfile, type AccountView, type MenuItem, type NavRailItem, type ThemeMode,
} from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

const noop = () => {};
const profile: AccountProfile = { name: 'Sam Rivera', handle: '@sam' };
const owner: AccountProfile = { ...profile, marker: 'Main account' };
// A flat square picture, made here so the docs need no image file.
const picture = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#5EC8B8"/><circle cx="20" cy="16" r="7" fill="#00201C"/><rect x="8" y="27" width="24" height="13" rx="6" fill="#00201C"/></svg>')}`;
const exit = { label: 'Sign out', icon: <IconLogOut />, onSelect: noop };
const items: NavRailItem[] = [
  { key: 'home', label: 'Home', icon: <IconHome size={20} /> },
  { key: 'music', label: 'Music', icon: <IconMusic size={20} /> },
];
const brand = { mark: <IconSparkle size={18} />, name: 'Pastel Studio' };

function Appearance() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accent, setAccent] = useState<AccentId>('solar-lime');
  return <AppearancePanel theme={theme} onThemeChange={setTheme} accent={accent} onAccentChange={setAccent} />;
}

const views: AccountView[] = [
  { key: 'profile', label: 'Profile', icon: <IconUser />, render: () => <p className="docs-account-view">The app\'s own profile form goes here: name, picture, password.</p> },
  { key: 'appearance', label: 'Appearance', icon: <IconPalette />, render: () => <Appearance /> },
  { key: 'settings', label: 'Settings', icon: <IconSettings />, render: () => <p className="docs-account-view">The app\'s own settings go here.</p> },
];
const menuItems: MenuItem[] = [
  ...views.map((v) => ({ key: v.key, label: v.label, icon: v.icon, onSelect: noop })),
  { key: 'exit', label: exit.label, icon: exit.icon, danger: true, onSelect: noop },
];

const stage = (node: React.ReactNode) => <div className="docs-account-stage">{node}</div>;

function Demo() {
  const [page, setPage] = useState('home');
  const drawer = useDrawer('ps-docs-account-drawer');
  return (
    <div className="docs-demo-row">
      <div className="docs-nav-stage">
        <NavRail
          label="Main"
          items={items}
          activeKey={page}
          onSelect={setPage}
          brand={brand}
          variant={drawer.expanded ? 'expanded' : 'rail'}
          onToggle={drawer.canExpand ? drawer.toggle : undefined}
          footer={({ expanded }) => <AccountMenu profile={owner} compact={!expanded} views={views} exit={exit} />}
        />
      </div>
      <span className="docs-demo-status">Open the badge, then Appearance: the view opens in a dialog.</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Expanded: stage(<AccountMenu profile={profile} views={views} exit={exit} />),
    'With picture': stage(<AccountMenu profile={{ ...profile, avatar: picture }} views={views} exit={exit} />),
    'Main account': stage(<AccountMenu profile={owner} compact views={views} exit={exit} />),
    'Menu open': stage(
      <StaticPopover className="ps-menu">
        <div className="ps-menu-header">
          <div className="ps-account-menu-head">
            <span className="ps-account-menu-head-name">{profile.name}</span>
            <span className="ps-account-menu-head-handle">{profile.handle}</span>
          </div>
        </div>
        <MenuList items={menuItems} onPicked={noop} />
      </StaticPopover>
    ),
  },
  variants: {
    Compact: stage(<AccountMenu profile={profile} compact views={views} exit={exit} />),
  },
  dos: [
    'Put it in NavRail\'s footer as a function, so it follows the drawer: `footer={({ expanded }) => <AccountMenu compact={!expanded} … />}`.',
    'Keep the views to the profile, Appearance and Settings; Appearance is the shared AppearancePanel.',
    'Name the exit for what it does here: "Sign out" with accounts, "Switch profile" with local profiles.',
  ],
  donts: [
    'Don\'t put page actions in this menu: it is about the person, not the page.',
    'Don\'t navigate away for a view: it opens in the dialog over the page.',
  ],
};
