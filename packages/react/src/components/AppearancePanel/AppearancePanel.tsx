import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useLabels, type LabelOverrides, type Labels } from '../../labels';
import { cx } from '../../lib/cx';
import { ACCENT_GROUPS, ACCENT_PRESETS, accentWord, type AccentGroup, type AccentId, type AccentWord } from '../../theme/presets';
import { accentTokens, resolveTheme, type ResolvedTheme, type ThemeMode } from '../../theme/theme';
import { ColorSwatchGrid, type SwatchOption } from '../ColorSwatchGrid';
import { SegmentedControl } from '../SegmentedControl';

type AppearanceWords =
  | 'theme' | 'themeLight' | 'themeDark' | 'themeSystem' | 'accentColor' | 'accentColorHint' | 'recentColors' | 'presetColors'
  | 'accentGroupVibrant' | 'accentGroupCalm' | 'accentGroupMuted';

const GROUP_WORD: Record<AccentGroup, AppearanceWords> = { vibrant: 'accentGroupVibrant', calm: 'accentGroupCalm', muted: 'accentGroupMuted' };

export interface AppearancePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  accent: AccentId;
  onAccentChange: (accent: AccentId) => void;
  /** Accents picked lately (a theme store's `recent()`), newest first. Read once, so the grid never moves under the pointer. */
  recent?: AccentId[];
  /**
   * Called once when the panel goes away, if the accent changed while it was open: the accent it
   * opened with, then the last one, to remember in that order (a theme store's `pushRecent`).
   */
  onRemember?: (accents: AccentId[]) => void;
  /** The theme the swatches are drawn in; by default the one `theme` resolves to. */
  resolvedTheme?: ResolvedTheme;
  labels?: LabelOverrides<AppearanceWords | AccentWord>;
}

/**
 * The Appearance settings: the theme (light, dark or as the system), and the accent color from the
 * recent ones and the 32 presets in their three groups. Each change applies at once.
 */
export const AppearancePanel = forwardRef<HTMLDivElement, AppearancePanelProps>(({
  theme, onThemeChange, accent, onAccentChange, recent: recentAtOpen = [], onRemember, resolvedTheme, labels: ownLabels, className, ...rest
}, ref) => {
  const labels = useLabels(ownLabels as LabelOverrides<keyof Labels>);
  const drawn = resolvedTheme ?? resolveTheme(theme);
  // Recent colors stay put while the panel is open; the colors used here are remembered when it goes.
  const [recent] = useState(recentAtOpen);
  const openedWith = useRef(accent);
  const current = useRef(accent);
  current.current = accent;
  const remember = useRef(onRemember);
  remember.current = onRemember;
  useEffect(() => () => {
    if (current.current !== openedWith.current) remember.current?.([openedWith.current, current.current]);
  }, []);

  const options = (ids: readonly AccentId[]): SwatchOption[] => ids.map((id) => {
    const tokens = accentTokens(id, drawn);
    return { value: id, label: labels[accentWord(id)], color: tokens['--ps-accent'], onColor: tokens['--ps-on-accent'] };
  });
  const pick = (id: string) => onAccentChange(id as AccentId);

  return (
    <div ref={ref} className={cx('ps-appearance-panel', className)} {...rest}>
      <h3 className="ps-appearance-panel-title">{labels.theme}</h3>
      <SegmentedControl
        options={[
          { value: 'light', label: labels.themeLight },
          { value: 'dark', label: labels.themeDark },
          { value: 'system', label: labels.themeSystem },
        ]}
        value={theme}
        onChange={onThemeChange}
        ariaLabel={labels.theme}
        size="lg"
        surface={1}
      />

      <div className="ps-appearance-panel-divider" />
      <h3 className="ps-appearance-panel-title">{labels.accentColor}</h3>
      <p className="ps-appearance-panel-hint">{labels.accentColorHint}</p>

      {recent.length > 0 && (
        <section className="ps-appearance-panel-section">
          <h4 className="ps-appearance-panel-section-title">{labels.recentColors}</h4>
          <ColorSwatchGrid options={options(recent)} value={accent} onChange={pick} ariaLabel={labels.recentColors} />
        </section>
      )}

      <section className="ps-appearance-panel-section">
        <h4 className="ps-appearance-panel-section-title">{labels.presetColors}</h4>
        {ACCENT_GROUPS.map((group) => (
          <div className="ps-appearance-panel-group" key={group}>
            <span className="ps-appearance-panel-group-label" aria-hidden="true">{labels[GROUP_WORD[group]]}</span>
            <ColorSwatchGrid
              options={options(ACCENT_PRESETS.filter((p) => p.group === group).map((p) => p.id))}
              value={accent}
              onChange={pick}
              ariaLabel={labels[GROUP_WORD[group]]}
            />
          </div>
        ))}
      </section>
    </div>
  );
});
AppearancePanel.displayName = 'AppearancePanel';
