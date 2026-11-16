import { useRef, useState } from 'react';
import { ActionRow, Button, Field, FormActions, ModalForm, TextInput } from '@pastel-studio/react';
import { labels } from '../labels';
import { removeAvatar, setAvatar, useAvatar } from '../lib/avatar';
import { setSetting, useSettings } from '../lib/settings';

const p = labels.profile;

/** The local profile: a display name and a picture for the badge. No account, nothing online. */
export function ProfileView({ onDone, onError }: { onDone: (message: string) => void; onError: (message: string) => void }) {
  const settings = useSettings();
  const avatar = useAvatar(settings.avatarVersion);
  const [name, setName] = useState(settings.profileName);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (task: () => Promise<void>) => {
    try {
      await task();
    } catch (e) {
      onError((e as Error).message);
    }
  };

  return (
    <ModalForm
      onSubmit={(e) => {
        e.preventDefault();
        void run(async () => {
          await setSetting('profileName', name.trim());
          onDone(p.saved);
        });
      }}
    >
      <Field label={p.name} hint={p.nameHint}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
      </Field>
      <Field label={p.picture} hint={p.pictureHint} group>
        <div className="pastel-profile-picture">
          <span className="pastel-profile-avatar" aria-hidden="true">
            {avatar ? <img src={avatar} alt="" /> : <span>{(name.trim() || labels.account.you).slice(0, 1).toUpperCase()}</span>}
          </span>
          <ActionRow>
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              {avatar ? p.change : p.choose}
            </Button>
            {avatar && (
              <Button size="sm" onClick={() => void run(removeAvatar)}>
                {p.remove}
              </Button>
            )}
          </ActionRow>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void run(() => setAvatar(file));
            }}
          />
        </div>
      </Field>
      <FormActions dirty={name.trim() !== settings.profileName} onCancel={() => setName(settings.profileName)} primaryLabel={p.save} />
    </ModalForm>
  );
}
