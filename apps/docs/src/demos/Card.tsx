import React, { useState } from 'react';
import { Button, Card, CardHeader, Chip, IconButton, IconPin, IconPlus, PanelHeader, ProgressBar } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const TOTAL = 5;

function Demo() {
  const [done, setDone] = useState(2);
  const [pinned, setPinned] = useState(false);
  const left = TOTAL - done;
  return (
    <div className="docs-page-patch">
      <Card>
        <CardHeader
          overline="Today"
          title="Weekend errands"
          titleAddon={<Chip tone="accent">{left ? `${left} left` : 'All done'}</Chip>}
          subtitle={<><Chip>Home</Chip><Chip>Shopping</Chip></>}
          actions={<IconButton label="Pin list" size="sm" pressed={pinned} onClick={() => setPinned((on) => !on)}><IconPin size={16} /></IconButton>}
        />
        <div className="docs-card-body">
          <ProgressBar value={(done / TOTAL) * 100} status={left ? 'processing' : 'completed'} label="Tasks done" />
          <div className="docs-demo-row">
            <Button size="sm" variant="primary" onClick={() => setDone((n) => Math.min(TOTAL, n + 1))}>Finish a task</Button>
            <Button size="sm" onClick={() => setDone(0)}>Start over</Button>
          </div>
        </div>
      </Card>
      <Card>
        <PanelHeader title="Up next" action={<Button size="sm" icon={<IconPlus size={16} />}>Add</Button>} />
        <div className="docs-card-body">
          <p>Return the library books.</p>
          <p>Call the plumber about the sink.</p>
        </div>
      </Card>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Long title': (
      <div className="docs-page-patch">
        <Card className="docs-card-narrow">
          <CardHeader
            title="Everything to sort out before the move at the end of the month"
            titleTooltip="Everything to sort out before the move at the end of the month"
            titleAddon={<Chip tone="accent">12 left</Chip>}
          />
          <p>The title keeps to one line.</p>
        </Card>
      </div>
    ),
  },
  variants: {
    CardHeader: (
      <div className="docs-page-patch">
        <Card>
          <CardHeader
            overline="This week"
            title="Focus goals"
            titleAddon={<Chip tone="accent">2 of 3</Chip>}
            subtitle={<><Chip>Deep work</Chip><Chip>Reading</Chip></>}
            actions={<IconButton label="Pin goals" size="sm"><IconPin size={16} /></IconButton>}
          />
          <ProgressBar value={66} size="lg" label="Goals reached" />
        </Card>
      </div>
    ),
    PanelHeader: (
      <div className="docs-page-patch">
        <Card>
          <PanelHeader title="Recent lists" action={<Button size="sm" icon={<IconPlus size={16} />}>New</Button>} />
          <p>Weekend errands, Reading, Garden.</p>
        </Card>
      </div>
    ),
    Padding: (
      <div className="docs-page-patch">
        <Card padding="sm"><p>Small padding, for a compact card.</p></Card>
        <Card padding="none"><p className="docs-card-flush">No padding: the content brings its own.</p></Card>
      </div>
    ),
    Plain: (
      <div className="docs-page-patch">
        <Card>
          <p>Three sessions this week, two of them over an hour.</p>
        </Card>
      </div>
    ),
  },
  dos: [
    'Group things that belong together on one card, and let the space between cards separate them.',
    'Use `CardHeader` for the main cards of a page and `PanelHeader` for side panels.',
    'Put the one count that matters in `titleAddon` as an accent chip.',
  ],
  donts: [
    'Don\'t put a card on a card: use a raised row or a divider of space inside it.',
    'Don\'t add borders or shadows to a card: the tonal step is the edge.',
  ],
};
