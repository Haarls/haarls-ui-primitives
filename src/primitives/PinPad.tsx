import { useState, type KeyboardEvent } from 'react';

export interface PinPadProps {
  length?: 4 | 5 | 6;
  value?: string;
  onChange?: (pin: string) => void;
  onComplete: (pin: string) => void;
  error?: string | null;
  masked?: boolean;
  disabled?: boolean;
  label?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'] as const;

export function PinPad({
  length = 4, value, onChange, onComplete, error = null, masked = true, disabled = false, label = 'Security PIN entry',
}: PinPadProps) {
  const [internal, setInternal] = useState('');
  const pin = value ?? internal;

  const commit = (next: string) => {
    if (disabled) return;
    const clean = next.replace(/\D/g, '').slice(0, length);
    if (value === undefined) setInternal(clean);
    onChange?.(clean);
    if (clean.length === length && clean !== pin) onComplete(clean);
  };

  const press = (key: string) =>
    key === 'CLR' ? commit('') : key === 'DEL' ? commit(pin.slice(0, -1)) : pin.length < length && commit(pin + key);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (/^\d$/.test(e.key)) (e.preventDefault(), press(e.key));
    else if (e.key === 'Backspace') (e.preventDefault(), press('DEL'));
    else if (e.key === 'Delete' || e.key === 'Escape') (e.preventDefault(), press('CLR'));
    else if (e.key === 'Enter' && e.target === e.currentTarget && pin.length === length) (e.preventDefault(), onComplete(pin));
  };

  return (
    <div role="group" aria-label={label} tabIndex={disabled ? -1 : 0} onKeyDown={handleKeyDown} className="w-full max-w-xs rounded border border-line bg-surface p-4">
      <span className="sr-only" aria-live="polite">{pin.length} of {length} digits entered</span>
      <div aria-hidden="true" className="mb-4 grid grid-cols-6 gap-2">
        {Array.from({ length }, (_, idx) => {
          const borderCls = error ? 'border-danger text-danger' : idx === pin.length && !disabled ? 'border-accent text-ink' : 'border-line text-ink';
          return (
            <div key={idx} className={`tabular-nums flex h-11 items-center justify-center rounded border bg-canvas font-mono text-base font-semibold ${borderCls} ${length === 4 && idx === 0 ? 'col-start-2' : ''}`}>
              {pin[idx] ? (masked ? '•' : pin[idx]) : ''}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="tabular-nums mb-3 rounded border border-danger/40 bg-canvas px-2.5 py-1.5 text-center text-xs text-danger">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key} type="button" disabled={disabled} onClick={() => press(key)}
            aria-label={key === 'CLR' ? 'Clear PIN' : key === 'DEL' ? 'Backspace' : `Digit ${key}`}
            className={`tabular-nums h-10 rounded border border-line bg-canvas font-mono font-medium transition-colors hover:border-accent disabled:opacity-40 ${key === 'CLR' || key === 'DEL' ? 'text-xs text-muted' : 'text-sm text-ink'}`}
          >
            {key === 'DEL' ? '⌫' : key}
          </button>
        ))}
      </div>
    </div>
  );
}
