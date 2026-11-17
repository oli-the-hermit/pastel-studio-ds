import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TableKit } from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { labels } from '../labels';
import type { ValueStore } from '../mount/valueStore';
import { decodeBasicEntities, escapeMarkdownText } from './markdownText';

/**
 * Markdown that escapes only what it must (markdownText.ts): TipTap's serializer would turn a
 * prompt's "2 * 3" or "snake_case" into "2 \* 3" and "snake\_case". Same patch as Pastel
 * Espresso's notes editor; markdownText.test fails if TipTap renames the step.
 */
const GentleMarkdown = Markdown.extend({
  onBeforeCreate(event) {
    this.parent?.(event);
    const manager = this.editor.markdown as unknown as { escapeMarkdownSyntax?: (text: string) => string } | undefined;
    if (manager?.escapeMarkdownSyntax) manager.escapeMarkdownSyntax = (text) => escapeMarkdownText(decodeBasicEntities(text));
  },
});

/** The prompt's words, without Markdown: what "Copy as plain text" and the word count use. */
export const plainText = (editor: Editor) => editor.getText({ blockSeparator: '\n' }).trim();

export interface PromptEditorProps {
  /** The prompt's Markdown, shared with ComfyUI (saving, loading, undo). */
  store: ValueStore;
  onReady: (editor: Editor | null) => void;
  onContextMenu: (e: React.MouseEvent, editor: Editor) => void;
}

/**
 * The prompt box: a Markdown editor that shows formatting instead of its marks. Underline is
 * off (Markdown can't keep it). Tables are parsed so pasted ones survive, but there is no
 * button for them: a node is too narrow to edit one.
 */
export function PromptEditor({ store, onReady, onContextMenu }: PromptEditorProps) {
  const editor = useEditor({
    // Its injected <style> would land in the page, outside our shadow root: the rules live in node.css.
    injectCSS: false,
    extensions: [
      StarterKit.configure({ underline: false, link: { openOnClick: false, autolink: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit,
      Placeholder.configure({ placeholder: labels.editor.placeholder }),
      GentleMarkdown,
    ],
    content: store.get(),
    contentType: 'markdown',
    editorProps: { attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': labels.editor.area, spellcheck: 'true' } },
    onUpdate: ({ editor: e }) => store.set(e.getMarkdown()),
  });

  useEffect(() => {
    onReady(editor);
    return () => onReady(null);
  }, [editor, onReady]);

  // ComfyUI sets the value when a workflow loads or an undo restores it.
  useEffect(() => {
    if (!editor) return;
    return store.subscribe(() => {
      const value = store.get();
      if (value !== editor.getMarkdown()) editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false });
    });
  }, [editor, store]);

  return (
    <EditorContent
      editor={editor}
      className="pastel-prompt-content"
      onContextMenu={(e) => {
        if (editor) onContextMenu(e, editor);
      }}
    />
  );
}
