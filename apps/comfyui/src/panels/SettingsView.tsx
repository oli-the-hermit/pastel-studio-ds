import { Button, IconSparkle, SegmentedControl, Switch, TextButton, UpdateCard } from '@pastel-studio/react';
import { labels } from '../labels';
import { openExternal } from '../lib/about';
import { setSetting, useSettings, type TextSize } from '../lib/settings';
import { checkForUpdate, openManagerUpdates, useUpdate } from '../lib/updates';

const s = labels.settings;
const u = labels.updates;

/** Editor and update preferences, shared by every Pastel Prompt node. Each change applies at once. */
export function SettingsView({ onMessage }: { onMessage: (message: string) => void }) {
  const settings = useSettings();
  const update = useUpdate();
  return (
    <div className="pastel-settings">
      <h3 className="pastel-settings-title">{s.editor}</h3>
      <div className="pastel-settings-row">
        <span>{s.textSize}</span>
        <SegmentedControl<TextSize>
          options={(['sm', 'md', 'lg'] as const).map((value) => ({ value, label: s.textSizes[value] }))}
          value={settings.textSize}
          onChange={(value) => void setSetting('textSize', value)}
          ariaLabel={s.textSize}
          surface={1}
        />
      </div>
      <Switch label={s.spellcheck} hint={s.spellcheckHint} checked={settings.spellcheck} onChange={(on) => void setSetting('spellcheck', on)} />
      <Switch label={s.formatBar} hint={s.formatBarHint} checked={settings.showFormatBar} onChange={(on) => void setSetting('showFormatBar', on)} />

      <h3 className="pastel-settings-title">{u.title}</h3>
      <Switch
        label={u.check}
        hint={u.checkHint}
        checked={settings.checkUpdates}
        onChange={(on) => {
          void setSetting('checkUpdates', on).then(() => checkForUpdate());
        }}
      />
      {update.status === 'available' && update.latest ? (
        <UpdateCard
          className="pastel-update-card"
          icon={<IconSparkle size={18} />}
          title={u.available(update.latest)}
          actions={
            <>
              {update.url && <TextButton onClick={() => openExternal(update.url!)}>{u.whatsNew}</TextButton>}
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  void openManagerUpdates().then((ok) => {
                    if (!ok) {
                      onMessage(u.noManager);
                      if (update.url) openExternal(update.url);
                    }
                  });
                }}
              >
                {u.openManager}
              </Button>
            </>
          }
        >
          <p>{u.availableBody(update.current ?? '')}</p>
        </UpdateCard>
      ) : (
        <div className="pastel-settings-row">
          <span>
            {update.status === 'checking'
              ? u.checking
              : update.status === 'current' && update.current
                ? u.upToDate(update.current)
                : update.status === 'error'
                  ? u.failed
                  : u.off}
          </span>
          <Button size="sm" disabled={update.status === 'checking'} onClick={() => void checkForUpdate(true)}>
            {u.checkNow}
          </Button>
        </div>
      )}
    </div>
  );
}
