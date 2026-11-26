import React, { useState } from 'react';
import { Button, HeroBanner, IconInfo, IconPlay, type HeroBannerItem } from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const actions = (primary: string) => (
  <>
    <Button variant="primary" icon={<IconPlay />}>{primary}</Button>
    <Button surface={2} icon={<IconInfo />}>Details</Button>
  </>
);

const suggested: HeroBannerItem[] = [
  {
    id: 'harbour',
    overline: 'Continue watching',
    title: 'Harbour at dusk',
    facts: ['Season 1 · Episode 3', '48 min'],
    summary: 'The ferry is late again, and the lighthouse keeper has stopped answering the radio. Mara rows out before the tide turns.',
    image: covers.tidal,
    actions: actions('Resume'),
  },
  {
    id: 'dunes',
    overline: 'New in your library',
    title: 'A walk in the dunes',
    facts: ['2024', '1 h 52 min', 'Documentary'],
    summary: 'Four seasons on a strip of sand that moves a metre every year, and the people who measure it.',
    image: covers.dune,
    actions: actions('Play'),
  },
  {
    id: 'polar',
    overline: 'Because you played Tidal',
    title: 'Polar Nights',
    facts: ['Aurora Collective', '9 songs', '41 min'],
    summary: 'Slow, bright ambient pieces recorded over one winter north of the circle.',
    image: covers.midnight,
    actions: actions('Play'),
  },
];

const long: HeroBannerItem = {
  id: 'long',
  overline: 'Recently added',
  title: 'The collected field recordings of the northern coast, volumes one to four',
  facts: ['Compilation', '64 songs', '5 h 12 min'],
  summary:
    'Wind in the rigging, the engine room of the night ferry, gulls over the fish market at five in the morning, rain on a tin roof, the bell buoy off the point, a choir rehearsing in the boat shed, and forty more places where somebody stood still with a microphone for long enough to hear what was there.',
  image: covers.neon,
  actions: actions('Play'),
};

function Demo() {
  const [index, setIndex] = useState(0);
  return (
    <div className="docs-gallery-span docs-demo-stack">
      <div className="docs-hero-banner">
        <HeroBanner ariaLabel="Suggested" items={suggested} index={index} onIndexChange={setIndex} />
      </div>
      <span className="docs-demo-status" role="status">Showing {suggested[index].title}, {index + 1} of {suggested.length}</span>
    </div>
  );
}

const frame = (banner: React.ReactNode, narrow = false) => (
  <div className="docs-gallery-span"><div className={narrow ? 'docs-hero-banner docs-hero-banner--narrow' : 'docs-hero-banner'}>{banner}</div></div>
);
const plain = suggested.map((item) => ({ ...item, image: undefined }));

export const demo: ComponentDemo = {
  Demo,
  states: {
    'With a picture': frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={suggested} />),
    'Without a picture': frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={plain} />),
    'One item': frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={[suggested[1]]} />),
    'Long text': frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={[long, suggested[0]]} />),
    'Auto advance': frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={suggested} autoAdvance={8000} />),
  },
  variants: {
    'Title only': frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={[{ id: 'a', title: 'Polar Nights', image: covers.midnight }, { id: 'b', title: 'Orchard', image: covers.orchard }]} />),
    Narrow: frame(<HeroBanner ariaLabel="Suggested" headingLevel={3} items={suggested} />, true),
  },
  dos: [
    'Put one at the top of a home page, with the few titles worth the space: what to continue, what is new.',
    'Give every item a primary action that does what the overline promises: "Resume", "Play".',
    'Use pictures with their subject on the right: the text covers the left.',
    'Name the banner with `ariaLabel`: "Suggested", "Featured".',
  ],
  donts: [
    'Don\'t pass more than six items: the rest are ignored.',
    'Don\'t turn on `autoAdvance` where the summary has to be read; when you do, keep it slow (8 seconds or more).',
    'Don\'t put text in the picture: it is cropped to the banner and hidden from screen readers.',
    'Don\'t use it for a list to browse: that is a MediaRow or a TitleGrid.',
  ],
};
