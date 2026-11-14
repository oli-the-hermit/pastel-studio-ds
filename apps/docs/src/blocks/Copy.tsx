import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { cx, IconCheck, ToastRegion, useToasts } from '@pastel-studio/react';

// Click-to-copy for the swatch book: a value button shows "Copied" in place for a moment, and a
// toast confirms what went to the clipboard. Works without the Clipboard API (plain http, old
// browsers) through a hidden text area.

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text });
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok: boolean;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

interface CopyApi {
  copy: (value: string, key: string) => void;
  copied: string | null;
}

const CopyContext = createContext<CopyApi | null>(null);

/** How long a button says "Copied". */
const COPIED_MS = 1400;

export function CopyProvider({ children }: { children: React.ReactNode }) {
  const { toasts, showToast } = useToasts();
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback((value: string, key: string) => {
    void writeClipboard(value).then((ok) => {
      if (!ok) { showToast(`Couldn't copy ${value}`, 'error'); return; }
      setCopied(key);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), COPIED_MS);
      showToast(<>Copied <span className="docs-copy-toast-value">{value}</span></>, 'success');
    });
  }, [showToast]);

  return (
    <CopyContext.Provider value={{ copy, copied }}>
      {children}
      <ToastRegion toasts={toasts} className="docs-copy-toasts" />
    </CopyContext.Provider>
  );
}

function useCopy(): CopyApi {
  const ctx = useContext(CopyContext);
  if (!ctx) throw new Error('CopyButton must be inside CopyProvider');
  return ctx;
}

interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** What goes to the clipboard. */
  value: string;
  /** Unique on the page, so only this button says "Copied". */
  copyKey: string;
  /** What the button shows; the value by default. */
  children?: React.ReactNode;
  /** Read out before the value: "Copy the hex of Lime 85". */
  what: string;
}

/** A value that copies itself when clicked. */
export function CopyButton({ value, copyKey, children, what, className, ...rest }: CopyButtonProps) {
  const { copy, copied } = useCopy();
  const done = copied === copyKey;
  return (
    <button
      type="button"
      className={cx('docs-copy', done && 'is-copied', className)}
      aria-label={`Copy ${what}: ${value}`}
      onClick={() => copy(value, copyKey)}
      {...rest}
    >
      {children ?? value}
      {done && (
        <span className="docs-copy-done" aria-hidden="true">
          <IconCheck size={14} />Copied
        </span>
      )}
    </button>
  );
}
