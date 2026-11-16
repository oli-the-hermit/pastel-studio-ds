import { AppearancePanel, Switch, type AccentId, type ThemeMode } from '@pastel-studio/react';
import { labels } from '../labels';
import { setSetting, useSettings } from '../lib/settings';
import { resolveChoice } from '../lib/theme';

const a = labels.appearance;

/** Theme and accent for every Pastel Studio node: the library's panel, plus following ComfyUI. */
export function AppearanceView() {
  const settings = useSettings();
  const matching = settings.theme === 'comfy';
  const resolved = resolveChoice(settings.theme);

  const remember = (used: AccentId[]) => {
    const recent = [...used.reverse(), ...settings.recentAccents].filter((id, i, all) => all.indexOf(id) === i).slice(0, 5);
    void setSetting('recentAccents', recent);
  };

  return (
    <div className="pastel-appearance">
      <Switch
        label={a.matchComfy}
        hint={a.matchComfyHint}
        checked={matching}
        onChange={(on) => void setSetting('theme', on ? 'comfy' : resolved)}
      />
      <AppearancePanel
        theme={matching ? resolved : (settings.theme as ThemeMode)}
        resolvedTheme={resolved}
        onThemeChange={(mode) => void setSetting('theme', mode)}
        accent={settings.accent}
        onAccentChange={(accent) => void setSetting('accent', accent)}
        recent={settings.recentAccents}
        onRemember={remember}
      />
    </div>
  );
}
