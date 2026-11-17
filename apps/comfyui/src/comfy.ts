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
  properties: Record<string, unknown>;
  onConfigure?: (info: unknown) => void;
  addDOMWidget: (name: string, type: string, element: HTMLElement, options: DOMWidgetOptions) => ComfyWidget;
  onRemoved?: () => void;
  setDirtyCanvas?: (fg: boolean, bg?: boolean) => void;
}

export interface ComfySetting {
  id: string;
  name: string;
  type: string;
  defaultValue: unknown;
  onChange?: (value: unknown) => void;
}

export interface ComfyExtension {
  name: string;
  settings?: ComfySetting[];
  aboutPageBadges?: { label: string; url: string; icon: string }[];
  setup?: () => void | Promise<void>;
  getCustomWidgets?: () => Record<string, (node: ComfyNode, inputName: string) => { widget: ComfyWidget }>;
}

export interface ComfyApp {
  registerExtension: (extension: ComfyExtension) => void;
  extensionManager?: {
    toast?: { add: (t: { severity: string; summary: string; detail?: string; life?: number }) => void };
    setting?: { get: (id: string) => unknown; set: (id: string, value: unknown) => Promise<void> };
    command?: { execute: (id: string) => Promise<void> };
    colorPalette?: { getActiveColorPalette?: () => { id?: string; light_theme?: boolean } | undefined };
  };
  /** The legacy settings dialog: still an EventTarget that fires "<setting id>.change". */
  ui?: { settings?: EventTarget };
}

/** ComfyUI's HTTP client: fetchApi prefixes the API path and sends the current user. */
export interface ComfyApi {
  fetchApi: (route: string, options?: RequestInit) => Promise<Response>;
}

declare global {
  interface Window {
    comfyAPI: { app: { app: ComfyApp }; api: { api: ComfyApi } };
  }
}

export const app = window.comfyAPI.app.app;
export const api = window.comfyAPI.api.api;
