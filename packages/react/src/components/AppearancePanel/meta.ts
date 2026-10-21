import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'AppearancePanel',
  group: 'Inputs',
  summary: 'The Appearance settings: the theme, and the accent color from the recent ones and the 32 presets. Changes apply at once.',
  status: 'beta',
  states: [
    { name: 'With recent colors', description: '`recent` (a theme store\'s `recent()`) adds a row of the colors picked lately, above the presets. It is read once, so it never moves under the pointer.' },
    { name: 'First time', description: 'With no recent colors the row is left out and the presets come first.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves between the theme control and each group of swatches (one stop each).' },
    { keys: '← → ↑ ↓', action: 'Inside the theme control or a group, moves and selects.' },
  ],
  labels: [
    'theme', 'themeLight', 'themeDark', 'themeSystem', 'accentColor', 'accentColorHint', 'recentColors', 'presetColors',
    'accentGroupVibrant', 'accentGroupCalm', 'accentGroupMuted',
    'colorSolarLime', 'colorStarlightGold', 'colorSunflare', 'colorCoronaOrange', 'colorRedGiant', 'colorPulsarPink', 'colorNebulaMagenta',
    'colorNebulaPurple', 'colorAndromedaViolet', 'colorStardustLavender', 'colorMoonlightBlue', 'colorNeptuneAzure', 'colorCometCyan',
    'colorAuroraTeal', 'colorAuroraGreen', 'colorSupernovaMint', 'colorSage', 'colorMint', 'colorAquamarine', 'colorSky', 'colorPeriwinkle',
    'colorLavender', 'colorBlush', 'colorPeach', 'colorConcrete', 'colorStone', 'colorTaupe', 'colorClay', 'colorMossGrey', 'colorFog',
    'colorPewter', 'colorSlate',
  ],
  aria: [
    'Headings name the theme and the accent; each group of swatches is a radio group named for its group.',
    'Every swatch has its color\'s name, also its tooltip, from the shared words (`colorSolarLime`…).',
    'It changes nothing by itself: `onThemeChange` and `onAccentChange` report, the app applies (useThemeSync) and saves.',
  ],
  related: ['ColorSwatchGrid', 'SegmentedControl', 'Modal'],
};
