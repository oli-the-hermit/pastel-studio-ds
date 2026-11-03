// Keyboard shortcuts. Ignored while typing in a field or in a text element on the canvas.
import { useEffect } from 'react';
import { copySelection, cutSelection, deleteSelection, duplicateSelection, groupSelection, nudgeSelection, paste, reorderSelection, selectParent, ungroupSelection } from './model/actions';
import { currentPage, flush, getState, redo, select, setEditing, undo } from './model/store';
import { find } from './model/tree';
import { zoomBy, zoomTo, zoomToFit } from './canvas/geometry';

const typing = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); void flush(); return; }
      if (typing(e.target) || !getState().project) return;
      const key = e.key.toLowerCase();
      const run = (fn: () => void) => { e.preventDefault(); fn(); };

      if (mod && key === 'z') return run(e.shiftKey ? redo : undo);
      if (mod && key === 'y') return run(redo);
      if (mod && key === 'd') return run(duplicateSelection);
      if (mod && key === 'c') return run(copySelection);
      if (mod && key === 'x') return run(cutSelection);
      if (mod && key === 'v') return run(() => void paste());
      if (mod && key === 'g') return run(e.shiftKey ? ungroupSelection : groupSelection);
      if (mod && key === 'a') return run(() => {
        const page = currentPage();
        const id = getState().selection[0];
        const parent = page && id ? find(page, id)?.parent : undefined;
        select((parent ? parent.children ?? [] : page?.frames ?? []).map((n) => n.id));
      });
      if (mod && (key === '=' || key === '+')) return run(() => zoomBy(1.25));
      if (mod && key === '-') return run(() => zoomBy(0.8));
      if (mod && key === '0') return run(() => zoomTo(1));
      if (mod && key === ']') return run(() => reorderSelection(1));
      if (mod && key === '[') return run(() => reorderSelection(-1));
      if (e.shiftKey && e.code === 'Digit1') return run(() => zoomToFit(currentPage()));
      if (e.shiftKey && e.code === 'Digit2') return run(() => zoomToFit(currentPage(), getState().selection.map((id) => find(currentPage()!, id)?.path[0]?.id ?? id)));
      if (key === 'delete' || key === 'backspace') return run(deleteSelection);
      if (key === 'escape') return run(() => { setEditing(undefined); selectParent(); });
      if (key === 'enter') return run(() => {
        const page = currentPage();
        const id = getState().selection[0];
        const node = page && id ? find(page, id)?.node : undefined;
        if (node?.type === 'text') setEditing(node.id);
        else if (node?.children?.length) select([node.children[0].id]);
      });
      const step = e.shiftKey ? 10 : 1;
      if (key === 'arrowleft') return run(() => nudgeSelection(-step, 0));
      if (key === 'arrowright') return run(() => nudgeSelection(step, 0));
      if (key === 'arrowup') return run(() => nudgeSelection(0, -step));
      if (key === 'arrowdown') return run(() => nudgeSelection(0, step));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
