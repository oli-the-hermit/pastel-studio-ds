import React, { useState } from 'react';
import { Chip, IconBell, IconButton, IconHelp, IconMiniPlayer, IconSoundOff, IconSoundOn, TopBar, WindowControls } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const status = <Chip tone="accent">Playing · 1:12</Chip>;
const tools = (
  <>
    <IconButton label="Mini player"><IconMiniPlayer size={19} /></IconButton>
    <IconButton label="Notifications"><IconBell size={19} /></IconButton>
    <IconButton label="Help"><IconHelp size={19} /></IconButton>
  </>
);
const controls = <WindowControls onMinimize={noop} onToggleMaximize={noop} onClose={noop} />;

function Demo() {
  const [sound, setSound] = useState(true);
  const [maximized, setMaximized] = useState(false);
  return (
    <div className="docs-topbar-stage">
      <TopBar
        title="Library"
        status={status}
        tools={
          <>
            {tools}
            <IconButton label="Sound" pressed={sound} onClick={() => setSound((s) => !s)}>{sound ? <IconSoundOn size={19} /> : <IconSoundOff size={19} />}</IconButton>
          </>
        }
        windowControls={<WindowControls maximized={maximized} onMinimize={noop} onToggleMaximize={() => setMaximized((m) => !m)} onClose={noop} />}
      />
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'With status': <div className="docs-gallery-span docs-topbar-stage"><TopBar title="Library" status={status} tools={tools} /></div>,
    'With window controls': <div className="docs-gallery-span docs-topbar-stage"><TopBar title="Library" tools={tools} windowControls={controls} /></div>,
    'Long title': <div className="docs-gallery-span"><div className="docs-topbar-stage is-narrow"><TopBar title="A page whose title is far too long for this bar" status={status} tools={tools} /></div></div>,
  },
  variants: {},
  dos: [
    'Put the page\'s title in it and nothing else that names the page: it is the page\'s `h1`.',
    'Keep the tools to a few icon buttons with names; anything more belongs in the page.',
    'Pass `dragRegionProps` in a frameless window so the empty part of the bar moves it.',
  ],
  donts: [
    'Don\'t put the window buttons in the tools: `windowControls` keeps them at the corner.',
    'Don\'t put text buttons or search in the bar: it is a title bar, not a toolbar.',
  ],
};
