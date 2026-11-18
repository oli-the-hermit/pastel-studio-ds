import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';
import { mergeRefs } from '../../lib/mergeRefs';
import { usePortalContainer } from '../../lib/portal';
import { placeBeside } from '../../lib/position';

/** What a tooltip says: a name, the key that does the same, and one line about what it does. */
export interface TooltipContent {
  label: React.ReactNode;
  /** The keyboard shortcut as menus print it: "Ctrl+C". */
  shortcut?: string;
  /** One short sentence, for a control whose name doesn't explain it. */
  description?: React.ReactNode;
}

export interface TooltipOptions {
  /** Only when the element's text is cut off (an ellipsis), e.g. a long file name. */
  onlyWhenClipped?: boolean;
}

/** How long the pointer rests on something before its tooltip shows, in ms. */
export const TOOLTIP_DELAY = 600;
/** After a tooltip hides, the next one shows at once for this long, so moving along a toolbar reads each button. */
const WARM_FOR = 300;

// One tooltip at a time on a page: showing one hides the other.
const shared: { hide: (() => void) | null; lastHidden: number } = { hide: null, lastHidden: 0 };

/** Whether the element's text, or a line of text inside it (a button's label), is cut off. */
function isClipped(el: HTMLElement) {
  if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) return true;
  return Array.from(el.querySelectorAll<HTMLElement>('*')).some((n) => n.clientWidth > 0 && n.scrollWidth > n.clientWidth + 1);
}

function isFocusVisible(el: HTMLElement) {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

/** "Ctrl+Shift+N" as `aria-keyshortcuts` writes it: "Control+Shift+N". */
export function ariaKeyShortcuts(shortcut: string | undefined): string | undefined {
  if (!shortcut) return undefined;
  const names: Record<string, string> = { Ctrl: 'Control', Esc: 'Escape', Del: 'Delete', Cmd: 'Meta', Win: 'Meta' };
  return shortcut
    .split(' / ')
    .map((combo) => combo.split('+').map((k) => names[k] ?? k).join('+'))
    .join(' ');
}

/**
 * A tooltip for any element: spread `ref` on it and render `element` beside it.
 *   const tip = useTooltip({ label: 'Copy', shortcut: 'Ctrl+C' });
 *   <button ref={tip.ref} aria-describedby={tip.describedBy}>…</button>{tip.element}
 * It shows after the pointer rests on the element for 600 ms, or when the element gets keyboard
 * focus, and hides on leave, a press, Escape, blur or scroll. Touch never shows it.
 */
export function useTooltip(content: TooltipContent | null | undefined | false, { onlyWhenClipped = false }: TooltipOptions = {}) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();
  const has = !!content;

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    if (visibleRef.current) {
      visibleRef.current = false;
      shared.lastHidden = Date.now();
      setVisible(false);
    }
    if (shared.hide === hide) shared.hide = null;
  }, []);

  const show = useCallback(() => {
    if (shared.hide && shared.hide !== hide) shared.hide();
    shared.hide = hide;
    visibleRef.current = true;
    setVisible(true);
  }, [hide]);

  useEffect(() => {
    if (!el || !has) return;
    const schedule = () => {
      if (onlyWhenClipped && !isClipped(el)) return;
      window.clearTimeout(timer.current);
      const warm = !!shared.hide || Date.now() - shared.lastHidden < WARM_FOR;
      timer.current = window.setTimeout(show, warm ? 0 : TOOLTIP_DELAY);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') schedule();
    };
    const onFocus = () => {
      if (isFocusVisible(el)) schedule();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', hide);
    el.addEventListener('pointerdown', hide);
    el.addEventListener('focusin', onFocus);
    el.addEventListener('focusout', hide);
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', hide);
      el.removeEventListener('pointerdown', hide);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', hide);
      el.removeEventListener('keydown', onKey);
      hide();
    };
  }, [el, has, onlyWhenClipped, show, hide]);

  // While shown: Escape anywhere, any scroll, or the window losing focus hides it.
  useEffect(() => {
    if (!visible || !el) return;
    const doc = el.ownerDocument;
    const win = doc.defaultView || window;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    doc.addEventListener('keydown', onKey, true);
    win.addEventListener('scroll', hide, true);
    win.addEventListener('blur', hide);
    return () => {
      doc.removeEventListener('keydown', onKey, true);
      win.removeEventListener('scroll', hide, true);
      win.removeEventListener('blur', hide);
    };
  }, [visible, el, hide]);

  const descriptionId = content && content.description ? `${id}-description` : undefined;
  const element = visible && content && el ? <TooltipBubble anchor={el} content={content} id={id} descriptionId={descriptionId} /> : null;

  return {
    ref: setEl as React.RefCallback<HTMLElement>,
    element,
    visible,
    /** Point the element's `aria-describedby` here: the description, while it shows. */
    describedBy: visible ? descriptionId : undefined,
  };
}

