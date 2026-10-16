/** 0:07, 4:05, 1:02:09: a media time. Negative or unknown values read 0:00. */
export function formatTime(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/** 0 bytes, 812 kB, 4.2 MB: a file size in the reader's language (1 kB = 1024 bytes, as file browsers count). */
export function formatBytes(bytes: number, locale?: string): string {
  const b = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  const i = b ? Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(b) / Math.log(1024))) : 0;
  const v = b / 1024 ** i;
  return new Intl.NumberFormat(locale, { style: 'unit', unit: BYTE_UNITS[i], unitDisplay: i ? 'short' : 'long', maximumFractionDigits: i && v < 10 ? 1 : 0 }).format(v);
}

/** 12/10/2026, 14:05: a date and time in the reader's format. */
export function formatDateTime(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** 48 min, 1 hr 12 min: a total length, in the reader's language. */
export function formatDuration(seconds: number, locale?: string): string {
  const minutes = Math.round(Math.max(0, seconds) / 60);
  const unit = (value: number, u: 'hour' | 'minute') => new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'short' }).format(value);
  if (minutes < 60) return unit(minutes, 'minute');
  const rest = minutes % 60;
  return rest ? `${unit(Math.floor(minutes / 60), 'hour')} ${unit(rest, 'minute')}` : unit(minutes / 60, 'hour');
}
