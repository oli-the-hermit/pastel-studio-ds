import { useCallback, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  IconApp,
  IconBold,
  IconCode,
  IconCopy,
  IconCut,
  IconItalic,
  IconPaste,
  IconStrike,
  MenuBar,
  Modal,
  ToastRegion,
  tidyMenuItems,
  useContextMenuState,
  useToasts,
  type MenuBarMenu,
  type MenuItem,
} from '@pastel-studio/react';
import { FormatBar, textStyleItems } from '../editor/FormatBar';
import { PromptEditor, plainText } from '../editor/PromptEditor';
import { labels } from '../labels';
import { pasteMarkdown, readClipboard, selectedText, writeClipboard } from '../lib/clipboard';
import { useStoreValue, type ValueStore } from '../mount/valueStore';

const c = labels.clipboard;
const f = labels.format;

function wordCount(editor: Editor | null): number {
  if (!editor) return 0;
  const text = plainText(editor);
  return text ? text.split(/\s+/).length : 0;
}

export default function PromptNodeUI({ store }: { store: ValueStore }) {
  // Re-render on every change, for the word count.
  useStoreValue(store);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [about, setAbout] = useState(false);
  const { toasts, showToast } = useToasts();
  const { openMenu, element: contextMenu } = useContextMenuState();
  const onReady = useCallback((e: Editor | null) => setEditor(e), []);

  const copy = async (text: string, done: string) => {
    if (await writeClipboard(text)) showToast(done);
    else showToast(c.noClipboard, 'warning');
  };
  const paste = async (target: Editor) => {
    const text = await readClipboard();
    if (text === null) showToast(c.noClipboard, 'warning');
    else pasteMarkdown(target, text);
  };

  const copyItems = (target: Editor): MenuItem[] => [
    { key: 'copy-prompt', label: c.copyPrompt, icon: <IconCopy size={16} />, onSelect: () => void copy(target.getMarkdown(), c.copied) },
    { key: 'copy-plain', label: c.copyPlain, onSelect: () => void copy(plainText(target), c.copiedPlain) },
  ];

  const menus: MenuBarMenu[] = [
    {
      key: 'app',
      label: labels.appName,
      brand: true,
      icon: <IconApp size={16} />,
      items: [{ key: 'about', label: labels.about, onSelect: () => setAbout(true) }],
    },
    {
      key: 'edit',
      label: labels.edit,
      items: editor
        ? [
            ...copyItems(editor),
            { key: 'paste', label: c.paste, icon: <IconPaste size={16} />, onSelect: () => void paste(editor) },
            { key: 'div', divider: true },
            { key: 'select-all', label: c.selectAll, hint: 'Ctrl+A', onSelect: () => editor.chain().focus().selectAll().run() },
          ]
        : [],
    },
  ];

  // Right-click in the text: clipboard, formatting and copying the whole prompt.
  const onEditorMenu = (e: React.MouseEvent, target: Editor) => {
    const hasSelection = !target.state.selection.empty;
    const run = () => target.chain().focus();
    openMenu(
      e,
      tidyMenuItems([
        hasSelection && {
          key: 'cut',
          label: c.cut,
          icon: <IconCut size={16} />,
          hint: 'Ctrl+X',
          onSelect: () => void writeClipboard(selectedText(target)).then((ok) => (ok ? run().deleteSelection().run() : showToast(c.noClipboard, 'warning'))),
        },
        { key: 'paste', label: c.paste, icon: <IconPaste size={16} />, hint: 'Ctrl+V', onSelect: () => void paste(target) },
        { key: 'select-all', label: c.selectAll, hint: 'Ctrl+A', onSelect: () => run().selectAll().run() },
        { key: 'div-1', divider: true },
        { key: 'bold', label: f.bold, icon: <IconBold size={16} />, hint: 'Ctrl+B', checked: target.isActive('bold'), onSelect: () => run().toggleBold().run() },
        { key: 'italic', label: f.italic, icon: <IconItalic size={16} />, hint: 'Ctrl+I', checked: target.isActive('italic'), onSelect: () => run().toggleItalic().run() },
        { key: 'strike', label: f.strike, icon: <IconStrike size={16} />, checked: target.isActive('strike'), onSelect: () => run().toggleStrike().run() },
        { key: 'code', label: f.code, icon: <IconCode size={16} />, checked: target.isActive('code'), onSelect: () => run().toggleCode().run() },
        { key: 'style', label: f.textStyle, items: textStyleItems(target) },
        {
          key: 'lists',
          label: f.lists,
          items: [
            { key: 'bullet', label: f.bulletList, checked: target.isActive('bulletList'), onSelect: () => run().toggleBulletList().run() },
            { key: 'ordered', label: f.orderedList, checked: target.isActive('orderedList'), onSelect: () => run().toggleOrderedList().run() },
            { key: 'tasks', label: f.checklist, checked: target.isActive('taskList'), onSelect: () => run().toggleTaskList().run() },
          ],
        },
        { key: 'div-2', divider: true },
        ...copyItems(target),
      ]),
    );
  };

  const words = wordCount(editor);

  return (
    <div className="pastel-prompt">
      <MenuBar menus={menus} />
      {editor && <FormatBar editor={editor} />}
      <PromptEditor store={store} onReady={onReady} onContextMenu={onEditorMenu} />
      <div className="pastel-prompt-status" aria-live="off">
        {labels.editor.words(words)}
      </div>
      {contextMenu}
      <Modal isOpen={about} title={labels.about} onClose={() => setAbout(false)} dismissible>
        <p>{labels.aboutBody}</p>
      </Modal>
      <ToastRegion toasts={toasts} />
    </div>
  );
}
