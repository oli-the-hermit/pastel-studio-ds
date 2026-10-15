import React, { createContext, useContext, useMemo } from 'react';

/**
 * The components' own words (screen-reader names, placeholders, tooltips), in one shared list,
 * so each word is translated once. Components never import an app's strings.
 * A word is added here together with the first component that uses it.
 */
export const defaultLabels = {
  close: 'Close',
  copy: 'Copy',
  actions: 'Actions',
  moreActions: 'More actions',
  selectPlaceholder: 'Select an option',
  options: 'Options',
  search: 'Search…',
  searchOptions: 'Search options',
  noMatches: 'No matches',
  create: 'Create',
  newItemName: 'Name',
  dragToReorder: 'Drag to reorder',
  reorderKeys: 'To move an item, press Alt with the up or down arrow.',
  movedTo: 'Moved to position {position} of {total}',
  loading: 'Loading',
  explicit: 'Explicit',
  showRemainingTime: 'Show remaining time',
  playback: 'Playback',
  play: 'Play',
  pause: 'Pause',
  previous: 'Previous',
  next: 'Next',
  stop: 'Stop',
  skipBack: 'Back {seconds} seconds',
  skipForward: 'Forward {seconds} seconds',
  shuffle: 'Shuffle',
  repeatOff: 'Repeat: off',
  repeatAll: 'Repeat: all',
  repeatOne: 'Repeat: this track',
  like: 'Add to Liked',
  unlike: 'Remove from Liked',
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
  queue: 'Queue',
  upNext: 'Up next',
  history: 'History',
  nowPlaying: 'Now playing',
  nextFrom: 'Next from {source}',
  queueEmpty: 'Nothing queued. Add songs with "Add to queue".',
  historyEmpty: 'Songs you play show up here.',
  queueActions: 'Queue actions',
  shuffleQueue: 'Shuffle queue',
  saveAsPlaylist: 'Save as playlist',
  clearQueue: 'Clear queue',
  autoplay: 'Autoplay',
  autoplayHint: 'Similar music when the queue ends',
  closeQueue: 'Close queue',
  removeFromQueue: 'Remove from queue: {title}',
  trackNumber: '#',
  trackTitle: 'Title',
  album: 'Album',
  dateAdded: 'Date added',
  duration: 'Duration',
  playTrack: 'Play {title}',
  pauseTrack: 'Pause {title}',
  trackActions: 'More actions for {title}',
  player: 'Player',
  nothingPlaying: 'Nothing playing',
  seek: 'Seek',
  timeOf: '{current} of {total}',
  lyrics: 'Lyrics',
  soundSettings: 'Sound settings',
  miniPlayer: 'Mini player',
  fullScreenPlayer: 'Full screen player',
  ep: 'EP',
  single: 'Single',
  playlist: 'Playlist',
  compilation: 'Compilation',
  songOne: '{count} song',
  songOther: '{count} songs',
  saveToLibrary: 'Save to library',
  removeFromLibrary: 'Remove from library',
  download: 'Download',
  share: 'Share',
  aboutAlbum: 'About this album',
  released: 'Released',
  recordLabel: 'Label',
  tracks: 'Tracks',
  length: 'Length',
  showMore: 'Show more',
  showLess: 'Show less',
};

export type Labels = typeof defaultLabels;

/** The type of a component's `labels` prop: only the words that component uses. */
export type LabelOverrides<K extends keyof Labels> = Partial<Pick<Labels, K>>;

const LabelsContext = createContext<Labels>(defaultLabels);

interface LabelsProviderProps {
  /** The words to translate or replace; the rest keep their defaults. */
  labels: Partial<Labels>;
  children: React.ReactNode;
}

/** Translates or replaces the components' words for everything inside it. Providers nest. */
export function LabelsProvider({ labels, children }: LabelsProviderProps) {
  const inherited = useContext(LabelsContext);
  const value = useMemo(() => ({ ...inherited, ...labels }), [inherited, labels]);
  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>;
}

/** A component's words: the defaults, then the nearest provider's, then its own `labels` prop. */
export function useLabels(overrides?: Partial<Labels>): Labels {
  const labels = useContext(LabelsContext);
  return overrides ? { ...labels, ...overrides } : labels;
}
