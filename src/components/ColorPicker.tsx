'use client';

import type { ColorOption } from '../data/products';

interface Props {
  legend: string;
  colors: ColorOption[];
  value: number;
  onChange: (i: number) => void;
  /** tiles: 3-up square tiles (product page) · pills: inline pills (custom size) */
  layout?: 'tiles' | 'pills';
  /** Out-of-stock colours: shown with `soldOutLabel`, can't be chosen. */
  isSoldOut?: (c: ColorOption) => boolean;
  soldOutLabel?: string;
}

export function ColorPicker({ legend, colors, value, onChange, layout = 'tiles', isSoldOut, soldOutLabel = '' }: Props) {
  const tiles = layout === 'tiles';
  return (
    <fieldset className="plain">
      <legend>
        {legend}
        {tiles && <span style={{ fontWeight: 400, color: 'var(--ink-2)' }}> · {colors[value].name}</span>}
      </legend>
      <div
        style={
          tiles
            ? { marginTop: 10, display: 'grid', gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))`, gap: 8 }
            : { marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }
        }
      >
        {colors.map((c, i) => {
          const out = isSoldOut?.(c) ?? false;
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={i === value}
              disabled={out}
              aria-label={out ? `${c.label} · ${soldOutLabel}` : undefined}
              onClick={() => onChange(i)}
              className={`option${tiles ? ' option--tile' : ''}`}
            >
              <span className={`swatch${tiles ? ' swatch--lg' : ''}`} style={{ background: c.swatch }} />
              {c.label}
              {out && <span className="option__soldout">{soldOutLabel}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
