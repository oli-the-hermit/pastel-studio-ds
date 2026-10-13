/** Reads a token from the page, e.g. cssVar('--ps-accent'). */
export function cssVar(name: string, doc: Document = document): string {
  return getComputedStyle(doc.documentElement).getPropertyValue(name).trim();
}

/**
 * A duration token in milliseconds, e.g. cssDurationMs('--ps-dur-2') → 180. Timers that
 * wait for a CSS animation read the token instead of repeating its value.
 */
export function cssDurationMs(name: string, doc: Document = document): number {
  const raw = cssVar(name, doc);
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.endsWith('ms') ? n : n * 1000;
}
