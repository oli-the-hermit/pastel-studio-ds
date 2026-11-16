import { SegmentedControl, Switch } from '@pastel-studio/react';
import { labels } from '../labels';
import { setSetting, useSettings, type TextSize } from '../lib/settings';

const s = labels.settings;

/** Editor preferences, shared by every Pastel Prompt node. Each change applies at once. */
export function SettingsView() {
  const settings = useSettings();
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
    </div>
  );
}
