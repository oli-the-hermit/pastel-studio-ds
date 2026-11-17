import type { Editor } from '@tiptap/react';

// The async clipboard needs a secure page (localhost or https). ComfyUI on a LAN address over
// http has none; callers then show the "use Ctrl+C / Ctrl+V" hint.
export const hasClipboard = () => typeof navigator !== 'undefined' && !!navigator.clipboard && window.isSecureContext;

/**
 * The older way to copy: select a hidden textarea and run "copy". It needs no permission and
 * works over plain http, where the async clipboard doesn't exist.
 */
function copyWithSelection(text: string): boolean {
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  Object.assign(area.style, { position: 'fixed', top: '0', left: '-9999px', opacity: '0' });
  document.body.append(area);
  area.select();
  let copied: boolean;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  active?.focus?.();
  return copied;
}

export async function writeClipboard(text: string): Promise<boolean> {
  if (hasClipboard()) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Denied (no permission, or the click didn't count as one): try the older way.
    }
  }
  return copyWithSelection(text);
}

export async function readClipboard(): Promise<string | null> {
  if (!hasClipboard()) return null;
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

/** The selected text, as the editor shows it (no Markdown marks). */
export function selectedText(editor: Editor): string {
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, '\n');
}

/** Pastes Markdown at the cursor, so a copied prompt keeps its formatting. */
export function pasteMarkdown(editor: Editor, text: string): void {
  editor.chain().focus().insertContent(text, { contentType: 'markdown' }).run();
}
