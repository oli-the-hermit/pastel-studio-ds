import React, { useEffect, useState } from 'react';
import { Button, Spinner } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 2500);
    return () => window.clearTimeout(t);
  }, [loading]);
  return (
    <div className="docs-demo-row">
      <Button onClick={() => setLoading(true)}>Load the playlist</Button>
      {loading ? <Spinner /> : <span className="docs-demo-status" role="status">Ready</span>}
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Turning: <Spinner />,
  },
  variants: {
    md: <Spinner />,
    lg: <Spinner size="lg" />,
    Retinted: <Spinner className="docs-spinner-live" />,
  },
  dos: [
    'Use it for a short wait of unknown length, where the content will appear.',
    'Show it after a moment (about half a second), so a fast load doesn\'t flash.',
  ],
  donts: [
    'Don\'t use it when the amount is known: a ProgressBar says how far along it is.',
    'Don\'t cover a whole page with it: keep what already loaded on screen.',
  ],
};
