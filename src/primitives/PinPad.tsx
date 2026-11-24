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
  length = 4,
  value,
  onChange,
  onComplete,
  error = null,
  masked = true,
  disabled = false,
  label = 'Security PIN entry',
}: PinPadProps) {
  const [internal, setInternal] = useState('');
  const pin = value !== undefined ? value : internal;

  const commit = (next: string) => {
    if (disabled) return;
    const sanitized = next.replace(/\D/g, '').slice(0, length);
    if (value === undefined) setInternal(sanitized);
    onChange?.(sanitized);
    if (sanitized.length === length && sanitized !== pin) {
      onComplete(sanitized);
    }
  };

  const applyKey = (key: string) => {
    if (key === 'CLR') commit('');
    else if (key === 'DEL') commit(pin.slice(0, -1));
    else if (pin.length < length) commit(pin + key);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      applyKey(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      applyKey('DEL');
    } else if (e.key === 'Delete' || e.key === 'Escape') {
      e.preventDefault();
      applyKey('CLR');
    } else if (e.key === 'Enter' && e.target === e.currentTarget && pin.length === length) {
      e.preventDefault();
      onComplete(pin);
    }
  };

  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className="w-full max-w-xs rounded border border-line bg-surface p-4"
    >
      <span className="sr-only" aria-live="polite">
        {pin.length} of {length} digits entered
      </span>

      <div aria-hidden="true" className="mb-4 grid grid-cols-6 gap-2">
        {Array.from({ length }, (_, idx) => {
          const char = pin[idx];
          const isNext = idx === pin.length && !disabled;
          return (
            <div
              key={idx}
              style={{ gridColumn: length === 4 ? 'span 1' : undefined }}
              className={`tabular-nums flex h-11 items-center justify-center rounded border bg-canvas font-mono text-base font-semibold ${
                error
                  ? 'border-danger text-danger'
                  : isNext
                    ? 'border-accent text-ink'
                    : 'border-line text-ink'
              } ${length === 4 && idx === 0 ? 'col-start-2' : ''}`}
            >
              {char ? (masked ? '•' : char) : ''}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="tabular-nums mb-3 rounded border border-danger/40 bg-canvas px-2.5 py-1.5 text-center text-xs text-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => {
          const isAction = key === 'CLR' || key === 'DEL';
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-label={key === 'CLR' ? 'Clear PIN' : key === 'DEL' ? 'Backspace' : `Digit ${key}`}
              onClick={() => applyKey(key)}
              className={`tabular-nums h-10 rounded border border-line bg-canvas font-mono text-xs font-medium transition-colors hover:border-accent disabled:opacity-40 ${
                isAction ? 'text-muted' : 'text-ink text-sm'
              }`}
            >
              {key === 'DEL' ? '⌫' : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
