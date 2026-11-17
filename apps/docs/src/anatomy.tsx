import React from 'react';
import {
  Button, Card, CardHeader, Chip, Field, IconBug, IconCopy, IconEdit, IconMore, IconPlus, IconTrash, IconButton, ListRow,
  MenuList, SegmentedControl, Switch, Tabs, TextInput, Toast, type MenuItem,
} from '@pastel-studio/react';
import { StaticPopover } from './blocks/StaticOverlay';
import type { AnatomySpec } from './blocks/Anatomy';

// The components whose pages show an anatomy figure, and the instance each one measures. The
// figure measures the live element, so a spec only says what to render and, where the default
// isn't right, which element to measure and what to call its parts.

const noop = () => {};
const menuItems: MenuItem[] = [
  { key: 'rename', label: 'Rename', icon: <IconEdit size={16} />, hint: 'F2', onSelect: noop },
  { key: 'duplicate', label: 'Duplicate', icon: <IconCopy size={16} />, onSelect: noop },
  { key: 'delete', label: 'Delete', icon: <IconTrash size={16} />, danger: true, onSelect: noop },
];

export const ANATOMY: Record<string, AnatomySpec[]> = {
  Button: [{
    example: <Button variant="primary" icon={<IconPlus />}>Add task</Button>,
    parts: [{ selector: 'svg', label: 'Leading icon' }, { selector: '#text', label: 'Label' }],
  }],
  IconButton: [{
    example: <IconButton label="More actions"><IconMore /></IconButton>,
    parts: [{ selector: 'svg', label: 'Icon' }],
    maxScale: 4,
  }],
  Chip: [{
    example: <Chip tone="accent">3 tasks left</Chip>,
    maxScale: 4,
  }],
  Card: [{
    example: (
      <Card>
        <CardHeader title="Weekend errands" titleAddon={<Chip tone="accent">3 left</Chip>} />
        <p>Groceries, the bike, and the parcel at the post office.</p>
      </Card>
    ),
    width: 340,
    maxScale: 1.4,
  }],
  Field: [{
    example: <Field label="List name" hint="Shown at the top of the list."><TextInput defaultValue="Weekend errands" /></Field>,
    width: 320,
    maxScale: 1.6,
  }],
  ListRow: [{
    example: <ListRow icon={<IconBug size={20} />} title="Report a problem" description="Opens an issue on GitHub" external />,
    width: 360,
    maxScale: 1.6,
  }],
  Switch: [{
    example: <Switch label="Sound alerts" checked onChange={noop} />,
    width: 280,
    maxScale: 2,
  }],
  SegmentedControl: [{
    example: (
      <SegmentedControl
        ariaLabel="Range"
        options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
        value="week"
        onChange={noop}
        surface={1}
      />
    ),
    maxScale: 2.4,
  }],
  Tabs: [{
    example: (
      <Tabs tabs={[{ key: 'general', label: 'General' }, { key: 'sound', label: 'Sound' }, { key: 'updates', label: 'Updates' }]} value="general" onChange={noop} ariaLabel="Settings">
        <p>General settings.</p>
      </Tabs>
    ),
    target: '[role="tablist"]',
    width: 380,
    maxScale: 1.8,
  }],
  Toast: [{
    example: <Toast tone="success" message="List saved" />,
    maxScale: 2.4,
  }],
  Menu: [
    {
      example: <StaticPopover className="ps-menu"><MenuList items={menuItems} onPicked={noop} /></StaticPopover>,
      target: '.ps-popover',
      parts: [{ selector: '.ps-menu-item', label: 'Item' }, { selector: '.ps-menu-item.is-danger', label: 'Danger item' }],
      show: ['parts', 'padding', 'radius', 'size'],
      maxScale: 1.6,
      caption: 'The panel: a surface with a little padding, so items keep their own rounded hover.',
    },
    {
      example: <StaticPopover className="ps-menu"><MenuList items={menuItems.slice(0, 1)} onPicked={noop} /></StaticPopover>,
      target: '.ps-menu-item',
      maxScale: 2,
      caption: 'One item: icon, label and an optional key hint, in a row.',
    },
  ],
};

/** A component's anatomy figures, if its page has any. */
export const anatomyFor = (name: string): AnatomySpec[] | undefined => ANATOMY[name];
