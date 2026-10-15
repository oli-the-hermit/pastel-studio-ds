/**
 * The surface a control sits on, so its fill and hover stay one step above it:
 * 0 the page, 1 a card (the default), 2 and 3 raised rows and panels, an accent fill, or `overlay`,
 * the see-through dock over video.
 */
export type Surface = 0 | 1 | 2 | 3 | 'accent' | 'accent-container' | 'overlay';

/** The class for a surface (none for the default, surface 1). */
export const surfaceClass = (surface: Surface | undefined): string | false =>
  surface !== undefined && surface !== 1 && `is-on-${surface}`;
