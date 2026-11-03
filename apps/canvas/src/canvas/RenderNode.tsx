// A node as real DOM: stacks are flexboxes, components are the design system's own. Every element
// carries data-node-id, which is how the canvas finds what was clicked and where it sits.
import React, { Component, useEffect, useRef, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import * as PS from '@pastel-studio/react';
import { catalogEntry, isCallback } from '../data/components';
import { COVERS, FIXTURES } from '../data/fixtures';
import { updateNode } from '../model/actions';
import { setEditing, useEditor } from '../model/store';
import { css, type CanvasNode, type Size, type StackLayout } from '../model/types';
import { useAssetUrl } from './assets';

const ALIGN = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' } as const;
const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' } as const;

const registry = PS as unknown as Record<string, React.ComponentType<Record<string, unknown>> | undefined>;

/**
 * Plain JSON props to React props. A few markers stand for what JSON can't hold:
 * { $icon: "IconStar" } an icon, { $fixture: "album" } sample data, { $set: [...] } a Set,
 * { $input: "Placeholder" } a text field, { $cover: "tidal" } a sample picture.
 */
export function materialize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(materialize);
  if (value && typeof value === 'object') {
    const { $icon, $fixture, $set, $input, $cover, ...rest } = value as Record<string, unknown>;
    if (typeof $icon === 'string') {
      const Icon = registry[$icon];
      return Icon ? <Icon size={typeof rest.size === 'number' ? rest.size : 18} /> : null;
    }
    if (typeof $fixture === 'string') return FIXTURES[$fixture]?.(materialize(rest) as Record<string, unknown>);
    if (Array.isArray($set)) return new Set($set);
    if (typeof $input === 'string') return <input className="ps-input" placeholder={$input} readOnly />;
    if (typeof $cover === 'string') return <img src={COVERS[$cover]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
    return Object.fromEntries(Object.entries(rest).map(([k, x]) => [k, materialize(x)]));
  }
  return value;
}

const noop = () => {};

function sizeStyle(axis: 'width' | 'height', size: Size, parent: StackLayout | undefined, inFlow: boolean): CSSProperties {
  const main = parent && (parent.direction === 'row' ? 'width' : 'height') === axis;
  if (size.mode === 'fixed') return { [axis]: size.value, ...(main && inFlow ? { flexShrink: 0 } : {}) };
  if (size.mode === 'fill') {
    if (!inFlow || !parent) return { [axis]: '100%' };
    return main ? { flex: '1 1 0', [axis === 'width' ? 'minWidth' : 'minHeight']: 0 } : { alignSelf: 'stretch' };
  }
  return { [axis]: 'fit-content' };
}

export function nodeStyle(node: CanvasNode, parent: CanvasNode | undefined): CSSProperties {
  const s = node.style;
  const parentStack = parent?.stack;
  const topLevel = !parent;
  const inFlow = !!parentStack && !node.absolute;
  const style: CSSProperties = {
    position: topLevel || !inFlow ? 'absolute' : 'relative',
    ...(topLevel || !inFlow ? { left: node.x ?? 0, top: node.y ?? 0 } : {}),
    ...sizeStyle('width', node.width, parentStack, inFlow),
    ...sizeStyle('height', node.height, parentStack, inFlow),
    boxSizing: 'border-box',
    background: css(s.fill),
    borderRadius: css(s.radius),
    opacity: s.opacity,
    boxShadow: s.elevation === 'overlay' ? 'var(--ps-elev-overlay)' : undefined,
    color: css(s.color),
    fontSize: css(s.fontSize),
    fontWeight: css(s.fontWeight),
    lineHeight: css(s.lineHeight),
    textAlign: s.textAlign,
    display: node.hidden ? 'none' : undefined,
  };
  if (s.borderWidth) style.border = `${s.borderWidth}px ${s.borderStyle ?? 'solid'} ${css(s.borderColor) ?? 'var(--ps-surface-4)'}`;
  if (node.stack && (node.type === 'frame' || node.type === 'stack')) {
    const st = node.stack;
    Object.assign(style, {
      display: node.hidden ? 'none' : 'flex',
      flexDirection: st.direction,
      gap: css(st.gap),
      padding: `${css(st.padY) ?? '0'} ${css(st.padX) ?? '0'}`,
      alignItems: ALIGN[st.align ?? 'start'],
      justifyContent: JUSTIFY[st.justify ?? 'start'],
      flexWrap: st.wrap ? 'wrap' : 'nowrap',
    });
  }
  if (node.type === 'frame') {
    // A frame clips its content and contains anything fixed inside it (a modal's scrim, a toast).
    Object.assign(style, { overflow: 'hidden', contain: 'layout paint' });
  }
  return style;
}

class Boundary extends Component<{ name: string; children: ReactNode }, { error?: string }> {
  state: { error?: string } = {};
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  componentDidCatch(_e: unknown, _info: ErrorInfo) {}
  componentDidUpdate(prev: { children: ReactNode }) {
    if (prev.children !== this.props.children && this.state.error) this.setState({ error: undefined });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="cv-broken">
          <strong>{this.props.name}</strong> needs its props set: {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

function ComponentNode({ node }: { node: CanvasNode }) {
  const spec = node.component!;
  const Comp = registry[spec.name];
  if (!Comp) return <div className="cv-broken">No component {spec.name}</div>;
  const props = materialize(spec.props) as Record<string, unknown>;
  for (const p of catalogEntry(spec.name)?.props ?? []) if (isCallback(p) && props[p.name] === undefined) props[p.name] = noop;
  return (
    <Boundary name={spec.name}>
      <Comp {...props} />
    </Boundary>
  );
}

function ImageNode({ node }: { node: CanvasNode }) {
  const url = useAssetUrl(node.asset);
  if (!url) return <div className="cv-image-empty"><PS.IconFileImage size={28} /></div>;
  return <img src={url} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: node.style.fit ?? 'cover', display: 'block', borderRadius: 'inherit' }} />;
}

/**
 * Text, typed into in place after a double-click. Whatever ends the editing (Enter without Shift, Esc,
 * a click elsewhere, focus leaving) saves the text. The element is remounted on the way in and out,
 * so React never has to reconcile text nodes the typing replaced.
 */
function TextNode({ node, common }: { node: CanvasNode; common: { 'data-node-id': string; style: CSSProperties } }) {
  const editing = useEditor((s) => s.editing === node.id);
  const ref = useRef<HTMLDivElement>(null);
  const saved = useRef(node.text);
  saved.current = node.text;
  useEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    return () => {
      const text = el.innerText.replace(/\n$/, '');
      if (text !== saved.current) updateNode(node.id, (n) => { n.text = text; });
    };
  }, [editing, node.id]);
  const stop = () => setEditing(undefined);
  return (
    <div
      {...common}
      key={editing ? 'editing' : 'view'}
      ref={ref}
      className="cv-text"
      contentEditable={editing ? 'plaintext-only' : undefined}
      suppressContentEditableWarning
      onBlur={editing ? stop : undefined}
      onKeyDown={editing ? (e) => {
        e.stopPropagation();
        if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') { e.preventDefault(); stop(); }
      } : undefined}
    >
      {node.text}
    </div>
  );
}

export const RenderNode = React.memo(function RenderNode({ node, parent }: { node: CanvasNode; parent?: CanvasNode }) {
  const style = nodeStyle(node, parent);
  const common = { 'data-node-id': node.id, style } as const;
  switch (node.type) {
    case 'frame':
    case 'stack':
      return (
        <div {...common} data-theme={node.type === 'frame' ? node.theme : undefined} className={node.type === 'frame' ? 'cv-frame' : undefined}>
          {node.children?.map((c) => <RenderNode key={c.id} node={c} parent={node} />)}
        </div>
      );
    case 'text':
      return <TextNode node={node} common={common} />;
    case 'rect':
      return <div {...common} />;
    case 'image':
      return <div {...common} className="cv-image"><ImageNode node={node} /></div>;
    case 'icon': {
      const Icon = registry[node.icon ?? ''];
      const size = Math.min(node.width.mode === 'fixed' ? node.width.value : 20, node.height.mode === 'fixed' ? node.height.value : 20);
      return <div {...common} className="cv-icon">{Icon ? <Icon size={size} /> : null}</div>;
    }
    case 'component':
      return <div {...common} className="cv-component"><ComponentNode node={node} /></div>;
  }
});
