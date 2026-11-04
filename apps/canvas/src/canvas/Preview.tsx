// Preview: one frame at its real size (smaller only when the window is narrower), its components live,
// with nothing of the editor in the way. Every frame and breakpoint of the page is a tab. Esc closes it.
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IconButton, IconClose } from '@pastel-studio/react';
import { currentPage, getState, setPreview, useEditor } from '../model/store';
import { breakpointFrames, lookup } from '../model/virtual';
import { LiveContext, RenderNode } from './RenderNode';

export function Preview() {
  const page = useEditor((s) => currentPage(s));
  const frames = useMemo(() => (page ? page.frames.filter((f) => !f.hidden).flatMap((f) => [f, ...breakpointFrames(f)]) : []), [page]);
  // It opens on the frame of the selection; picking a tab is the person's from then on.
  const [current, setCurrent] = useState(() => {
    const s = getState();
    const id = s.selection[0];
    const hit = page && id ? lookup(page, id, s.pages) : undefined;
    const top = hit ? (hit.path[0] ?? hit.node).id : undefined;
    return frames.find((f) => f.id === top)?.id ?? frames[0]?.id;
  });
  const frame = frames.find((f) => f.id === current) ?? frames[0];
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || !frame) return;
    const fit = () => {
      const w = frame.width.mode === 'fixed' ? frame.width.value : el.clientWidth;
      setScale(Math.min(1, (el.clientWidth - 48) / w));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frame]);

  if (!frame) return null;
  const w = frame.width.mode === 'fixed' ? frame.width.value : undefined;
  const h = frame.height.mode === 'fixed' ? frame.height.value : undefined;

  return (
    <div className="cv-preview">
      <div className="cv-preview-bar">
        <div className="cv-buttons" role="tablist" aria-label="Frames">
          {frames.map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={f.id === frame.id} className={`cv-buttons-option${f.id === frame.id ? ' is-active' : ''}`} onClick={() => setCurrent(f.id)}>
              {f.name}
            </button>
          ))}
        </div>
        <span className="cv-muted">{w ? `${w} × ${h ?? 'auto'}` : ''}{scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ''}</span>
        <IconButton size="sm" label="Close the preview (Esc)" onClick={() => setPreview(false)}><IconClose size={16} /></IconButton>
      </div>
      <div ref={stage} className="cv-preview-stage">
        <div className="cv-preview-frame" style={{ width: (w ?? 0) * scale || undefined, height: (h ?? 0) * scale || undefined }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', position: 'relative' }}>
            <LiveContext.Provider value>
              <RenderNode key={frame.id} node={{ ...frame, x: 0, y: 0 }} />
            </LiveContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
