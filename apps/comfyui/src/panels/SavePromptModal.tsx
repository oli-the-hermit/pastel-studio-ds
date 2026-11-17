import { useEffect, useState } from 'react';
import { Button, ActionRow, ConfirmModal, Field, Modal, ModalForm, TextInput } from '@pastel-studio/react';
import { labels } from '../labels';
import { cleanPromptName, PromptExistsError, savePrompt } from '../lib/prompts';

const l = labels.file;

export interface SavePromptModalProps {
  isOpen: boolean;
  /** The name the prompt was last saved or loaded under, offered again. */
  initialName: string;
  markdown: string;
  onClose: () => void;
  onSaved: (name: string) => void;
  onError: (message: string) => void;
}

/** Names a prompt and saves it to the ComfyUI user folder; asks before replacing one. */
export function SavePromptModal({ isOpen, initialName, markdown, onClose, onSaved, onError }: SavePromptModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [taken, setTaken] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialName);
    setError('');
    setTaken(null);
  }, [isOpen, initialName]);

  const save = async (overwrite: boolean) => {
    const clean = cleanPromptName(name);
    if (!clean) {
      setError(l.nameRequired);
      return;
    }
    try {
      await savePrompt(clean, markdown, overwrite);
      onSaved(clean);
    } catch (e) {
      if (e instanceof PromptExistsError) setTaken(clean);
      else onError(l.failed((e as Error).message));
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !taken} title={l.saveTitle} onClose={onClose}>
        <ModalForm
          onSubmit={(e) => {
            e.preventDefault();
            void save(false);
          }}
        >
          <Field label={l.name} hint={l.nameHint} error={error || undefined}>
            <TextInput
              value={name}
              autoFocus
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
            />
          </Field>
          <ActionRow>
            <Button onClick={onClose}>{l.cancel}</Button>
            <Button variant="primary" type="submit">
              {l.saveButton}
            </Button>
          </ActionRow>
        </ModalForm>
      </Modal>
      <Modal isOpen={isOpen && !!taken} title={l.replaceTitle} onClose={() => setTaken(null)}>
        <ConfirmModal message={l.replace(taken ?? '')} confirmLabel={l.replaceButton} onConfirm={() => void save(true)} onClose={() => setTaken(null)} />
      </Modal>
    </>
  );
}
