import React from 'react';
import { IconAudioTrack, IconCaptions, IconHd, IconMoon, IconRepeat, IconSliders, IconSpeaker, IconSpeed } from '../icons';
import { defaultLabels, type Labels } from '../labels';
import { tidyMenuItems, type MenuItem } from '../components/Menu';

export interface Choice<T extends string | number> {
  value: T;
  label: string;
}

/** A group of choices: a submenu of radio rows, showing its current choice as the hint. */
export interface ChoiceSetting<T extends string | number> {
  value: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
}

export interface ToggleSetting {
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface MediaSettingsConfig {
  /** Video and audio. */
  speed?: ChoiceSetting<number>;
  /** Video: the resolution. */
  quality?: ChoiceSetting<string>;
  /** Video: subtitles and captions; include an "Off" choice. */
  captions?: ChoiceSetting<string>;
  /** Language or commentary tracks. */
  audioTrack?: ChoiceSetting<string>;
  /** Music: the equalizer preset. */
  equalizer?: ChoiceSetting<string>;
  /** Music: the crossfade between tracks, in seconds (0 = off). */
  crossfade?: ChoiceSetting<number>;
  /** Pause after a while, in minutes (0 = off). */
  sleepTimer?: ChoiceSetting<number>;
  /** Music: the output device. */
  output?: ChoiceSetting<string>;
  /** Even out loudness between tracks. */
  normalize?: ToggleSetting;
  /** Video: play the file again from the start. */
  loop?: ToggleSetting;
}

/** The usual playback speeds, "Normal" at 1×. */
export const speedChoices = (labels: Pick<Labels, 'normalSpeed'> = defaultLabels): Choice<number>[] =>
  [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((v) => ({ value: v, label: v === 1 ? labels.normalSpeed : `${v}×` }));

function choice<T extends string | number>(key: string, label: string, icon: React.ReactNode, s: ChoiceSetting<T> | undefined): MenuItem | false {
  if (!s) return false;
  return {
    key,
    label,
    icon,
    hint: s.options.find((o) => o.value === s.value)?.label,
    items: s.options.map((o) => ({ key: String(o.value), label: o.label, checked: o.value === s.value, radio: true, onSelect: () => s.onChange(o.value) })),
  };
}

/**
 * The items of a player's settings menu, from the groups the player supports: video passes speed,
 * quality, captions and audio track; music passes equalizer, crossfade, sleep timer and output.
 * Groups left out don't show. Pass the words from `useLabels()` to translate them.
 */
export function buildMediaSettings(c: MediaSettingsConfig, labels: Labels = defaultLabels): MenuItem[] {
  return tidyMenuItems([
    choice('speed', labels.playbackSpeed, <IconSpeed size={17} />, c.speed),
    choice('quality', labels.quality, <IconHd size={17} />, c.quality),
    choice('captions', labels.subtitles, <IconCaptions size={17} />, c.captions),
    choice('audio', labels.audioTrack, <IconAudioTrack size={17} />, c.audioTrack),
    choice('eq', labels.equalizer, <IconSliders size={17} />, c.equalizer),
    choice('crossfade', labels.crossfade, <IconAudioTrack size={17} />, c.crossfade),
    choice('output', labels.playOn, <IconSpeaker size={17} />, c.output),
    choice('sleep', labels.sleepTimer, <IconMoon size={17} />, c.sleepTimer),
    (c.normalize || c.loop) && { key: 'divider', divider: true },
    c.normalize && { key: 'normalize', label: labels.normalizeVolume, checked: c.normalize.value, keepOpen: true, onSelect: () => c.normalize!.onChange(!c.normalize!.value) },
    c.loop && { key: 'loop', label: labels.loop, icon: <IconRepeat size={17} />, checked: c.loop.value, keepOpen: true, onSelect: () => c.loop!.onChange(!c.loop!.value) },
  ]);
}
