import React from 'react';
import { Button, DetailsPane } from '@pastel-studio/react';
import { albums, computer, music } from '../fixtures/files';
import type { ComponentDemo } from './types';

const byId = (id: string) => albums.children!.find((e) => e.id === id)!;
const pane = (node: React.ReactNode) => <div className="docs-demo-narrow">{node}</div>;
const actions = <><Button size="sm" variant="tonal">Open</Button><Button size="sm">Share</Button></>;

export const demo: ComponentDemo = {
  Demo: () => pane(<DetailsPane entries={[byId('cover')]} folder={albums} location="Media (D:) › Music › Albums" actions={actions} />),
  states: {
    'One file': pane(<DetailsPane entries={[byId('low-tide')]} folder={albums} location="Music › Albums" />),
    'Nothing selected': pane(<DetailsPane entries={[]} folder={music} />),
    Several: pane(<DetailsPane entries={[byId('cover'), byId('cover-psd'), byId('liner')]} folder={albums} />),
    Drive: pane(<DetailsPane entries={[computer.children![0]]} folder={computer} />),
  },
  variants: {},
  dos: [
    'Keep it beside the file view and update it with the selection.',
    'Add app-specific facts through `meta`: dimensions, length, author.',
  ],
  donts: [
    'Don\'t put editing fields here: rename in place, change properties in a dialog.',
    'Don\'t show it in narrow windows: let people open it from a command instead.',
  ],
};
