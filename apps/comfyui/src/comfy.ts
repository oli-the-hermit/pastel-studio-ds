// The slice of ComfyUI's frontend API this pack uses. ComfyUI exposes its modules on
// window.comfyAPI, which works from any chunk regardless of where the pack is served.

export interface ComfyWidget {
  name: string;
  type: string;
  value: unknown;
  hidden?: boolean;
}

export interface DOMWidgetOptions {
  getValue: () => string;
  setValue: (value: string) => void;
  getMinHeight?: () => number;
  hideOnZoom?: boolean;
  margin?: number;
}

export interface ComfyNode {
  id: number | string;
  widgets?: ComfyWidget[];
  addDOMWidget: (name: string, type: string, element: HTMLElement, options: DOMWidgetOptions) => ComfyWidget;
  onRemoved?: () => void;
  setDirtyCanvas?: (fg: boolean, bg?: boolean) => void;
}

export interface ComfyExtension {
  name: string;
  getCustomWidgets?: () => Record<string, (node: ComfyNode, inputName: string) => { widget: ComfyWidget }>;
}

export interface ComfyApp {
  registerExtension: (extension: ComfyExtension) => void;
  extensionManager?: {
    toast?: { add: (t: { severity: string; summary: string; detail?: string; life?: number }) => void };
    setting?: { get: (id: string) => unknown; set: (id: string, value: unknown) => Promise<void> };
  };
}

declare global {
  interface Window {
    comfyAPI: { app: { app: ComfyApp } };
  }
}

export const app = window.comfyAPI.app.app;
