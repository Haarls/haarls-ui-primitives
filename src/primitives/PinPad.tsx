import { useState, type KeyboardEvent, type ReactNode } from 'react';

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
  const pin = value ?? internal;

  function commit(next: string) {
    if (disabled) return;
    const clean = next.replace(/\D/g, '').slice(0, length);
    if (value === undefined) setInternal(clean);
    onChange?.(clean);
    if (clean.length === length && clean !== pin) onComplete(clean);
  }

  function press(key: string) {
    if (key === 'CLR') commit('');
    else if (key === 'DEL') commit(pin.slice(0, -1));
    else if (pin.length < length) commit(pin + key);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (disabled || e.nativeEvent.isComposing) return;
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      press(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      press('DEL');
    } else if (e.key === 'Delete' || e.key === 'Escape') {
      e.preventDefault();
      press('CLR');
    } else if (e.key === 'Enter' && e.target === e.currentTarget && pin.length === length) {
      e.preventDefault();
      onComplete(pin);
    }
  }

  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className="mx-auto w-full max-w-[260px] rounded-2xl border border-white/[0.08] bg-[#0C0C0E] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] focus-visible:border-white/25 focus-visible:outline-none"
    >
      <span className="sr-only" aria-live="polite">
        {pin.length} of {length} digits entered
      </span>

      <div aria-hidden="true" className="mb-4 flex items-center justify-center gap-2.5">
        {Array.from({ length }, (_, idx) => {
          let borderCls = 'border-white/[0.1] text-zinc-100';
          if (error) borderCls = 'border-rose-500/45 text-rose-400';
          else if (idx === pin.length && !disabled) borderCls = 'border-[#4ECDC4] shadow-[0_0_0_3px_rgba(78,205,196,0.12)]';

          let cellContent: ReactNode = null;
          if (pin[idx] && masked) {
            cellContent = <span className={`h-2.5 w-2.5 rounded-full ${error ? 'bg-rose-400' : 'bg-zinc-100'}`} />;
          } else if (pin[idx]) {
            cellContent = pin[idx];
          }

          return (
            <div
              key={idx}
              className={`tabular-nums flex h-12 w-11 items-center justify-center rounded-xl border bg-[#09090B] font-mono text-base font-semibold transition-all ${borderCls}`}
            >
              {cellContent}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="tabular-nums mb-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => {
          const isAction = key === 'CLR' || key === 'DEL';
          let keyLabel = `Digit ${key}`;
          if (key === 'CLR') keyLabel = 'Clear PIN';
          else if (key === 'DEL') keyLabel = 'Backspace';

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => press(key)}
              aria-label={keyLabel}
              className={`tabular-nums h-11 rounded-xl border border-white/[0.07] bg-white/[0.03] font-mono font-medium transition hover:bg-white/[0.08] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${
                isAction ? 'text-xs text-zinc-400' : 'text-sm text-zinc-200'
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
