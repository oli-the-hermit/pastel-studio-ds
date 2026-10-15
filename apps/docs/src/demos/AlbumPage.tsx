import React, { useState } from 'react';
import { AlbumPage, moveById, type Album } from '@pastel-studio/react';
import { album, playlist } from '../fixtures/music';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [currentId, setCurrentId] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  return (
    <div className="docs-page-patch">
      <AlbumPage
        className="docs-demo-wide"
        album={album}
        playing={playing && !!currentId}
        onPlayPause={() => { if (!currentId) setCurrentId(album.tracks[0].id); setPlaying((on) => !on); }}
        currentId={currentId}
        isPlaying={playing}
        onPlayTrack={(t) => { setCurrentId(t.id); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        likedIds={liked}
        onTrackLikedChange={(t, on) => setLiked((s) => { const next = new Set(s); if (on) next.add(t.id); else next.delete(t.id); return next; })}
      />
    </div>
  );
}

function PlaylistPage() {
  const [tracks, setTracks] = useState(playlist);
  const list: Album = { id: 'autumn', title: 'Autumn evenings', artist: 'You', kind: 'Playlist', tracks };
  return <AlbumPage className="docs-demo-wide" album={list} onPlayPause={noop} onPlayTrack={noop} playlist={{ onReorder: (a, b) => setTracks((l) => moveById(l, a, b) ?? l) }} />;
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Album: <div className="docs-page-patch docs-gallery-span"><AlbumPage className="docs-demo-wide" album={{ ...album, tracks: album.tracks.slice(0, 3) }} onPlayPause={noop} onPlayTrack={noop} /></div>,
  },
  variants: {
    Playlist: <div className="docs-page-patch docs-gallery-span"><PlaylistPage /></div>,
  },
  dos: [
    'Use it as the whole page for an album or a playlist; the parts are there to build other pages.',
  ],
  donts: [
    'Don\'t nest it in another card: it is a card already.',
  ],
};
