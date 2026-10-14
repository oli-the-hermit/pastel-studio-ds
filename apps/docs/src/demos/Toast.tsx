import React from 'react';
import { Button, Toast, ToastRegion, useToasts } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const { toasts, showToast } = useToasts();
  return (
    <div className="docs-demo-row">
      <Button onClick={() => showToast('List saved')}>Save list</Button>
      <Button onClick={() => showToast('A new version is ready', 'info')}>Check for updates</Button>
      <Button onClick={() => showToast('Saved, but 2 tasks have no date', 'warning')}>Save with gaps</Button>
      <Button onClick={() => showToast('Couldn\'t save the list', 'error')}>Save offline</Button>
      <ToastRegion toasts={toasts} className="docs-toast-region" />
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Long message': (
      <div className="docs-gallery-span">
        <Toast tone="success" message="Your 3 lists were exported to the Documents folder as one file you can open later" />
      </div>
    ),
  },
  variants: {
    success: <Toast tone="success" message="List saved" />,
    info: <Toast tone="info" message="A new version is ready" />,
    warning: <Toast tone="warning" message="2 tasks have no date" />,
    error: <Toast tone="error" message="Couldn't save the list" />,
  },
  dos: [
    'Confirm what just happened, in a few words: "List saved".',
    'Render one `ToastRegion` for the whole app, and feed it from `useToasts()`.',
    'Set `--ps-toast-region-top` on the region\'s class when an app bar runs across the top.',
  ],
  donts: [
    'Don\'t ask a question or put a button in a toast: it leaves on its own. Use a `Modal`.',
    'Don\'t show a toast for something people can already see change on screen.',
  ],
};
