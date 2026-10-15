import React, { useEffect, useRef } from 'react';

/**
 * A "video" drawn in the browser from a playback time: a tide rising and falling under a moon.
 * No file and no network; the picture moves only as the simulated clock does.
 */
export function SimulatedVideo({ time }: { time: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    // Content colors, like a photo's: they are the picture, not the interface.
    ctx.fillStyle = '#0E4F46';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#F1F2EC';
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.28 + Math.sin(time / 6) * 6, h * 0.11, 0, Math.PI * 2);
    ctx.fill();
    const wave = (base: number, amp: number, color: string, speed: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, base + Math.sin(x / 60 + time * speed) * amp);
      ctx.lineTo(w, h);
      ctx.fill();
    };
    const tide = h * (0.62 + Math.sin(time / 9) * 0.05);
    wave(tide, 10, '#5EC8B8', 1.2);
    wave(tide + h * 0.12, 8, '#103B36', 0.8);
  }, [time]);
  return <canvas ref={ref} width={640} height={360} aria-hidden="true" />;
}
