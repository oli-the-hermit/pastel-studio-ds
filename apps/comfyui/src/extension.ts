import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { app, type ComfyNode } from './comfy';
import { createShadowHost } from './mount/shadowHost';
import { createValueStore } from './mount/valueStore';
import { PromptNode } from './nodes/PromptNode';

// A widget type of our own, so ComfyUI's Nodes 2.0 renderer doesn't swap in its text widget.
const WIDGET_TYPE = 'pastel-prompt';

app.registerExtension({
  name: 'PastelStudio.Core',
  getCustomWidgets: () => ({
    // Inputs declared as PASTEL_PROMPT in Python get this widget instead of a default one.
    PASTEL_PROMPT(node: ComfyNode, inputName: string) {
      const store = createValueStore('');
      const { host, container } = createShadowHost();
      const root = createRoot(container);
      root.render(createElement(PromptNode, { store }));

      const widget = node.addDOMWidget(inputName, WIDGET_TYPE, host, {
        getValue: store.get,
        setValue: (value) => store.set(typeof value === 'string' ? value : ''),
        getMinHeight: () => 240,
        hideOnZoom: true,
      });
      store.subscribe(() => node.setDirtyCanvas?.(true, false));

      const onRemoved = node.onRemoved;
      node.onRemoved = function () {
        root.unmount();
        onRemoved?.call(this);
      };
      return { widget };
    },
  }),
});
