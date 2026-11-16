import type { Editor } from '@tiptap/react';

// The async clipboard needs a secure page (localhost or https). ComfyUI on a LAN address over
// http has none; callers then show the "use Ctrl+C / Ctrl+V" hint.
export const hasClipboard = () => typeof navigator !== 'undefined' && !!navigator.clipboard && window.isSecureContext;

export async function writeClipboard(text: string): Promise<boolean> {
  if (!hasClipboard()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
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
