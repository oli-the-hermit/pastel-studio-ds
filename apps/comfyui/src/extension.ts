import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { version } from '../package.json';
import { app, type ComfyNode } from './comfy';
import { links } from './lib/about';
import { loadSettings, settingDefinitions } from './lib/settings';
import { startTheming } from './lib/theme';
import { createShadowHost } from './mount/shadowHost';
import { createValueStore } from './mount/valueStore';
import { PromptNode } from './nodes/PromptNode';

// A widget type of our own, so ComfyUI's Nodes 2.0 renderer doesn't swap in its text widget.
const WIDGET_TYPE = 'pastel-prompt';
// The name the prompt was saved or loaded under: kept with the node, so it survives a reload.
const NAME_PROPERTY = 'pastel_prompt_name';

app.registerExtension({
  name: 'PastelStudio.Core',
  settings: settingDefinitions,
  aboutPageBadges: [{ label: `Pastel Studio v${version}`, url: links.repo, icon: 'pi pi-github' }],
  setup() {
    loadSettings();
    startTheming();
  },
  getCustomWidgets: () => ({
    // Inputs declared as PASTEL_PROMPT in Python get this widget instead of a default one.
    PASTEL_PROMPT(node: ComfyNode, inputName: string) {
      const store = createValueStore('');
      node.properties ??= {};
      const nameStore = createValueStore(String(node.properties[NAME_PROPERTY] ?? ''));
      nameStore.subscribe(() => {
        node.properties[NAME_PROPERTY] = nameStore.get();
      });
      // A loaded workflow restores the properties after the widget is made.
      const onConfigure = node.onConfigure;
      node.onConfigure = function (info) {
        onConfigure?.call(this, info);
        nameStore.set(String(node.properties[NAME_PROPERTY] ?? ''));
      };

      const { host, container, release } = createShadowHost();
      const root = createRoot(container);
      root.render(createElement(PromptNode, { store, nameStore }));

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
        release();
        onRemoved?.call(this);
      };
      return { widget };
    },
  }),
});
