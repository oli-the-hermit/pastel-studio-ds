import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '@pastel-studio/react';
import { Callout, Code, Page, Section } from '../../blocks/Page';
import { Example } from '../../blocks/Example';
import { TokenTable } from '../../blocks/TokenTable';
import { scaleGroup, tokensWith } from '../../tokens';

const CURVES = [
  { name: '--ps-ease-standard', label: 'Standard', className: 'is-standard', use: 'Small, utility changes: hovers, colors, fades, icon swaps.' },
  { name: '--ps-ease-emphasized', label: 'Emphasized', className: 'is-emphasized', use: 'Things that move or change shape: dialogs, pages, switches, panels opening.' },
  { name: '--ps-ease-decel', label: 'Decelerate', className: 'is-decel', use: 'Emphasized, entering: starts fast, lands softly.' },
  { name: '--ps-ease-accel', label: 'Accelerate', className: 'is-accel', use: 'Emphasized, leaving: starts slowly, exits fast.' },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const update = () => setReduced(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Asks the browser to evaluate each curve (Web Animations), so the plot is exactly what renders. */
function useSampledCurves(probe: React.RefObject<HTMLSpanElement>) {
  const [curves, setCurves] = useState<Record<string, [number, number][]>>({});
  useLayoutEffect(() => {
    const el = probe.current;
    if (!el) return;
    const root = getComputedStyle(document.documentElement);
    const out: Record<string, [number, number][]> = {};
    for (const c of CURVES) {
      const easing = root.getPropertyValue(c.name).trim();
      const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, easing, fill: 'both' });
      anim.pause();
      const points: [number, number][] = [];
      for (let t = 0; t <= 1000; t += 10) {
        anim.currentTime = t;
        points.push([t / 1000, Number(anim.effect?.getComputedTiming().progress ?? 0)]);
      }
      anim.cancel();
      out[c.name] = points;
    }
    setCurves(out);
  }, [probe]);
  return curves;
}

function CurvePlot() {
  const probe = useRef<HTMLSpanElement>(null);
  const curves = useSampledCurves(probe);
  const W = 320;
  const H = 200;
  const pt = ([x, y]: [number, number]) => `${(x * W).toFixed(1)},${(H - y * H).toFixed(1)}`;
  return (
    <figure className="docs-curves">
      <span ref={probe} className="docs-visually-hidden" />
      <svg viewBox={`-8 -8 ${W + 16} ${H + 16}`} className="docs-curves-plot" role="img" aria-label="Progress over time for the four easing curves">
        <rect x="0" y="0" width={W} height={H} className="docs-curves-bg" />
        {CURVES.map((c) => curves[c.name] && (
          <polyline key={c.name} points={curves[c.name].map(pt).join(' ')} className={cx('docs-curve', c.className)} />
        ))}
      </svg>
      <figcaption className="docs-curves-legend">
        {CURVES.map((c) => <span key={c.name} className={cx('docs-curves-key', c.className)}>{c.label}</span>)}
      </figcaption>
    </figure>
  );
}

/** "260ms" → 260, "1.6s" → 1600. */
function toMs(value: string): number {
  const v = value.trim();
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
}

/**
 * A Play button that moves a dot along each track, with that track's duration and curve.
 * The dots move with the Web Animations API, not CSS transitions: Pastel Studio's
 * reduced-motion rule cuts every transition to nothing, and on this page the motion is the
 * content. Nothing moves on its own; only a press on Play starts it.
 */
function Tracks({ rows }: { rows: { key: string; label: React.ReactNode; duration: string; easing: string }[] }) {
  const [atEnd, setAtEnd] = useState(false);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  const play = () => {
    const forward = !atEnd;
    const start = '0px';
    const end = 'calc(100% - var(--docs-dot))';
    for (const dot of dots.current) {
      if (!dot) continue;
      // The custom properties resolve to the token's real value: "260ms", "linear(…)".
      const cs = getComputedStyle(dot);
      dot.getAnimations().forEach((a) => a.cancel());
      dot.animate([{ left: forward ? start : end }, { left: forward ? end : start }], {
        duration: toMs(cs.getPropertyValue('--docs-dur')),
        easing: cs.getPropertyValue('--docs-ease').trim(),
        fill: 'forwards',
      });
    }
    setAtEnd(forward);
  };

  return (
    <div className="docs-tracks">
      <button type="button" className="docs-button" onClick={play}>
        {atEnd ? 'Play back' : 'Play'}
      </button>
      <ul>
        {rows.map((r, i) => (
          <li key={r.key} className="docs-track-row">
            <span className="docs-track-label">{r.label}</span>
            <span className="docs-track">
              <span
                ref={(el) => { dots.current[i] = el; }}
                className="docs-track-dot"
                style={{ '--docs-dur': r.duration, '--docs-ease': r.easing } as React.CSSProperties}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Motion() {
  const motion = scaleGroup('Motion');
  const durations = tokensWith(motion, '--ps-dur-');
  const transitions = tokensWith(motion, '--ps-transition');
  const reduced = usePrefersReducedMotion();
  return (
    <Page
      overline="Foundations"
      title="Motion"
      lead="Motion shows where something came from and where it went. It's short, it can be interrupted, and it never leaves anything half see-through: opacity only changes in transit."
    >
      {reduced && (
        <Callout title="Reduced motion is on">
          Your system asks for reduced motion, so Pastel Studio apps skip their animations. The demos on this page still play, but only when you press Play.
        </Callout>
      )}

      <Section title="Two curves" description={<>From Material 3. <strong>Standard</strong> for small changes. <strong>Emphasized</strong> for things that move: it starts fast and takes its time to settle, which feels responsive and calm at once. Material defines emphasized as a two-part path, which a single <Code>cubic-bezier()</Code> can't draw, so the token samples it with <Code>linear()</Code>. Decelerate and accelerate are emphasized's two halves, for one-way trips.</>}>
        <Example>
          <div className="docs-motion-curves">
            <CurvePlot />
            <Tracks rows={CURVES.map((c) => ({ key: c.name, label: c.label, duration: '1200ms', easing: `var(${c.name})` }))} />
          </div>
        </Example>
        <p className="docs-note">The tracks run slowed down, at 1.2 seconds, so the shapes are easy to compare.</p>
        <TokenTable tokens={CURVES.map((c) => ({ name: c.name, value: '', comment: c.use }))} columns={[{ header: 'Use', render: (t) => t.comment }]} />
      </Section>

      <Section title="Durations" description="Exits are faster than entrances; small things are faster than big ones. Progress that follows a one-second tick eases over half of it.">
        <Example>
          <Tracks rows={durations.map((d) => ({ key: d.name, label: <><Code>{d.name.replace('--ps-', '')}</Code> {d.value}</>, duration: `var(${d.name})`, easing: 'var(--ps-ease-standard)' }))} />
        </Example>
        <TokenTable tokens={durations} />
      </Section>

      <Section title="Shorthands" description="Ready-made duration and curve pairs for the most common transitions.">
        <TokenTable tokens={transitions} />
      </Section>
    </Page>
  );
}
