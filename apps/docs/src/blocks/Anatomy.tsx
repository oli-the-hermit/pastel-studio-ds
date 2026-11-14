import React, { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '@pastel-studio/react';
import { scaleGroup, toPx } from '../tokens';
import type { Token } from '../tokens/types';
import '../styles/anatomy.css';

// An anatomy figure: a live component, enlarged, with its measurements drawn over it. Nothing is
// typed in by hand: the box, its padding, the gaps between its parts and its corner radius are
// measured from the rendered element, and each value is named after the token it matches.

export type AnatomyKind = 'size' | 'padding' | 'gap' | 'radius' | 'parts';

export interface AnatomyPart {
  /** A selector inside the measured element; ':scope' is the element itself, '#text' its first run of text. */
  selector: string;
  label: string;
}

export interface AnatomySpec {
  /** One live instance of the component. */
  example: React.ReactNode;
  /** The element to measure, inside the example. Default: the example's first element. */
  target?: string;
  /** The parts to number, in order. Default: the measured element's visible children. */
  parts?: AnatomyPart[];
  /** What to draw. Default: everything. */
  show?: AnatomyKind[];
  /** A fixed width for block-level components, which would otherwise take the whole line. */
  width?: number;
  /** The largest enlargement. Default 3. */
  maxScale?: number;
  /** A line under the figure. */
  caption?: React.ReactNode;
}

interface AnatomyProps extends AnatomySpec {
  /** Token names to prefer when a value matches several (a component's own tokens). */
  prefer?: string[];
}

interface Box { x: number; y: number; w: number; h: number }
interface Measured {
  /** The rendered scale, and the example's natural size. */
  natural: { w: number; h: number };
  box: Box;
  padding: { top: number; right: number; bottom: number; left: number };
  border: { top: number; right: number; bottom: number; left: number };
  radius: { px: number; raw: string };
  /** Which way the parts run. */
  axis: 'row' | 'column';
  /** The space between consecutive parts, as drawn: a flex or grid gap, or margins. */
  gaps: (Box & { px: number; flexible: boolean })[];
  parts: { label: string; box: Box }[];
}

const KIND_LABEL: Record<Exclude<AnatomyKind, 'parts'>, string> = { size: 'Size', padding: 'Padding', gap: 'Gap', radius: 'Radius' };

/** "ps-button-label" → "Label"; an svg → "Icon". */
function guessLabel(el: Element, root: Element): string {
  if (el instanceof SVGElement) return 'Icon';
  const rootClass = [...root.classList].find((c) => c.startsWith('ps-') && !c.includes('--')) ?? '';
  const own = [...el.classList].find((c) => c.startsWith('ps-') && !c.includes('--'));
  if (own) {
    // Drop the words the part shares with its component: ps-tabs-list > ps-tabs-tab is "Tab".
    const a = rootClass.split('-');
    const b = own.split('-');
    let i = 0;
    while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
    const words = b.slice(Math.max(i, 1)).join(' ');
    return words[0].toUpperCase() + words.slice(1);
  }
  if (el.querySelector('svg') && !el.textContent?.trim()) return 'Icon';
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return 'Input';
  return el.textContent?.trim() ? 'Text' : el.tagName.toLowerCase();
}

const visible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
};

/** A child the figure can point at: an element, or a run of text (a button's label). */
interface Piece { node: Node; rect: DOMRect; label: () => string }

function pieces(target: Element): Piece[] {
  return [...target.childNodes].flatMap((node): Piece[] => {
    if (node instanceof Element) {
      return visible(node) ? [{ node, rect: node.getBoundingClientRect(), label: () => guessLabel(node, target) }] : [];
    }
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      return rect.width > 0 ? [{ node, rect, label: () => 'Label' }] : [];
    }
    return [];
  });
}

