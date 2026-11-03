// The document: what a project, a page and each element on it are, as saved on disk. Kept plain and
// readable on purpose: Claude reads these files to learn what was changed.

/**
 * A design value. A token name ("--ps-surface-2") is on the system; anything else ("#ff0000",
 * "13px") is a raw value, shown as "off-system" so it reads as a proposed change to the tokens.
 */
export type Value = string;

export const isToken = (v: Value | undefined): v is string => !!v && v.startsWith('--ps-');
/** The CSS for a value: a token becomes var(--ps-…). */
export const css = (v: Value | undefined): string | undefined => (v === undefined || v === '' ? undefined : isToken(v) ? `var(${v})` : v);

/** How an element sizes along one axis: a fixed size, fill the free space, or fit its content. */
export type Size = { mode: 'fixed'; value: number } | { mode: 'fill' } | { mode: 'fit' };

export type NodeType = 'frame' | 'stack' | 'text' | 'rect' | 'image' | 'icon' | 'component';

export interface StackLayout {
  direction: 'row' | 'column';
  gap?: Value;
  /** Padding along the block axis (top and bottom) and the inline axis (left and right). */
  padY?: Value;
  padX?: Value;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
}

export interface Style {
  fill?: Value;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderColor?: Value;
  radius?: Value;
  elevation?: 'none' | 'overlay';
  opacity?: number;
  /** Text and icons. */
  color?: Value;
  fontSize?: Value;
  fontWeight?: Value;
  lineHeight?: Value;
  textAlign?: 'left' | 'center' | 'right';
  /** Images. */
  fit?: 'cover' | 'contain';
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  name: string;
  hidden?: boolean;
  locked?: boolean;
  /**
   * Position: on the canvas for a page's frames; inside the parent for an element placed
   * absolutely (a frame without a stack, or `absolute`).
   */
  x?: number;
  y?: number;
  absolute?: boolean;
  width: Size;
  height: Size;
  /** Frames and stacks: how the children are laid out. A frame without one places them absolutely. */
  stack?: StackLayout;
  style: Style;
  /** Frames: the theme inside. */
  theme?: 'dark' | 'light';
  text?: string;
  /** Images: the asset's id in the library. */
  asset?: string;
  /** Icons: the export name, "IconStar". */
  icon?: string;
  /** Components: the design-system export and its props. */
  component?: { name: string; props: Record<string, unknown> };
  children?: CanvasNode[];
}

export interface Page {
  id: string;
  name: string;
  /** The top-level frames (artboards), placed on the canvas. */
  frames: CanvasNode[];
}

export interface ProjectFile {
  version: 1;
  name: string;
  pages: { id: string; name: string }[];
}

/** Images and the way they're organized. Blocks join this file in phase 2. */
export interface LibraryFile {
  version: 1;
  folders: { id: string; name: string; parent?: string }[];
  assets: Asset[];
}

export interface Asset {
  id: string;
  kind: 'image';
  name: string;
  /** Path inside the project folder: "assets/ab12.png". */
  file: string;
  folder?: string;
  tags: string[];
  favorite?: boolean;
  width?: number;
  height?: number;
  added: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
