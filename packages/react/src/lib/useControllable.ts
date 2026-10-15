import { useCallback, useRef, useState } from 'react';

/**
 * Controlled or uncontrolled state: pass `value` to control it, or leave it undefined and the
 * component owns it from `defaultValue`. `onChange` fires either way.
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChangeRef.current?.(next);
    },
    [controlled]
  );
  return [current, set] as const;
}
