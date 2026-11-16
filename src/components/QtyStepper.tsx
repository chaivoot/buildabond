interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: 'md' | 'sm';
  decLabel?: string;
  incLabel?: string;
}

export function QtyStepper({ value, onChange, min = 1, max = 9, size = 'md', decLabel = 'ลดจำนวน', incLabel = 'เพิ่มจำนวน' }: Props) {
  return (
    <div className={`stepper${size === 'sm' ? ' stepper--sm' : ''}`}>
      <button type="button" aria-label={decLabel} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="stepper__value" aria-live="polite">{value}</span>
      <button type="button" aria-label={incLabel} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}
