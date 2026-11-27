import React, { useState } from 'react';
import { EpisodeCard, IconFileVideo, MediaRow } from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const art = [covers.tidal, covers.dune, covers.midnight, covers.neon, covers.orchard, covers.paper];
const season = [
  { title: 'Pilot', summary: 'The ferry is late again, and the lighthouse keeper has stopped answering the radio.' },
  { title: 'Low water', summary: 'Mara rows out before the tide turns and finds the lamp room locked from the inside.' },
  { title: 'Secrets', summary: 'A box of letters turns up in the chandlery. Nobody in the harbour admits to the handwriting.' },
  { title: 'The long way down', summary: 'The pilot takes a ship through the narrows in fog, with the radio still silent.' },
  { title: 'Bell buoy', summary: 'What the sisters heard from the point on the night the light went out.' },
  { title: 'Spring tide', summary: 'The water comes higher than anyone remembers, and the boat shed has to be emptied by hand.' },
  { title: 'Northbound', summary: 'Mara leaves on the first ferry. The keeper is on the quay to see it go.' },
];

function Demo() {
  const [current, setCurrent] = useState(2);
  return (
    <div className="docs-gallery-span docs-demo-stack">
      <div className="docs-media-row">
        <MediaRow title="Season 1">
          {season.map((episode, i) => (
            <EpisodeCard
              key={episode.title}
              overline={`Episode ${i + 1}`}
              length={`${44 + i} min`}
              title={episode.title}
              summary={episode.summary}
              image={art[i % art.length]}
              icon={<IconFileVideo />}
              watched={i < current}
              progress={i === current ? 0.4 : undefined}
              current={i === current}
              onClick={() => setCurrent(i)}
            />
          ))}
        </MediaRow>
      </div>
      <span className="docs-demo-status" role="status">Playing episode {current + 1}, {season[current].title}.</span>
    </div>
  );
}

const episode = { overline: 'Episode 3', length: '48 min', title: 'Secrets', summary: season[2].summary, icon: <IconFileVideo /> };
// A card is wider than a column of the gallery: each example takes a row of its own.
const wide = (cards: React.ReactNode) => <div className="docs-gallery-span docs-demo-row">{cards}</div>;

export const demo: ComponentDemo = {
  Demo,
  states: {
    Picture: wide(<EpisodeCard {...episode} image={covers.tidal} />),
    'No picture': wide(<EpisodeCard {...episode} />),
    'In progress': wide(<EpisodeCard {...episode} image={covers.dune} progress={0.4} length="29 min left" />),
    Watched: wide(<EpisodeCard {...episode} overline="Episode 1" title="Pilot" summary={season[0].summary} image={covers.midnight} watched />),
    Current: wide(<EpisodeCard {...episode} image={covers.neon} progress={0.6} current />),
    Unavailable: wide(
      <>
        <EpisodeCard {...episode} image={covers.tidal} unavailable="Can't find this file" />
        <EpisodeCard {...episode} overline="Episode 4" title="The long way down" unavailable="The drive is not connected" />
      </>
    ),
    'Long text': wide(
      <EpisodeCard
        overline="Season 1 · Episode 12 · Special"
        length="1 h 32 min"
        title="The collected field recordings of the northern coast"
        summary="Wind in the rigging, the engine room of the night ferry, gulls over the fish market at five in the morning, rain on a tin roof and the bell buoy off the point."
        image={covers.paper}
      />
    ),
  },
  variants: {
    'In a row': (
      <div className="docs-gallery-span">
        <div className="docs-media-row">
          <MediaRow title="Season 1" headingLevel={3}>
            {season.map((each, i) => (
              <EpisodeCard
                key={each.title}
                overline={`Episode ${i + 1}`}
                length={`${44 + i} min`}
                title={each.title}
                summary={each.summary}
                image={i === 5 ? undefined : art[i % art.length]}
                icon={<IconFileVideo />}
                watched={i < 2}
                progress={i === 2 ? 0.4 : undefined}
                current={i === 2}
                unavailable={i === 4 ? "Can't find this file" : undefined}
              />
            ))}
          </MediaRow>
        </div>
      </div>
    ),
  },
  dos: [
    'Put a season\'s episodes in a MediaRow of cards, in order, under a TitleHeader.',
    'Say which episode it is in `overline` and what it is called in `title`: the two together tell episodes apart.',
    'Give every card an `icon`: it stands in when there is no picture or it fails to load.',
    'Use `progress` for what is half watched, `watched` for what is done and `current` for the one playing now.',
  ],
  donts: [
    'Don\'t use it in a grid of mixed titles: that is a TitleTile with `shape="wide"`.',
    'Don\'t put what matters only in the summary: it is cut off after two lines.',
    'Don\'t disable a card whose file is missing: set `unavailable` and open the way to fix it on click.',
  ],
};
