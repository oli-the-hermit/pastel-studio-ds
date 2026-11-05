import React, { useState } from 'react';
import { IconBug, IconInfo, IconKeyboard, ListRow } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const list = (node: React.ReactNode) => <div className="docs-demo-form">{node}</div>;

function Demo() {
  const [said, setSaid] = useState('A Help page: each row opens its page.');
  return (
    <div className="docs-demo-form">
      <ListRow icon={<IconKeyboard size={20} />} title="Keyboard shortcuts" description="Every key the app knows" onClick={() => setSaid('Opened Keyboard shortcuts')} />
      <ListRow icon={<IconInfo size={20} />} title="About" description="Version, license and credits" onClick={() => setSaid('Opened About')} />
      <ListRow icon={<IconBug size={20} />} title="Report a problem" description="Opens an issue on GitHub" external onClick={() => setSaid('Would open GitHub')} />
      <span className="docs-demo-status" role="status">{said}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    External: list(<ListRow icon={<IconBug size={20} />} title="Report a problem" description="Opens an issue on GitHub" external />),
  },
  variants: {
    'With description': list(<ListRow icon={<IconKeyboard size={20} />} title="Keyboard shortcuts" description="Every key the app knows" />),
    'Title only': list(<ListRow icon={<IconInfo size={20} />} title="About" />),
  },
  dos: [
    'Use it for a short list of places to go, such as the rows of a Help page.',
    'Keep the description to one line that says what is there.',
  ],
  donts: [
    'Don\'t use it for settings that change in place: use a Switch or a Select in a FormLayout.',
  ],
};
