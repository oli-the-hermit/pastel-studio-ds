/** A track, as the music components read it. */
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  /** Seconds. */
  duration: number;
  /** An image URL for its cover. */
  cover?: string;
  year?: number;
  explicit?: boolean;
  /** Its number on its album. */
  number?: number;
  /** When it was added to a playlist (ISO date). */
  addedAt?: string;
}

/** An album, EP, single or playlist. */
export interface Album {
  id: string;
  title: string;
  artist: string;
  kind: 'Album' | 'EP' | 'Single' | 'Playlist' | 'Compilation';
  year?: number;
  cover?: string;
  tracks: Track[];
  description?: string;
  label?: string;
  releaseDate?: string;
  copyright?: string;
}
