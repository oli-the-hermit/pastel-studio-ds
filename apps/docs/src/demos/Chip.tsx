import React, { useState } from 'react';
import { Button, Chip } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const [left, setLeft] = useState(3);
  return (
    <div className="docs-demo-row">
      <Chip tone="accent">{left ? `${left} tasks left` : 'All done'}</Chip>
      <Chip>Home</Chip>
      <Chip>Shopping</Chip>
      <Button size="sm" onClick={() => setLeft((n) => Math.max(0, n - 1))}>Finish a task</Button>
      <Button size="sm" onClick={() => setLeft(3)}>Start over</Button>
    </div>
  );
}

const long = 'Everything to sort out before the move at the end of the month';

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Long text': <Chip title={long}>{long}</Chip>,
  },
  variants: {
    default: <Chip>Reading</Chip>,
    accent: <Chip tone="accent">3 tasks left</Chip>,
  },
  dos: [
    'Keep it to a word or two, or a number with its noun: "3 tasks left".',
    'Use one accent chip per card at most, for the count that matters.',
  ],
  donts: [
    'Don\'t use a chip as a button or a filter: it can\'t be pressed or focused.',
    'Don\'t write a sentence in a chip; it gets cut off.',
  ],
};
