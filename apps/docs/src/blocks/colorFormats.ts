// A color in the formats a designer or a developer reaches for: hex, RGB, HSL, OKLCH, CMYK and
// CIELAB L* (the tone in a palette name). Used by the swatch book's click-to-copy codes.

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const linear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance, 0 to 1. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** CIELAB L*, 0 (black) to 100 (white): the number in a palette name. */
export function tone(hex: string): number {
  const y = luminance(hex);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

export function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export function rgbToCmyk([r, g, b]: Rgb): [number, number, number, number] {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k >= 1) return [0, 0, 0, 100];
  const f = (c: number) => Math.round(((1 - c / 255 - k) / (1 - k)) * 100);
  return [f(r), f(g), f(b), Math.round(k * 100)];
}

/** OKLCH: perceptual lightness (0–1), chroma and hue in degrees. */
export function rgbToOklch(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  const H = C < 0.0005 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  return [L, C, H < 0 ? H + 360 : H];
}

export interface ColorCode {
  /** The short label on the button: HEX, RGB… */
  label: string;
  /** What is copied, and shown. */
  value: string;
}

/** Every code of a color, in the order a chip lists them. */
export function colorCodes(hex: string): ColorCode[] {
  const upper = hex.toUpperCase();
  const rgb = hexToRgb(upper);
  const [h, s, l] = rgbToHsl(rgb);
  const [L, C, H] = rgbToOklch(rgb);
  return [
    { label: 'HEX', value: upper },
    { label: 'RGB', value: `rgb(${rgb.join(' ')})` },
    { label: 'HSL', value: `hsl(${h} ${s}% ${l}%)` },
    { label: 'OKLCH', value: `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${Math.round(H)})` },
    { label: 'CMYK', value: rgbToCmyk(rgb).join(' ') },
    { label: 'L*', value: String(Math.round(tone(upper))) },
  ];
}

/** The ink that reads best on a color: near-black or white. */
export function inkOn(hex: string, dark = '#1A1C17', light = '#FFFFFF'): string {
  return contrast(hex, dark) >= contrast(hex, light) ? dark : light;
}
