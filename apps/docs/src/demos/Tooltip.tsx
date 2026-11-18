import React from 'react';
import { Button, IconButton, IconCopy, IconCut, IconEdit, IconHeart, IconTag, Toolbar, Tooltip, TruncatedText, type TooltipContent } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  return (
    <div className="docs-demo-stack">
      <Toolbar label="Edit">
        <IconButton label="Cut" shortcut="Ctrl+X" onClick={noop}><IconCut size={18} /></IconButton>
        <IconButton label="Copy" shortcut="Ctrl+C" onClick={noop}><IconCopy size={18} /></IconButton>
        <IconButton label="Rename" shortcut="F2" onClick={noop}><IconEdit size={18} /></IconButton>
        <IconButton label="Favorite" shortcut="H" description="Keeps it in Favorites, on the drawer" onClick={noop}><IconHeart size={18} /></IconButton>
        <IconButton label="Labels" description="Tags the selection, to find it by label later" onClick={noop}><IconTag size={18} /></IconButton>
        <Button tooltip="Opens every selected file in its own window" onClick={noop}>Open all</Button>
      </Toolbar>
      <p className="docs-demo-status">
        Rest the pointer on a button, then move along the row: once one shows, the next follows at once. Tab to them for the
        keyboard.
      </p>
      <div style={{ width: 180 }}>
        <TruncatedText>Holiday in the mountains, 2026, day three.jpg</TruncatedText>
      </div>
      <Tooltip label="Drafts" description="Pages you haven't published yet">
        <span tabIndex={0} className="docs-context-area">Any element can have one</span>
      </Tooltip>
    </div>
  );
}

/** A tooltip as it shows, in place. */
const still = ({ label, shortcut, description }: TooltipContent) => (
  <div className="docs-static-overlay">
    <div className="ps-tooltip is-below" role="tooltip">
      <span className="ps-tooltip-label">
        <span>{label}</span>
        {shortcut && <kbd className="ps-tooltip-shortcut">{shortcut}</kbd>}
      </span>
      {description && <span className="ps-tooltip-description">{description}</span>}
    </div>
  </div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Name: still({ label: 'Show details' }),
    'With shortcut': still({ label: 'Copy', shortcut: 'Ctrl+C' }),
    'With description': still({ label: 'Labels', description: 'Tags the selection, to find it by label later' }),
  },
  variants: {},
  dos: [
    'Give every icon-only button a tooltip; IconButton does it from its `label`.',
    'Show the shortcut from the same place the keymap reads it, so they never disagree.',
    'Add a description only when the name doesn\'t say what the control does.',
  ],
  donts: [
    'Don\'t put anything someone must read or click in a tooltip: touch screens never show one.',
    'Don\'t repeat a button\'s visible text as its tooltip.',
  ],
};
