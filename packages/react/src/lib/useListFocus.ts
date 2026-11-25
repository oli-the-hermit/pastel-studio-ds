// The keyboard focus of a list whose items come and go (a folder's files, a feed): which item has
// it, and keeping the real focus in the list when that item's element leaves. Shared by MediaGrid
// and FileView.
import React, { useLayoutEffect, useRef, useState } from 'react';

interface FocusState {
  /** The focused item's key; null until something is focused, and after the list changed. */
  key: string | null;
  /** Where that item was, to fall back to when it leaves. */
  index: number;
  /** The first item's key at the time, to tell another list (a new folder) from the same one changed. */
  first: string | null;
}

const START: FocusState = { key: null, index: 0, first: null };

/**
 * The focused item, kept by its key: an item coming or going above it, or a new sort, leaves the
 * focus on the same item. When that item leaves, the focus falls to the one now in its place
 * (the next, or the last). When the whole list changes (its first item and the focused one are
 * both gone, or it empties) the focus goes back to the first item.
 */
export function useFocusKey<T>(items: readonly T[], getKey: (item: T) => string) {
  const [state, setState] = useState<FocusState>(START);
  const n = items.length;
  const first = n ? getKey(items[0]) : null;

  let index = 0;
  if (n && state.key !== null) {
    if (state.index < n && getKey(items[state.index]) === state.key) index = state.index;
    else {
      const found = items.findIndex((item) => getKey(item) === state.key);
      index = found >= 0 ? found : first === state.first ? Math.min(state.index, n - 1) : 0;
    }
  }

  // Remember where the focus is now, so the next change starts from here. Set while drawing (as
  // React allows for state worked out from props), so no draw ever shows the old place.
  if (!n) {
    if (state.key !== null || state.index !== 0) setState(START);
  } else if (state.key !== null) {
    const key = getKey(items[index]);
    if (key !== state.key || index !== state.index || first !== state.first) {
      const found = key === state.key || first === state.first;
      setState(found ? { key, index, first } : { key: null, index: 0, first });
    }
  }

  const focusIndex = (i: number) => {
    if (i >= 0 && i < n) setState({ key: getKey(items[i]), index: i, first });
  };

  return [index, focusIndex] as const;
}

/**
 * Keeps the keyboard in a list when its focused element leaves (Delete, a move, Enter on a
 * folder): after each draw, if the focus was inside the list and has fallen to the page, it goes
 * to the item at `index`, or to the list itself when that isn't drawn. Spread the handlers on the
 * list.
 */
export function useKeepFocus(
  listRef: React.RefObject<HTMLElement | null>,
  index: number,
  itemAt: (list: HTMLElement, index: number) => HTMLElement | null | undefined,
) {
  const inside = useRef(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!inside.current || !list) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    (itemAt(list, index) ?? list).focus({ preventScroll: true });
  });

  return {
    onFocus: () => {
      inside.current = true;
    },
    onBlur: (e: React.FocusEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      // A browser may blur an element as it leaves the page, during the very draw that takes it
      // out; that draw puts the focus back (above) before this runs. Any other blur, a click
      // elsewhere or Tab, leaves the focus outside, and the list lets go of it.
      queueMicrotask(() => {
        if (!listRef.current?.contains(document.activeElement)) inside.current = false;
      });
    },
  };
}