function measure(wrapper: HTMLElement, spec: AnatomySpec): Measured | null {
  const target = (spec.target ? wrapper.querySelector(spec.target) : wrapper.firstElementChild) as HTMLElement | null;
  if (!target || !visible(target)) return null;
  const wr = wrapper.getBoundingClientRect();
  // The scale the figure applied, read back from the transform, so values come out exact.
  const transform = getComputedStyle(wrapper).transform;
  const scale = transform && transform !== 'none' ? new DOMMatrix(transform).a || 1 : 1;
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const rel = (r: DOMRect): Box => ({ x: r2((r.left - wr.left) / scale), y: r2((r.top - wr.top) / scale), w: r2(r.width / scale), h: r2(r.height / scale) });
  const box = rel(target.getBoundingClientRect());
  const cs = getComputedStyle(target);
  const n = (v: string) => parseFloat(v) || 0;

  const kids = pieces(target);
  const display = cs.display;
  const axis: Measured['axis'] = display.includes('flex') && !cs.flexDirection.startsWith('column') ? 'row' : 'column';
  // Measured, not read from the gap property: margins between blocks count as well.
  const gaps: Measured['gaps'] = [];
  const boxes = kids.map((k) => rel(k.rect));
  const innerL = box.x + n(cs.borderLeftWidth) + n(cs.paddingLeft);
  const innerW = box.w - n(cs.borderLeftWidth) - n(cs.borderRightWidth) - n(cs.paddingLeft) - n(cs.paddingRight);
  // In a flex row, space beyond the gap was pushed there (an auto margin, a growing part).
  const isFlex = display.includes('flex');
  const cssGap = axis === 'row' ? n(cs.columnGap) : n(cs.rowGap);
  const flexible = (d: number) => isFlex && d > cssGap + 0.5;
  for (let i = 1; i < boxes.length; i++) {
    const a = boxes[i - 1];
    const b = boxes[i];
    if (axis === 'row') {
      const d = r2(b.x - (a.x + a.w));
      const top = Math.min(a.y, b.y);
      if (d > 0.5) gaps.push({ x: a.x + a.w, y: top, w: d, h: Math.max(a.y + a.h, b.y + b.h) - top, px: d, flexible: flexible(d) });
    } else {
      const d = r2(b.y - (a.y + a.h));
      if (d > 0.5) gaps.push({ x: innerL, y: a.y + a.h, w: innerW, h: d, px: d, flexible: flexible(d) });
    }
  }

  const textPiece = kids.find((k) => k.node.nodeType === Node.TEXT_NODE);
  const parts: { label: string; rect: DOMRect }[] = spec.parts
    ? spec.parts.flatMap((p) => {
      if (p.selector === '#text') return textPiece ? [{ label: p.label, rect: textPiece.rect }] : [];
      const el = p.selector === ':scope' ? target : target.querySelector(p.selector);
      return el && visible(el) ? [{ label: p.label, rect: el.getBoundingClientRect() }] : [];
    })
    : kids.map((k) => ({ label: k.label(), rect: k.rect }));

  const raw = cs.borderTopLeftRadius;
  return {
    natural: { w: wr.width / scale, h: wr.height / scale },
    box,
    padding: { top: n(cs.paddingTop), right: n(cs.paddingRight), bottom: n(cs.paddingBottom), left: n(cs.paddingLeft) },
    border: { top: n(cs.borderTopWidth), right: n(cs.borderRightWidth), bottom: n(cs.borderBottomWidth), left: n(cs.borderLeftWidth) },
    radius: { px: raw.endsWith('%') ? (parseFloat(raw) / 100) * Math.min(box.w, box.h) * 2 : n(raw), raw },
    axis,
    gaps,
    parts: parts.map(({ label, rect }) => ({ label, box: rel(rect) })),
  };
}

// ── Values to token names ─────────────────────────────────────

const groups = {
  space: scaleGroup('Space').tokens,
  radius: scaleGroup('Radius').tokens,
  size: scaleGroup('Component sizes').tokens,
};

const fmt = (n: number) => String(Math.round(n * 10) / 10);

/** "20 · --ps-space-20": a value, and the token it matches if one does. */
function named(px: number, kind: keyof typeof groups, prefer: string[] = []): { value: string; token?: string } {
  const matches = groups[kind].filter((t: Token) => !t.value.endsWith('%') && Math.abs(toPx(t.value) - px) < 0.5);
  // Many component sizes share a value (40px is a button, a row and an icon button), so a size is
  // only named after a token the component itself reads. Space and radius steps are unique.
  const token = matches.find((t) => prefer.includes(t.name)) ?? (kind === 'size' ? undefined : matches[0]);
  return { value: `${fmt(px)}px`, token: token?.name };
}

function radiusName(m: Measured, prefer: string[]): { value: string; token?: string } {
  if (m.radius.raw.endsWith('%')) return { value: m.radius.raw, token: m.radius.raw === '50%' ? '--ps-radius-round' : undefined };
  if (m.radius.px >= Math.min(m.box.w, m.box.h) / 2 && m.radius.px > 100) return { value: 'pill', token: '--ps-radius-pill' };
  return named(m.radius.px, 'radius', prefer);
}

// ── Drawing ───────────────────────────────────────────────────

