// New elements, with the defaults a designer expects: on-system values throughout.
import { uid, type CanvasNode } from './types';

const fit = { mode: 'fit' } as const;
const fixed = (value: number) => ({ mode: 'fixed', value }) as const;

export function newFrame(name: string, x: number, y: number, width: number, height: number): CanvasNode {
  return {
    id: uid(), type: 'frame', name, x, y,
    width: fixed(width), height: fixed(height),
    stack: { direction: 'column', gap: '--ps-space-16', padY: '--ps-space-24', padX: '--ps-space-24', align: 'start' },
    style: { fill: '--ps-bg' },
    theme: 'dark',
    children: [],
  };
}

export const newStack = (name = 'Stack', direction: 'row' | 'column' = 'column'): CanvasNode => ({
  id: uid(), type: 'stack', name,
  width: fit, height: fit,
  stack: { direction, gap: '--ps-space-12', padY: '--ps-space-16', padX: '--ps-space-16', align: 'start' },
  style: { fill: '--ps-surface-1', radius: '--ps-radius-2xl' },
  children: [],
});

export const newText = (text = 'Text', name = 'Text'): CanvasNode => ({
  id: uid(), type: 'text', name, text,
  width: fit, height: fit,
  style: { color: '--ps-text-1', fontSize: '--ps-font-size-md', fontWeight: '--ps-font-weight-regular', lineHeight: '--ps-leading-normal' },
});

export const newHeading = (): CanvasNode => ({
  ...newText('Heading', 'Heading'),
  style: { color: '--ps-text-1', fontSize: '--ps-font-size-2xl', fontWeight: '--ps-font-weight-bold', lineHeight: '--ps-leading-tight' },
});

export const newRect = (): CanvasNode => ({
  id: uid(), type: 'rect', name: 'Rectangle',
  width: fixed(160), height: fixed(120),
  style: { fill: '--ps-surface-2', radius: '--ps-radius-lg' },
});

export const newImage = (asset?: string, name = 'Image', width = 240, height = 160): CanvasNode => ({
  id: uid(), type: 'image', name, asset,
  width: fixed(width), height: fixed(height),
  style: { radius: '--ps-radius-lg', fit: 'cover', fill: '--ps-surface-2' },
});

export const newIcon = (icon: string): CanvasNode => ({
  id: uid(), type: 'icon', name: icon.replace(/^Icon/, ''), icon,
  width: fixed(20), height: fixed(20),
  style: { color: '--ps-text-1' },
});

export const newComponent = (name: string, props: Record<string, unknown>): CanvasNode => ({
  id: uid(), type: 'component', name,
  width: fit, height: fit,
  style: {},
  component: { name, props },
});

/** Frame sizes to pick from. */
export const FRAME_PRESETS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Tablet', width: 834, height: 1112 },
  { name: 'Phone', width: 390, height: 844 },
] as const;
