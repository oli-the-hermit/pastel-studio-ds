import React, { useEffect, useState } from 'react';
import { Button, Field, Slider } from '@pastel-studio/react';
import type { ComponentDemo } from './types';
import { OnVideo } from '../blocks/OnVideo';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-demo-wide">{node}</div>;
const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const LENGTH = 200; // a 3:20 song
const chapters = [{ value: 60, label: 'Verse' }, { value: 120, label: 'Chorus' }];

function Demo() {
  const [position, setPosition] = useState(64);
  const [seekedTo, setSeekedTo] = useState<number | null>(null);
  const [volume, setVolume] = useState(70);
  const [focus, setFocus] = useState(0);
  const [running, setRunning] = useState(false);

  // A session timer that ticks once a second while running, read only.
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setFocus((s) => (s >= 25 * 60 ? 0 : s + 15)), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  return (
    <div className="docs-demo-form docs-demo-narrow">
      <Field label="A song, with chapters" group>
        <Slider
          label="Seek"
          value={position}
          max={LENGTH}
          buffered={150}
          marks={chapters}
          valueText={(v) => `${time(v)} of ${time(LENGTH)}`}
          preview={time}
          onChange={setPosition}
          onChangeEnd={setSeekedTo}
        />
      </Field>
      <Field label="Volume" group>
        <Slider label="Volume" value={volume} onChange={setVolume} size="sm" knob="hover" valueText={(v) => `${v}%`} />
      </Field>
      <Field label="Session progress (read only)" group>
        <Slider label="Session progress" value={focus} max={25 * 60} readOnly valueText={(v) => `${time(v)} of 25:00`} />
      </Field>
      <div className="docs-demo-actions">
        <Button size="sm" onClick={() => setRunning((on) => !on)}>{running ? 'Pause the timer' : 'Start the timer'}</Button>
      </div>
      <span className="docs-demo-status" role="status">
        {time(position)} of {time(LENGTH)}{seekedTo !== null && `, last seek to ${time(seekedTo)}`}. Volume {volume}%. Focus {time(focus)}.
      </span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Default: wide(<Slider label="Volume" value={40} onChange={noop} />),
    Buffered: wide(<Slider label="Seek" value={30} buffered={70} onChange={noop} />),
    Chapters: wide(<Slider label="Seek" value={45} marks={[{ value: 30 }, { value: 60 }]} onChange={noop} />),
    'Read only': wide(<Slider label="Session progress" value={62} readOnly />),
    Disabled: wide(<Slider label="Volume" value={40} disabled />),
  },
  variants: {
    md: wide(<Slider label="Seek" value={40} onChange={noop} />),
    sm: wide(<Slider label="Volume" value={40} size="sm" onChange={noop} />),
    'Knob on hover': wide(<Slider label="Seek" value={40} knob="hover" onChange={noop} />),
    'No knob': wide(<Slider label="Session progress" value={62} knob="none" readOnly />),
    'On video': <OnVideo wide><Slider label="Seek" value={40} buffered={65} surface="overlay" onChange={noop} /></OnVideo>,
    Retinted: wide(<Slider label="Break progress" value={40} className="docs-slider-break" readOnly />),
  },
  dos: [
    'Give it a `valueText` people understand: a time, a percent, a level.',
    'Commit expensive changes, like a seek over the network, in `onChangeEnd`.',
    'Use `readOnly` for progress the person can\'t change, like the timer.',
  ],
  donts: [
    'Don\'t use it for a precise number: a field is quicker to type into.',
    'Don\'t hide the knob on a slider that is the main control of a screen.',
  ],
};
