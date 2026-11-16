import type { CSSProperties } from 'react';

/** Inline style that may also set CSS custom properties (e.g. `--min` for `.auto-grid`). */
export const css = (o: CSSProperties & Record<`--${string}`, string | number>) => o as CSSProperties;
