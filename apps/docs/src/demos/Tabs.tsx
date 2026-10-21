import React, { useState } from 'react';
import { IconBell, IconDownload, IconMusic, IconUser, Switch, Tabs, type TabItem } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const withIcons: TabItem[] = [
  { key: 'notifications', label: 'Notifications', icon: <IconBell size={16} /> },
  { key: 'music', label: 'Music', icon: <IconMusic size={16} /> },
  { key: 'updates', label: 'Updates', icon: <IconDownload size={16} /> },
  { key: 'profiles', label: 'Profiles', icon: <IconUser size={16} /> },
];
const textOnly: TabItem[] = withIcons.map(({ key, label }) => ({ key, label }));
const panels: Record<string, string> = {
  notifications: 'When a focus or a break ends, and how.',
  music: 'Focus playlists and where they are kept.',
  updates: 'Checking for new versions.',
  profiles: 'The profiles on this device.',
};

function Panel({ tab }: { tab: string }) {
  const [on, setOn] = useState(true);
  return (
    <div className="docs-tabs-panel">
      <p>{panels[tab]}</p>
      <Switch label="A setting in this tab" checked={on} onChange={setOn} />
    </div>
  );
}

const stage = (tabs: TabItem[], value: string) => (
  <div className="docs-gallery-span docs-appearance-stage">
    <Tabs tabs={tabs} value={value} onChange={noop} ariaLabel="Settings"><p className="docs-tabs-panel">{panels[value]}</p></Tabs>
  </div>
);

function Demo() {
  const [tab, setTab] = useState('notifications');
  return (
    <div className="docs-appearance-stage">
      <Tabs tabs={withIcons} value={tab} onChange={setTab} ariaLabel="Settings"><Panel tab={tab} /></Tabs>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'First tab active': stage(textOnly, 'notifications'),
    'Another tab active': stage(textOnly, 'updates'),
  },
  variants: {
    'Text only': stage(textOnly, 'music'),
    'With icons': stage(withIcons, 'music'),
  },
  dos: [
    'Use it inside a dialog or a card whose surface is one step below the panel, so the folder reads.',
    'Keep the labels short and the tabs few (two to five); give the dialog a fixed height so switching tabs doesn\'t make it jump.',
    'Keep every panel quick to show: tabs open as the arrow keys move.',
  ],
  donts: [
    'Don\'t use tabs to switch views of the same data (a week or a month): a SegmentedControl does that.',
    'Don\'t nest tabs inside a tab\'s panel.',
  ],
};
