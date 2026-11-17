import { useRef, useState } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import {
  ActionRow,
  Button,
  IconBold,
  IconButton,
  IconChecklist,
  IconCode,
  IconCodeBlock,
  IconHeading,
  IconItalic,
  IconLink,
  IconList,
  IconListOrdered,
  IconMore,
  IconQuote,
  IconRedo,
  IconStrike,
  IconUndo,
  Menu,
  Popover,
  TextInput,
  type MenuItem,
} from '@pastel-studio/react';
import { labels } from '../labels';

const l = labels.format;

/** Keeps the editor's focus and selection when a toolbar button is pressed. */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

interface ToolProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Tool({ label, active, disabled, onClick, children }: ToolProps) {
  return (
    <IconButton size="sm" surface={2} label={label} active={active} disabled={disabled} aria-pressed={active} onMouseDown={keepFocus} onClick={onClick}>
      {children}
    </IconButton>
  );
}

/** The link button: a small panel to type an address, apply it, or remove the link under the cursor. */
function LinkTool({ editor, active }: { editor: Editor; active: boolean }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState('');

  const apply = () => {
    const value = href.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (value) chain.setLink({ href: value }).run();
    else chain.unsetLink().run();
    setOpen(false);
  };

  return (
    <span ref={anchorRef} className="pastel-format-link">
      <Tool
        label={l.link}
        active={active}
        onClick={() => {
          setHref((editor.getAttributes('link').href as string | undefined) ?? '');
          setOpen(true);
        }}
      >
        <IconLink size={16} />
      </Tool>
      <Popover open={open} anchorRef={anchorRef} onClose={() => setOpen(false)} matchWidth={false} role="dialog" ariaLabel={l.link} className="pastel-link-panel">
        <form
          className="pastel-link-form"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <TextInput value={href} onChange={(e) => setHref(e.target.value)} placeholder={l.linkPlaceholder} aria-label={l.linkAddress} autoFocus inputMode="url" />
          <ActionRow>
            {active && (
              <Button
                size="sm"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  setOpen(false);
                }}
              >
                {l.linkRemove}
              </Button>
            )}
            <Button size="sm" variant="primary" type="submit">
              {l.linkApply}
            </Button>
          </ActionRow>
        </form>
      </Popover>
    </span>
  );
}

/** What the toolbar shows as pressed or unavailable for the current selection. */
function useToolState(editor: Editor) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      tasks: e.isActive('taskList'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
}

/** Text styles, shared with the right-click menu. */
export function textStyleItems(editor: Editor): MenuItem[] {
  const run = () => editor.chain().focus();
  return [
    { key: 'p', label: l.paragraph, checked: editor.isActive('paragraph'), radio: true, onSelect: () => run().setParagraph().run() },
    { key: 'h1', label: l.heading1, checked: editor.isActive('heading', { level: 1 }), radio: true, onSelect: () => run().setHeading({ level: 1 }).run() },
    { key: 'h2', label: l.heading2, checked: editor.isActive('heading', { level: 2 }), radio: true, onSelect: () => run().setHeading({ level: 2 }).run() },
    { key: 'h3', label: l.heading3, checked: editor.isActive('heading', { level: 3 }), radio: true, onSelect: () => run().setHeading({ level: 3 }).run() },
  ];
}

/**
 * Formatting controls for the prompt editor. On a narrow node, the less common half moves into a
 * "More formatting" menu (a container query in node.css decides which set shows).
 */
export function FormatBar({ editor }: { editor: Editor }) {
  const on = useToolState(editor);
  const run = () => editor.chain().focus();

  const extra: MenuItem[] = [
    { key: 'tasks', label: l.checklist, icon: <IconChecklist size={16} />, checked: on.tasks, onSelect: () => run().toggleTaskList().run() },
    { key: 'quote', label: l.quote, icon: <IconQuote size={16} />, checked: on.quote, onSelect: () => run().toggleBlockquote().run() },
    { key: 'codeBlock', label: l.codeBlock, icon: <IconCodeBlock size={16} />, checked: on.codeBlock, onSelect: () => run().toggleCodeBlock().run() },
    { key: 'div', divider: true },
    { key: 'undo', label: l.undo, icon: <IconUndo size={16} />, hint: 'Ctrl+Z', disabled: !on.canUndo, onSelect: () => run().undo().run() },
    { key: 'redo', label: l.redo, icon: <IconRedo size={16} />, hint: 'Ctrl+Shift+Z', disabled: !on.canRedo, onSelect: () => run().redo().run() },
  ];

  return (
    <div className="pastel-format" role="toolbar" aria-label={l.toolbar}>
      <Menu ariaLabel={l.textStyle} trigger={<IconHeading size={16} />} triggerSize="sm" triggerSurface={2} align="start" items={textStyleItems(editor)} />
      <span className="pastel-format-sep" aria-hidden="true" />
      <Tool label={l.bold} active={on.bold} onClick={() => run().toggleBold().run()}><IconBold size={16} /></Tool>
      <Tool label={l.italic} active={on.italic} onClick={() => run().toggleItalic().run()}><IconItalic size={16} /></Tool>
      <Tool label={l.strike} active={on.strike} onClick={() => run().toggleStrike().run()}><IconStrike size={16} /></Tool>
      <Tool label={l.code} active={on.code} onClick={() => run().toggleCode().run()}><IconCode size={16} /></Tool>
      <LinkTool editor={editor} active={on.link} />
      <span className="pastel-format-sep" aria-hidden="true" />
      <Tool label={l.bulletList} active={on.bullet} onClick={() => run().toggleBulletList().run()}><IconList size={16} /></Tool>
      <Tool label={l.orderedList} active={on.ordered} onClick={() => run().toggleOrderedList().run()}><IconListOrdered size={16} /></Tool>
      <span className="pastel-format-wide">
        <Tool label={l.checklist} active={on.tasks} onClick={() => run().toggleTaskList().run()}><IconChecklist size={16} /></Tool>
        <span className="pastel-format-sep" aria-hidden="true" />
        <Tool label={l.quote} active={on.quote} onClick={() => run().toggleBlockquote().run()}><IconQuote size={16} /></Tool>
        <Tool label={l.codeBlock} active={on.codeBlock} onClick={() => run().toggleCodeBlock().run()}><IconCodeBlock size={16} /></Tool>
        <span className="pastel-format-sep" aria-hidden="true" />
        <Tool label={l.undo} disabled={!on.canUndo} onClick={() => run().undo().run()}><IconUndo size={16} /></Tool>
        <Tool label={l.redo} disabled={!on.canRedo} onClick={() => run().redo().run()}><IconRedo size={16} /></Tool>
      </span>
      <span className="pastel-format-narrow">
        <Menu ariaLabel={l.more} trigger={<IconMore size={16} />} triggerSize="sm" triggerSurface={2} align="end" items={extra} />
      </span>
    </div>
  );
}
