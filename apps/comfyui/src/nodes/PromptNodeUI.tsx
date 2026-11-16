import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  AccountMenu,
  IconApp,
  IconBold,
  IconCode,
  IconCopy,
  IconCut,
  IconDownload,
  IconFolder,
  IconHelp,
  IconInfo,
  IconItalic,
  IconPalette,
  IconPaste,
  IconSettings,
  IconStrike,
  IconUser,
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
import { MARKDOWN_TYPE, ZIP_TYPE, saveFileAs } from '../lib/files';
import { exportPrompts, savePrompt } from '../lib/prompts';
import { useAvatar } from '../lib/avatar';
import { useSettings } from '../lib/settings';
import { useStoreValue, type ValueStore } from '../mount/valueStore';
import { AboutView } from '../panels/AboutView';
import { AppearanceView } from '../panels/AppearanceView';
import { ProfileView } from '../panels/ProfileView';
import { SettingsView } from '../panels/SettingsView';
import { LoadPromptModal } from '../panels/LoadPromptModal';
import { SavePromptModal } from '../panels/SavePromptModal';
import { TipsModal } from '../panels/TipsModal';

const c = labels.clipboard;
const f = labels.format;
const l = labels.file;

type Dialog = 'save' | 'load' | 'tips' | 'about' | null;

function wordCount(editor: Editor | null): number {
  if (!editor) return 0;
  const text = plainText(editor);
  return text ? text.split(/\s+/).length : 0;
}

export default function PromptNodeUI({ store, nameStore }: { store: ValueStore; nameStore: ValueStore }) {
  const markdown = useStoreValue(store);
  const savedName = useStoreValue(nameStore);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  // The text as last saved or loaded; null when this node's text was never saved here.
  const [savedText, setSavedText] = useState<string | null>(() => (nameStore.get() ? store.get() : null));
  const { toasts, showToast } = useToasts();
  const settings = useSettings();
  const avatar = useAvatar(settings.avatarVersion);
  const [accountView, setAccountView] = useState<string | null>(null);
  const { openMenu, element: contextMenu } = useContextMenuState();
  const onReady = useCallback((e: Editor | null) => setEditor(e), []);
  const onError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const close = () => setDialog(null);

  const markSaved = (name: string, text: string) => {
    nameStore.set(name);
    setSavedText(text);
  };

  const copy = async (text: string, done: string) => {
    if (await writeClipboard(text)) showToast(done);
    else showToast(c.noClipboard, 'warning');
  };
  const paste = async (target: Editor) => {
    const text = await readClipboard();
    if (text === null) showToast(c.noClipboard, 'warning');
    else pasteMarkdown(target, text);
  };

  /** Ctrl+S: saves under the current name, or asks for one. */
  const quickSave = async () => {
    if (!savedName) return setDialog('save');
    try {
      await savePrompt(savedName, store.get(), true);
      markSaved(savedName, store.get());
      showToast(l.saved(savedName));
    } catch (e) {
      onError(l.failed((e as Error).message));
    }
  };

  const saveAs = async () => {
    try {
      const blob = new Blob([store.get()], { type: 'text/markdown' });
      if (await saveFileAs(blob, `${savedName || 'prompt'}.md`, MARKDOWN_TYPE)) showToast(l.savedFile);
    } catch (e) {
      onError(l.failed((e as Error).message));
    }
  };

  const exportAll = async () => {
    try {
      const archive = await exportPrompts();
      if (!archive) return showToast(l.noSaved, 'info');
      if (await saveFileAs(archive.blob, archive.filename, ZIP_TYPE)) showToast(l.exported);
    } catch (e) {
      onError(l.failed((e as Error).message));
    }
  };

  const load = (text: string, name: string, saved: boolean) => {
    if (!editor) return;
    // Replacing the text is one undo step: Ctrl+Z brings the previous prompt back.
    editor.chain().focus().setContent(text, { contentType: 'markdown' }).run();
    store.set(editor.getMarkdown());
    if (saved) markSaved(name, editor.getMarkdown());
    else {
      nameStore.set('');
      setSavedText(null);
    }
    close();
    showToast(l.loaded(name));
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
      items: [
        { key: 'save', label: l.save, hint: 'Ctrl+S', onSelect: () => setDialog('save') },
        { key: 'save-as', label: l.saveAs, icon: <IconDownload size={16} />, onSelect: () => void saveAs() },
        { key: 'load', label: l.load, icon: <IconFolder size={16} />, onSelect: () => setDialog('load') },
        { key: 'div', divider: true },
        { key: 'export', label: l.export, onSelect: () => void exportAll() },
      ],
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
    {
      key: 'help',
      label: labels.help,
      items: [
        { key: 'tips', label: labels.tips.menu, icon: <IconHelp size={16} />, onSelect: () => setDialog('tips') },
        { key: 'about', label: labels.about, icon: <IconInfo size={16} />, onSelect: () => setDialog('about') },
      ],
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
        { key: 'save', label: l.save, hint: 'Ctrl+S', onSelect: () => setDialog('save') },
      ]),
    );
  };

  // Spellcheck is an attribute of the editable element, which TipTap owns.
  useEffect(() => {
    editor?.view.dom.setAttribute('spellcheck', String(settings.spellcheck));
  }, [editor, settings.spellcheck]);

  const words = wordCount(editor);
  const dirty = savedText !== null && savedText !== markdown;

  return (
    <div
      className={`pastel-prompt pastel-prompt--text-${settings.textSize}`}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 's') {
          // Our save, not the browser's "save page" (ComfyUI never sees keys typed in here).
          e.preventDefault();
          void quickSave();
        }
      }}
    >
      <div className="pastel-prompt-top">
        <MenuBar menus={menus} />
        <AccountMenu
          compact
          profile={{ name: settings.profileName || labels.account.you, avatar }}
          view={accountView}
          onViewChange={setAccountView}
          views={[
            {
              key: 'profile',
              label: labels.account.profile,
              icon: <IconUser size={16} />,
              render: () => (
                <ProfileView
                  onDone={(message) => {
                    setAccountView(null);
                    showToast(message);
                  }}
                  onError={onError}
                />
              ),
            },
            { key: 'appearance', label: labels.account.appearance, icon: <IconPalette size={16} />, render: () => <AppearanceView /> },
            { key: 'settings', label: labels.account.settings, icon: <IconSettings size={16} />, render: () => <SettingsView /> },
          ]}
        />
      </div>
      {editor && settings.showFormatBar && <FormatBar editor={editor} />}
      <PromptEditor store={store} onReady={onReady} onContextMenu={onEditorMenu} />
      <div className="pastel-prompt-status">
        <span>{labels.editor.words(words)}</span>
        {savedName && (
          <span className="pastel-prompt-saved" title={dirty ? l.unsaved : undefined}>
            {l.savedAs(savedName)}
            {dirty && <span className="pastel-prompt-dirty" aria-label={l.unsaved} />}
          </span>
        )}
      </div>
      {contextMenu}
      <SavePromptModal
        isOpen={dialog === 'save'}
        initialName={savedName}
        markdown={markdown}
        onClose={close}
        onSaved={(name) => {
          markSaved(name, store.get());
          close();
          showToast(l.saved(name));
        }}
        onError={onError}
      />
      <LoadPromptModal isOpen={dialog === 'load'} onClose={close} onLoad={load} onError={onError} />
      <TipsModal isOpen={dialog === 'tips'} onClose={close} />
      <Modal isOpen={dialog === 'about'} title={labels.about} onClose={close} dismissible>
        <AboutView />
      </Modal>
      <ToastRegion toasts={toasts} className="pastel-toasts" />
    </div>
  );
}