interface BubbleProps {
  anchor: HTMLElement;
  content: TooltipContent;
  id: string;
  descriptionId?: string;
}

function TooltipBubble({ anchor, content, id, descriptionId }: BubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const container = usePortalContainer();
  const doc = anchor.ownerDocument;
  const [pos, setPos] = useState<{ top: number; left: number; side: 'below' | 'above'; theme?: string } | null>(null);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const win = doc.defaultView || window;
    const placed = placeBeside(
      anchor.getBoundingClientRect(),
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: win.innerWidth, height: win.innerHeight },
      { gap: 6, align: 'center' }
    );
    const theme = anchor.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined;
    setPos({ top: placed.top, left: placed.left, side: placed.side, theme });
  }, [anchor, doc, content]);

  return createPortal(
    <div
      ref={ref}
      id={id}
      role="tooltip"
      data-theme={pos?.theme}
      className={cx('ps-tooltip', pos ? `is-${pos.side}` : 'is-measuring')}
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
    >
      <span className="ps-tooltip-label">
        <span>{content.label}</span>
        {content.shortcut && <kbd className="ps-tooltip-shortcut">{content.shortcut}</kbd>}
      </span>
      {content.description && (
        <span className="ps-tooltip-description" id={descriptionId}>
          {content.description}
        </span>
      )}
    </div>,
    container && container.ownerDocument === doc ? container : doc.body
  );
}

export interface TooltipProps extends TooltipContent {
  /** One element that can hold a ref, such as a button. */
  children: React.ReactElement;
  onlyWhenClipped?: boolean;
  /** Turns it off, e.g. while a menu the element opened is showing. */
  disabled?: boolean;
}

/** Gives one element a tooltip: `<Tooltip label="Copy" shortcut="Ctrl+C"><button>…</button></Tooltip>`. */
export function Tooltip({ children, label, shortcut, description, onlyWhenClipped, disabled }: TooltipProps) {
  const content = useMemo(() => (disabled ? null : { label, shortcut, description }), [disabled, label, shortcut, description]);
  const tip = useTooltip(content, { onlyWhenClipped });
  const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
  const ref = useMemo(() => mergeRefs(childRef, tip.ref), [childRef, tip.ref]);
  const props = children.props as { 'aria-describedby'?: string };
  return (
    <>
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ref,
        'aria-describedby': cx(props['aria-describedby'], tip.describedBy) || undefined,
        'aria-keyshortcuts': ariaKeyShortcuts(shortcut),
      })}
      {tip.element}
    </>
  );
}

export interface TruncatedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: string;
}

/** One line of text that ends with "…" when it doesn't fit, and shows it whole in a tooltip then. */
export function TruncatedText({ children, className, ...rest }: TruncatedTextProps) {
  const tip = useTooltip({ label: children }, { onlyWhenClipped: true });
  return (
    <>
      <span ref={tip.ref} className={cx('ps-truncated-text', className)} {...rest}>
        {children}
      </span>
      {tip.element}
    </>
  );
}
