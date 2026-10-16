import React, { useLayoutEffect, useRef, useState } from 'react';

interface ScaledStageProps {
  /** The width the content lays itself out at, e.g. a desktop window. */
  width: number;
  /** Its height at that width. */
  height: number;
  children: React.ReactNode;
}

// Below this the stage stops scaling and the content takes its real, narrow layout instead.
const MIN_SCALED = 700;

/**
 * Shows a window-sized component (a file explorer) at its desktop width, scaled down to fit the
 * page, so its container queries see the desktop layout. On a narrow page it isn't scaled.
 * A transform, not CSS zoom: it leaves layout alone, so measuring can't feed back into it.
 */
export function ScaledStage({ width, height, children }: ScaledStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    // A scrollbar coming and going changes the width a little; that much is ignored, so it settles.
    let last = 0;
    const measure = () => {
      const style = getComputedStyle(frame);
      const w = frame.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const next = w >= MIN_SCALED ? Math.min(1, w / width) : 1;
      if (Math.abs(next - last) < 0.02 && next !== 1) return;
      last = next;
      setScale(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [width]);
  const scaled = scale < 1;
  return (
    <div ref={frameRef} className="docs-scaled-stage">
      {/* Out of flow, so the content never widens the frame it is measured against. */}
      <div className="docs-scaled-stage-box" style={{ height: height * scale }}>
        <div className="docs-scaled-stage-content" style={{ width: scaled ? width : '100%', height, transform: scaled ? `scale(${scale})` : undefined }}>{children}</div>
      </div>
    </div>
  );
}
