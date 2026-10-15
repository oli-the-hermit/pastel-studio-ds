import React, { useState } from 'react';
import { LikeButton, TrackInfo } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};

function Demo() {
  const [liked, setLiked] = useState(false);
  return (
    <div className="docs-demo-row">
      <TrackInfo title="Northbound" artist="Glass Harbor" />
      <LikeButton liked={liked} onLikedChange={setLiked} />
      <span className="docs-demo-status" role="status">{liked ? 'In your Liked songs' : 'Not in Liked'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Not liked': <LikeButton liked={false} onLikedChange={noop} />,
    Liked: <LikeButton liked onLikedChange={noop} />,
  },
  variants: {
    sm: <LikeButton liked onLikedChange={noop} />,
    md: <LikeButton liked onLikedChange={noop} size="md" />,
  },
  dos: [
    'Put it right after the title it belongs to, in a row, a bar or a player.',
    'Save the change at once; there is nothing to confirm.',
  ],
  donts: [
    'Don\'t use a heart for anything but liking: a pin or a star means something else.',
  ],
};
