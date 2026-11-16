import { lazy, Suspense } from 'react';
import { PortalProvider, Spinner } from '@pastel-studio/react';
import { overlayLayer } from '../mount/overlayLayer';
import type { ValueStore } from '../mount/valueStore';

// The editor (TipTap and ProseMirror) loads with the first Pastel Prompt on the canvas, not
// with ComfyUI.
const PromptNodeUI = lazy(() => import('./PromptNodeUI'));

export function PromptNode({ store }: { store: ValueStore }) {
  return (
    <PortalProvider container={overlayLayer()}>
      <Suspense fallback={<div className="pastel-loading"><Spinner /></div>}>
        <PromptNodeUI store={store} />
      </Suspense>
    </PortalProvider>
  );
}
