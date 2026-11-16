// Helpers that see through shadow roots. Inside one, document.activeElement, event.target and
// elementFromPoint stop at the shadow host, so focus and outside-click checks would be wrong.

/** The focused element, inside any shadow roots on the way. */
export function deepActiveElement(doc: Document = document): Element | null {
  let el = doc.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

/** The element at a viewport point, inside any shadow roots on the way. */
export function deepElementFromPoint(doc: Document, x: number, y: number): Element | null {
  let el = doc.elementFromPoint?.(x, y) ?? null;
  while (el?.shadowRoot) {
    const inner = el.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === el) break;
    el = inner;
  }
  return el;
}

/** Whether an event happened in `el`, even when it came from inside a shadow root. */
export function eventIsInside(e: Event, el: Element | null | undefined): boolean {
  if (!el) return false;
  return typeof e.composedPath === 'function' ? e.composedPath().includes(el) : el.contains(e.target as Node);
}
