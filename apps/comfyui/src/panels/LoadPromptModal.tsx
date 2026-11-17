import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionRow,
  Button,
  ConfirmModal,
  EmptyState,
  Field,
  IconEdit,
  IconTrash,
  Menu,
  Modal,
  ModalForm,
  SearchField,
  Spinner,
  TextInput,
} from '@pastel-studio/react';
import { labels } from '../labels';
import { MARKDOWN_TYPE, baseName, openTextFile } from '../lib/files';
import { cleanPromptName, deletePrompt, listPrompts, loadPrompt, PromptExistsError, renamePrompt, type SavedPrompt } from '../lib/prompts';

const l = labels.file;

export interface LoadPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `name` is the saved prompt's name, or the file's name for one opened from disk. */
  onLoad: (markdown: string, name: string, saved: boolean) => void;
  onError: (message: string) => void;
}

type Pending = { kind: 'rename' | 'delete'; prompt: SavedPrompt } | null;

/** The saved prompts, newest first: pick one to load it, rename or delete it, or open a file from disk. */
export function LoadPromptModal({ isOpen, onClose, onLoad, onError }: LoadPromptModalProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[] | null>(null);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<Pending>(null);
  const [newName, setNewName] = useState('');
  const [renameError, setRenameError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setPrompts(await listPrompts());
    } catch (e) {
      setPrompts([]);
      onError(l.failed((e as Error).message));
    }
  }, [onError]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setPrompts(null);
    void refresh();
  }, [isOpen, refresh]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (prompts ?? []).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [prompts, query]);

  const pick = async (prompt: SavedPrompt) => {
    try {
      onLoad(await loadPrompt(prompt.name), prompt.name, true);
    } catch (e) {
      onError(l.failed((e as Error).message));
    }
  };

  const openFile = async () => {
    try {
      const file = await openTextFile(MARKDOWN_TYPE);
      if (file) onLoad(file.text, baseName(file.name), false);
    } catch (e) {
      onError(l.failed((e as Error).message));
    }
  };

  const rename = async () => {
    if (pending?.kind !== 'rename') return;
    const clean = cleanPromptName(newName);
    if (!clean) return setRenameError(l.nameRequired);
    if (clean === pending.prompt.name) return setPending(null);
    try {
      await renamePrompt(pending.prompt.name, clean);
      setPending(null);
      await refresh();
    } catch (e) {
      if (e instanceof PromptExistsError) setRenameError(l.taken(clean));
      else onError(l.failed((e as Error).message));
    }
  };

  const remove = async () => {
    if (pending?.kind !== 'delete') return;
    try {
      await deletePrompt(pending.prompt.name);
      setPending(null);
      await refresh();
    } catch (e) {
      onError(l.failed((e as Error).message));
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !pending} title={l.loadTitle} onClose={onClose} dismissible wide>
        <div className="pastel-library">
          <SearchField value={query} onChange={setQuery} placeholder={l.search} />
          <div className="pastel-library-list" role="list">
            {prompts === null && (
              <div className="pastel-library-wait">
                <Spinner />
              </div>
            )}
            {prompts?.length === 0 && <EmptyState size="sm">{l.empty}</EmptyState>}
            {!!prompts?.length && !shown.length && <EmptyState size="sm">{l.noMatch}</EmptyState>}
            {shown.map((p) => (
              <div key={p.name} className="pastel-library-row" role="listitem">
                <button type="button" className="pastel-library-pick" onClick={() => void pick(p)}>
                  <span className="pastel-library-name">{p.name}</span>
                  <span className="pastel-library-date">{l.modified(new Date(p.modified))}</span>
                </button>
                <Menu
                  ariaLabel={p.name}
                  triggerSize="sm"
                  items={[
                    {
                      key: 'rename',
                      label: l.rename,
                      icon: <IconEdit size={16} />,
                      onSelect: () => {
                        setNewName(p.name);
                        setRenameError('');
                        setPending({ kind: 'rename', prompt: p });
                      },
                    },
                    { key: 'div', divider: true },
                    { key: 'delete', label: l.delete, icon: <IconTrash size={16} />, danger: true, onSelect: () => setPending({ kind: 'delete', prompt: p }) },
                  ]}
                />
              </div>
            ))}
          </div>
          <ActionRow>
            <Button onClick={() => void openFile()}>{l.openFile}</Button>
          </ActionRow>
        </div>
      </Modal>

      <Modal isOpen={isOpen && pending?.kind === 'rename'} title={l.renameTitle} onClose={() => setPending(null)}>
        <ModalForm
          onSubmit={(e) => {
            e.preventDefault();
            void rename();
          }}
        >
          <Field label={l.name} error={renameError || undefined}>
            <TextInput
              value={newName}
              autoFocus
              onChange={(e) => {
                setNewName(e.target.value);
                setRenameError('');
              }}
            />
          </Field>
          <ActionRow>
            <Button onClick={() => setPending(null)}>{l.cancel}</Button>
            <Button variant="primary" type="submit">
              {l.rename}
            </Button>
          </ActionRow>
        </ModalForm>
      </Modal>

      <Modal isOpen={isOpen && pending?.kind === 'delete'} title={l.delete} onClose={() => setPending(null)}>
        <ConfirmModal message={l.deleteConfirm(pending?.prompt.name ?? '')} onConfirm={() => void remove()} onClose={() => setPending(null)} />
      </Modal>
    </>
  );
}