const MARGIN = { top: 76, side: 64, bottom: 72, sideParts: 132 };
/** On a phone the margins shrink, so the example keeps most of the width. */
const NARROW = { side: 40, sideParts: 84 };
/** The tallest an enlarged example may be on the page. */
const MAX_HEIGHT = 420;

interface Legend { kind: Exclude<AnatomyKind, 'parts'>; what: string; value: string; token?: string }

export function Anatomy({ example, target, parts, show, width, maxScale = 3, caption, prefer = [] }: AnatomyProps) {
  const uid = useId().replace(/:/g, '');
  const frameRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<Measured | null>(null);
  const [frameW, setFrameW] = useState(0);
  const spec = useRef<AnatomySpec>({ example, target, parts, width });
  spec.current = { example, target, parts, width };

  const update = useCallback(() => {
    const frame = frameRef.current;
    const wrapper = wrapperRef.current;
    if (!frame || !wrapper) return;
    setFrameW(frame.clientWidth);
    setM(measure(wrapper, spec.current));
  }, []);

  useLayoutEffect(() => {
    update();
    const observer = new ResizeObserver(update);
    if (frameRef.current) observer.observe(frameRef.current);
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
      const first = wrapperRef.current.firstElementChild;
      if (first) observer.observe(first);
    }
    void document.fonts?.ready.then(update);
    return () => observer.disconnect();
  }, [update]);

  const on = (kind: AnatomyKind) => !show || show.includes(kind);
  // Column layouts put the part numbers on the right, row layouts above.
  const sideParts = !!m && on('parts') && m.parts.length > 1 && m.axis === 'column';
  const narrow = frameW > 0 && frameW < 520;
  const side = narrow ? NARROW.side : MARGIN.side;
  const marginRight = sideParts ? (narrow ? NARROW.sideParts : MARGIN.sideParts) : side;
  let s = 1;
  if (m && frameW > 0) {
    const fitW = (frameW - side - marginRight) / m.natural.w;
    s = Math.max(0.5, Math.min(maxScale, fitW, MAX_HEIGHT / m.natural.h));
  }
  const natW = m?.natural.w ?? 0;
  const natH = m?.natural.h ?? 0;
  const ox = Math.max(side, (frameW - natW * s - marginRight + side) / 2);
  // Room above for the numbered callouts only when they go there.
  const partsAbove = !!m && on('parts') && m.parts.length > 0 && !sideParts;
  const oy = partsAbove ? MARGIN.top : 40;
  const stageH = m ? oy + natH * s + MARGIN.bottom : 160;
  const X = (u: number) => ox + u * s;
  const Y = (u: number) => oy + u * s;

  const legend: Legend[] = [];
  const shapes: React.ReactNode[] = [];
  const tags: React.ReactNode[] = [];
  const tag = (key: string, kind: Legend['kind'] | 'part', x: number, y: number, text: string, align: 'center' | 'left' | 'right' = 'center') => {
    tags.push(<span key={key} className={cx('docs-anatomy-tag', `is-${kind}`, `is-${align}`)} style={{ left: x, top: y }}>{text}</span>);
  };

  if (m) {
    const b = m.box;
    const L = X(b.x);
    const T = Y(b.y);
    const W = b.w * s;
    const H = b.h * s;
    const p = m.padding;
    const bw = m.border;

    // When the measured element is part of a larger example, the rest steps back.
    if (target) {
      const r = Math.min(m.radius.px * s, W / 2, H / 2);
      shapes.push(
        <path
          key="dim"
          className="docs-anatomy-dimmer"
          fillRule="evenodd"
          d={`M ${X(0)} ${Y(0)} h ${m.natural.w * s} v ${m.natural.h * s} h ${-m.natural.w * s} Z M ${L + r} ${T} h ${W - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${H - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(W - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(H - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`}
        />,
      );
    }

    // The container's own outline.
    shapes.push(<rect key="box" className="docs-anatomy-outline" x={L} y={T} width={W} height={H} rx={Math.min(m.radius.px * s, W / 2, H / 2)} />);

    if (on('padding')) {
      const inner = { l: L + bw.left * s, t: T + bw.top * s, r: L + W - bw.right * s, b: T + H - bw.bottom * s };
      const bands = [
        { side: 'left', v: p.left, x: inner.l, y: inner.t, w: p.left * s, h: inner.b - inner.t },
        { side: 'right', v: p.right, x: inner.r - p.right * s, y: inner.t, w: p.right * s, h: inner.b - inner.t },
        { side: 'top', v: p.top, x: inner.l, y: inner.t, w: inner.r - inner.l, h: p.top * s },
        { side: 'bottom', v: p.bottom, x: inner.l, y: inner.b - p.bottom * s, w: inner.r - inner.l, h: p.bottom * s },
      ].filter((band) => band.v > 0);
      bands.forEach((band) => {
        shapes.push(<rect key={`pad-${band.side}`} className="docs-anatomy-band is-padding" x={band.x} y={band.y} width={band.w} height={band.h} fill={`url(#${uid}-padding)`} />);
        if (Math.min(band.w, band.h) >= 14) tag(`pad-${band.side}`, 'padding', band.x + band.w / 2, band.y + band.h / 2, fmt(band.v));
      });
      // One line per distinct value: "Left and right 20", "Top and bottom 12".
      const sides = [['top', p.top], ['right', p.right], ['bottom', p.bottom], ['left', p.left]] as const;
      const byValue = new Map<number, string[]>();
      sides.forEach(([side, v]) => { if (v > 0) byValue.set(v, [...(byValue.get(v) ?? []), side]); });
      const sideWords = (list: string[]) => {
        if (list.length === 4) return 'All sides';
        const pairs = list.join(',') === 'top,bottom' ? 'Top and bottom' : list.join(',') === 'right,left' ? 'Left and right' : null;
        if (pairs) return pairs;
        const words = list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
        return words[0].toUpperCase() + words.slice(1);
      };
      byValue.forEach((list, v) => {
        const named0 = named(v, 'space', prefer);
        legend.push({ kind: 'padding', what: sideWords(list), value: named0.value, token: named0.token });
      });
    }

    if (on('gap') && m.gaps.length > 0) {
      m.gaps.forEach((g, i) => {
        const gx = X(g.x);
        const gy = Y(g.y);
        const gw = g.w * s;
        const gh = g.h * s;
        shapes.push(<rect key={`gap-${i}`} className="docs-anatomy-band is-gap" x={gx} y={gy} width={gw} height={gh} fill={`url(#${uid}-gap)`} />);
        const text = g.flexible ? '↔' : fmt(g.px);
        if (m.axis === 'row') tag(`gap-${i}`, 'gap', gx + gw / 2, gy + gh + 12, text);
        else tag(`gap-${i}`, 'gap', gx + gw / 2, gy + gh / 2, g.flexible ? '↕' : text);
      });
      const fixed = m.gaps.filter((g) => !g.flexible);
      const values = [...new Set(fixed.map((g) => g.px))];
      values.forEach((px) => {
        const n = named(px, 'space', prefer);
        legend.push({ kind: 'gap', what: 'Between parts', value: n.value, token: n.token });
      });
      if (fixed.length < m.gaps.length) {
        legend.push({ kind: 'gap', what: 'Pushed apart', value: 'flexible', token: 'fills the free space' });
      }
    }

    if (on('radius') && m.radius.px > 0) {
      // The bottom-right corner: an arc along the curve, and its value outside the box.
      const r = Math.min(m.radius.px * s, W / 2, H / 2);
      const cx0 = L + W - r;
      const cy0 = T + H - r;
      shapes.push(
        <g key="radius" className="docs-anatomy-radius">
          <path d={`M ${L + W} ${cy0} A ${r} ${r} 0 0 1 ${cx0} ${T + H}`} />
          <line x1={cx0} y1={cy0} x2={cx0 + r * Math.SQRT1_2} y2={cy0 + r * Math.SQRT1_2} />
          <circle cx={cx0} cy={cy0} r={2.5} />
        </g>,
      );
      const n = radiusName(m, prefer);
      tag('radius', 'radius', L + W + 8, T + H + 10, n.value === 'pill' ? 'pill' : fmt(m.radius.px), 'left');
      legend.push({ kind: 'radius', what: 'Corners', value: n.value, token: n.token });
    }

    if (on('size')) {
      // Width below the box, height on its left: dimension lines with end ticks.
      // Below everything the example draws, with extension lines when that's lower than the box.
      const bottom = Math.max(T + H, Y(m.natural.h));
      const dy = bottom + 26;
      const dx = L - 26;
      shapes.push(
        <g key="dims" className="docs-anatomy-dims">
          {bottom > T + H + 2 && (
            <g className="docs-anatomy-extension">
              <line x1={L} y1={T + H} x2={L} y2={dy + 5} />
              <line x1={L + W} y1={T + H} x2={L + W} y2={dy + 5} />
            </g>
          )}
          <line x1={L} y1={dy} x2={L + W} y2={dy} />
          <line x1={L} y1={dy - 5} x2={L} y2={dy + 5} />
          <line x1={L + W} y1={dy - 5} x2={L + W} y2={dy + 5} />
          <line x1={dx} y1={T} x2={dx} y2={T + H} />
          <line x1={dx - 5} y1={T} x2={dx + 5} y2={T} />
          <line x1={dx - 5} y1={T + H} x2={dx + 5} y2={T + H} />
        </g>,
      );
      tag('w', 'size', L + W / 2, dy, fmt(b.w));
      tag('h', 'size', dx, T + H / 2, fmt(b.h));
      const h = named(b.h, 'size', prefer);
      legend.push({ kind: 'size', what: 'Height', value: h.value, token: h.token });
      const w = named(b.w, 'size', prefer);
      legend.push({ kind: 'size', what: 'Width', value: w.value, token: w.token ?? (width ? 'set by its container' : 'follows its content') });
    }

    if (on('parts')) {
      // Numbered callouts, spread so they never overlap.
      const pts = m.parts.map((part) => ({ ...part, bx: X(part.box.x), by: Y(part.box.y), bw: part.box.w * s, bh: part.box.h * s }));
      const minStep = 28;
      if (sideParts) {
        let last = -Infinity;
        const cxCall = L + W + 44;
        pts.forEach((pt, i) => {
          const want = pt.by + pt.bh / 2;
          const cy = Math.max(want, last + minStep);
          last = cy;
          shapes.push(
            <g key={`part-${i}`} className="docs-anatomy-part">
              <rect x={pt.bx} y={pt.by} width={pt.bw} height={pt.bh} />
              <polyline points={`${pt.bx + pt.bw},${want} ${cxCall - 22},${want} ${cxCall - 11},${cy}`} />
            </g>,
          );
          tag(`part-${i}`, 'part', cxCall, cy, String(i + 1));
        });
      } else {
        let last = -Infinity;
        const cyCall = T - 40;
        pts.forEach((pt, i) => {
          const want = pt.bx + pt.bw / 2;
          const cx = Math.max(want, last + minStep);
          last = cx;
          shapes.push(
            <g key={`part-${i}`} className="docs-anatomy-part">
              <rect x={pt.bx} y={pt.by} width={pt.bw} height={pt.bh} />
              <polyline points={`${want},${pt.by} ${want},${cyCall + 22} ${cx},${cyCall + 11}`} />
            </g>,
          );
          tag(`part-${i}`, 'part', cx, cyCall, String(i + 1));
        });
      }
    }
  }

  const partList = m && on('parts') ? m.parts : [];
  return (
    <figure className="docs-anatomy">
      <div ref={frameRef} className="docs-anatomy-stage" style={{ height: stageH }}>
        <div
          ref={wrapperRef}
          className="docs-anatomy-specimen"
          style={{ left: ox, top: oy, width, transform: `scale(${s})`, opacity: m ? undefined : 0 }}
        >
          {example}
        </div>
        {m && (
          <>
            <svg className="docs-anatomy-overlay" width="100%" height={stageH} aria-hidden="true">
              <defs>
                {(['padding', 'gap'] as const).map((k) => (
                  <pattern key={k} id={`${uid}-${k}`} className={`docs-anatomy-hatch is-${k}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" />
                    <line x1="0" y1="0" x2="0" y2="6" />
                  </pattern>
                ))}
              </defs>
              {shapes}
            </svg>
            <div className="docs-anatomy-tags" aria-hidden="true">{tags}</div>
          </>
        )}
      </div>
      {m && (
        <figcaption className="docs-anatomy-legend">
          {partList.length > 0 && (
            <ol className="docs-anatomy-parts">
              {partList.map((part, i) => (
                <li key={i}><span className="docs-anatomy-num" aria-hidden="true">{i + 1}</span>{part.label}</li>
              ))}
            </ol>
          )}
          {legend.length > 0 && (
            <dl className="docs-anatomy-values">
              {legend.map((item, i) => (
                <div key={i} className={`docs-anatomy-value is-${item.kind}`}>
                  <dt><span className="docs-anatomy-key" aria-hidden="true" />{KIND_LABEL[item.kind]}<span className="docs-anatomy-what">{item.what}</span></dt>
                  <dd>
                    <span className="docs-anatomy-px">{item.value}</span>
                    {item.token && (item.token.startsWith('--') ? <code className="docs-code">{item.token}</code> : <span className="docs-anatomy-note">{item.token}</span>)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {caption && <p className="docs-anatomy-caption">{caption}</p>}
        </figcaption>
      )}
    </figure>
  );
}
