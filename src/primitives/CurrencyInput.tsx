import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { CheckIcon, ChevronDownIcon } from '../icons.tsx';

export interface CurrencyRateOption {
  code: string;
  rate: number;
}

export interface CurrencyInputProps {
  label: string;
  valueUsd: string;
  onChangeUsd: (usdText: string, convertedAmount: number) => void;
  quoteCurrency: string;
  exchangeRate: number;
  currencies?: readonly CurrencyRateOption[];
  onCurrencyChange?: (code: string, rate: number) => void;
  onRateChange?: (rate: number) => void;
}

const DECIMAL_RE = /^\d*(\.\d{0,2})?$/;
const MONEY_FMT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function convertUsdToQuote(usdText: string, rate: number): number {
  const num = Number(usdText);
  if (!usdText || !Number.isFinite(num) || !Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round(Math.round(num * 100) * rate) / 100;
}

export function CurrencyInput({
  label, valueUsd, onChangeUsd, quoteCurrency, exchangeRate, currencies, onCurrencyChange, onRateChange,
}: CurrencyInputProps) {
  const inputId = useId();
  const rateId = useId();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const converted = convertUsdToQuote(valueUsd, exchangeRate);
  const selectedIdx = currencies ? Math.max(0, currencies.findIndex((c) => c.code === quoteCurrency)) : 0;

  function openMenu() {
    setMenuOpen(true);
    requestAnimationFrame(() => (listRef.current?.children[selectedIdx] as HTMLButtonElement | undefined)?.focus());
  }

  function handleMenuKeys(e: KeyboardEvent<HTMLDivElement>) {
    if (!currencies?.length) return;
    if (!menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!menuOpen) return;

    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const cur = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setMenuOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(cur + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(cur - 1 + items.length) % items.length]?.focus();
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C0C0E] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-400">{label}</label>
        <span className="font-mono text-[11px] text-zinc-500">Base USD</span>
      </div>

      <div className="relative mt-2 flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#09090B] px-3.5 py-2.5 transition-colors focus-within:border-white/25">
        <span className="select-none font-mono text-base font-medium text-zinc-500">$</span>
        <input
          id={inputId} type="text" inputMode="decimal" value={valueUsd} placeholder="0.00"
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '').trim();
            if (!DECIMAL_RE.test(raw)) return;
            const norm = raw.startsWith('.') ? `0${raw}` : raw;
            onChangeUsd(norm, convertUsdToQuote(norm, exchangeRate));
          }}
          className="tabular-nums w-full bg-transparent text-xl font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />

        {currencies && onCurrencyChange ? (
          <div className="relative shrink-0" onKeyDown={handleMenuKeys} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setMenuOpen(false); }}>
            <button
              ref={triggerRef} type="button" role="combobox" aria-label="Quote currency"
              aria-expanded={menuOpen} aria-haspopup="listbox" aria-controls={listboxId}
              onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.04] px-2.5 font-mono text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.08]"
            >
              <span>{quoteCurrency}</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${menuOpen ? 'rotate-180 text-zinc-200' : ''}`} />
            </button>

            {menuOpen && (
              <div ref={listRef} id={listboxId} role="listbox" aria-label="Quote currencies" className="absolute right-0 top-full z-30 mt-1.5 min-w-[152px] rounded-xl border border-white/[0.1] bg-[#161618] p-1 shadow-2xl">
                {currencies.map((item) => (
                  <button
                    key={item.code} type="button" role="option" aria-selected={item.code === quoteCurrency}
                    onClick={() => {
                      onCurrencyChange(item.code, item.rate);
                      setMenuOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-zinc-100 focus:bg-white/[0.07] focus:text-zinc-100 focus:outline-none"
                  >
                    <span>{item.code}</span>
                    <span className="tabular-nums inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <span>{item.rate.toFixed(2)}</span>
                      {item.code === quoteCurrency && <CheckIcon className="h-3.5 w-3.5 text-[#4ECDC4]" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-zinc-300">{quoteCurrency}</span>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3.5 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <label htmlFor={rateId}>Rate</label>
          <input
            id={rateId} type="number" step="0.01" min="0.0001" disabled={!onRateChange} value={exchangeRate}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next) && next > 0) onRateChange?.(next);
            }}
            className="tabular-nums h-7 w-20 rounded-lg border border-white/[0.08] bg-[#09090B] px-2 text-right font-mono text-xs text-zinc-200 focus:border-white/25 focus:outline-none disabled:opacity-60"
          />
          <span className="font-mono text-[11px] text-zinc-500">{quoteCurrency}/USD</span>
        </div>
        <output htmlFor={`${inputId} ${rateId}`} className="tabular-nums font-mono text-sm font-semibold text-zinc-100">
          {MONEY_FMT.format(converted)} {quoteCurrency}
        </output>
      </div>
    </div>
  );
}
