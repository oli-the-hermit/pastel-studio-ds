import React, { useState } from 'react';
import { Button, IconFileVideo, IconPlay, IconRefresh, TextButton, TitleHeader } from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

const film = {
  overline: 'Film',
  title: 'Harbour at dusk',
  facts: ['2001', '1 h 52 min', 'Drama, Mystery'],
  rating: { value: '7.8', source: 'IMDb', label: 'IMDb rating 7.8 out of 10' },
  summary: 'The ferry is late again, and the lighthouse keeper has stopped answering the radio. Mara rows out before the tide turns, and finds the lamp room locked from the inside.',
  backdrop: covers.tidal,
  poster: covers.midnight,
  icon: <IconFileVideo />,
};

const longSummary =
  'Wind in the rigging, the engine room of the night ferry, gulls over the fish market at five in the morning, rain on a tin roof, the bell buoy off the point and a choir rehearsing in the boat shed. Over four winters a sound recordist follows the people who keep a small harbour working, from the pilot who has brought ships in for forty years to the two sisters who took over the chandlery, and asks what is left of a place when the boats stop coming. The film has no narrator: what is said is said by the people in it, and most of the time nobody says anything at all.';

const play = (
  <>
    <Button variant="primary" icon={<IconPlay />}>Play</Button>
    <Button surface={2} icon={<IconRefresh />}>Start over</Button>
  </>
);

function Demo() {
  const [message, setMessage] = useState('Half watched: Resume picks up at 48 min.');
  return (
    <div className="docs-gallery-span docs-demo-stack">
      <div className="docs-title-header">
        <TitleHeader {...film} headingLevel={2} actions={
          <>
            <Button variant="primary" icon={<IconPlay />} onClick={() => setMessage('Resume: the app would play from 48 min.')}>Resume</Button>
            <Button surface={2} icon={<IconRefresh />} onClick={() => setMessage('Start over: the app would play from the start.')}>Start over</Button>
          </>
        }>
          <TextButton onClick={() => setMessage('The app would open the page to pick another match.')}>Not the right film?</TextButton>
        </TitleHeader>
      </div>
      <span className="docs-demo-status" role="status">{message}</span>
    </div>
  );
}

const frame = (header: React.ReactNode, narrow = false) => (
  <div className="docs-gallery-span"><div className={narrow ? 'docs-title-header docs-title-header--narrow' : 'docs-title-header'}>{header}</div></div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    'With a backdrop': frame(<TitleHeader {...film} headingLevel={3} actions={play} />),
    'Without a backdrop': frame(<TitleHeader {...film} backdrop={undefined} headingLevel={3} actions={play} />),
    'No poster': (
      <>
        {frame(<TitleHeader {...film} poster={undefined} headingLevel={3} actions={play} />)}
        {frame(<TitleHeader {...film} poster={undefined} icon={undefined} backdrop={covers.dune} headingLevel={3} actions={play} />)}
      </>
    ),
    'With a rating': frame(<TitleHeader overline="Series" title="A walk in the dunes" facts={['2024', '2 seasons']} rating={{ value: '92%', source: 'Critics', label: 'Critics score 92 percent' }} headingLevel={3} />),
    'Long text': frame(
      <TitleHeader
        {...film}
        title="The collected field recordings of the northern coast, volumes one to four"
        facts={['2019', '3 h 4 min', 'Documentary, Music, Nature']}
        summary={longSummary}
        backdrop={covers.neon}
        headingLevel={3}
        actions={play}
      />
    ),
  },
  variants: {
    'Title only': frame(<TitleHeader title="Untitled film" headingLevel={3} />),
    Narrow: frame(<TitleHeader {...film} headingLevel={3} actions={play} />, true),
  },
  dos: [
    'Put one at the top of a film or series page, with `headingLevel={1}` when its title is the page\'s title.',
    'Use a backdrop with its subject to the right or at the top: the lower left is where the text is.',
    'Give `icon` the kind of title, so a missing poster leaves a placeholder and not a gap.',
    'Keep the first action the one most people want: "Resume" when it is half watched, "Play" otherwise.',
  ],
  donts: [
    'Don\'t put text in the backdrop: it is cropped, faded and hidden from screen readers.',
    'Don\'t use it to suggest titles on a home page: that is a HeroBanner.',
    'Don\'t cut the overview short yourself: it is shown whole, at a readable measure.',
  ],
};
