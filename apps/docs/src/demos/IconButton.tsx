import React, { useState } from 'react';
import { IconButton, IconClose, IconList, IconMore, IconPin, IconSettings, IconSoundOff, IconSoundOn, IconStar, IconTrash } from '@pastel-studio/react';
import { OnSurface } from '../blocks/OnSurface';
import type { ComponentDemo } from './types';

function Demo() {
  const [muted, setMuted] = useState(false);
  const [starred, setStarred] = useState(true);
  return (
    <div className="docs-demo-row">
      <IconButton label="Mute" pressed={muted} onClick={() => setMuted((on) => !on)}>
        {muted ? <IconSoundOff /> : <IconSoundOn />}
      </IconButton>
      <IconButton label="Starred" pressed={starred} onClick={() => setStarred((on) => !on)}><IconStar /></IconButton>
      <span className="docs-demo-status" role="status">{muted ? 'Sound off' : 'Sound on'}, {starred ? 'starred' : 'not starred'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Default: <IconButton label="More actions"><IconMore /></IconButton>,
    Disabled: <IconButton label="More actions" disabled><IconMore /></IconButton>,
    Active: <IconButton label="Queue" active><IconList /></IconButton>,
    Pressed: <IconButton label="Pinned" pressed><IconPin /></IconButton>,
  },
  variants: {
    md: <IconButton label="Settings"><IconSettings /></IconButton>,
    sm: <IconButton label="Close" size="sm"><IconClose size={16} /></IconButton>,
    xs: <IconButton label="Close" size="xs"><IconClose size={14} /></IconButton>,
    danger: <IconButton label="Delete" tone="danger"><IconTrash /></IconButton>,
    'On a raised surface': (
      <>
        <OnSurface surface={2}><IconButton label="More actions" surface={2}><IconMore /></IconButton></OnSurface>
        <OnSurface surface={3}><IconButton label="More actions" surface={3}><IconMore /></IconButton></OnSurface>
      </>
    ),
    'On accent': <OnSurface surface="accent"><IconButton label="More actions" surface="accent"><IconMore /></IconButton></OnSurface>,
  },
  dos: [
    'Write the `label` as the action: "Delete task", not "Trash".',
    'Use `pressed` for anything that stays on or off, so a screen reader hears the state.',
    'Keep to icons people already know: close, more, delete, settings.',
  ],
  donts: [
    'Don\'t use an icon alone for an action people may not recognize: use a `Button` with text.',
    'Don\'t change the `label` when `pressed` changes: "Mute, pressed" already says it is on.',
  ],
};
