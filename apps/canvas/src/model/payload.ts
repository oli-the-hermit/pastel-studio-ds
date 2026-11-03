// What the library hands the canvas, by click or by drag, and the elements it becomes.
import { catalogEntry, defaultProps } from '../data/components';
import { getState } from './store';
import { newComponent, newFrame, newHeading, newIcon, newImage, newRect, newStack, newText } from './factory';
import type { CanvasNode } from './types';

export type ElementKind = 'frame' | 'column' | 'row' | 'text' | 'heading' | 'rect' | 'image';

export type Payload =
  | { kind: 'element'; element: ElementKind }
  | { kind: 'component'; name: string }
  | { kind: 'icon'; name: string }
  | { kind: 'asset'; id: string };

export const PAYLOAD_MIME = 'application/x-pastel-canvas';

export function nodesFor(p: Payload): CanvasNode[] {
  switch (p.kind) {
    case 'element':
      switch (p.element) {
        case 'frame': return [newFrame('Frame', 0, 0, 1440, 900)];
        case 'column': return [newStack('Stack', 'column')];
        case 'row': return [newStack('Row', 'row')];
        case 'text': return [newText()];
        case 'heading': return [newHeading()];
        case 'rect': return [newRect()];
        case 'image': return [newImage()];
      }
      break;
    case 'component':
      return [newComponent(catalogEntry(p.name)?.exportName ?? p.name, defaultProps(p.name))];
    case 'icon':
      return [newIcon(p.name)];
    case 'asset': {
      const a = getState().library.assets.find((x) => x.id === p.id);
      if (!a) return [];
      const scale = a.width && a.width > 480 ? 480 / a.width : 1;
      return [newImage(a.id, a.name.replace(/\.[^.]+$/, ''), Math.round((a.width ?? 240) * scale), Math.round((a.height ?? 160) * scale))];
    }
  }
  return [];
}

export function setDragPayload(e: React.DragEvent, p: Payload) {
  e.dataTransfer.setData(PAYLOAD_MIME, JSON.stringify(p));
  e.dataTransfer.effectAllowed = 'copy';
}
