import { useId } from 'react';

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

const DECIMAL_PATTERN = /^\d*(\.\d{0,2})?$/;

const formatMoney = (n: number): string =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export function convertUsdToQuote(usdText: string, rate: number): number {
  const numeric = Number(usdText);
  if (!usdText || !Number.isFinite(numeric) || !Number.isFinite(rate) || rate <= 0) return 0;
  // Scale via integer cents first so binary float multiplication cannot drift by 0.01.
  return Math.round(Math.round(numeric * 100) * rate) / 100;
}

export function CurrencyInput({
  label,
  valueUsd,
  onChangeUsd,
  quoteCurrency,
  exchangeRate,
  currencies,
  onCurrencyChange,
  onRateChange,
}: CurrencyInputProps) {
  const inputId = useId();
  const rateId = useId();
  const currencyId = useId();

  const converted = convertUsdToQuote(valueUsd, exchangeRate);

  const handleAmountChange = (raw: string) => {
    const cleaned = raw.replace(/,/g, '').trim();
    if (!DECIMAL_PATTERN.test(cleaned)) return;
    const normalized = cleaned.startsWith('.') ? `0${cleaned}` : cleaned;
    onChangeUsd(normalized, convertUsdToQuote(normalized, exchangeRate));
  };

  return (
    <div className="w-full max-w-md rounded border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
        </label>
        <span className="tabular-nums font-mono text-xs text-muted">
          1 USD = {exchangeRate.toFixed(2)} {quoteCurrency}
        </span>
      </div>

      <div className="mt-2 flex items-center rounded border border-line bg-canvas px-3 py-2 focus-within:border-accent">
        <span className="mr-2 font-mono text-xs text-muted">USD</span>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={valueUsd}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0.00"
          className="tabular-nums w-full bg-transparent font-mono text-base text-ink focus:outline-none"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
        <div>
          <label htmlFor={currencyId} className="block text-xs text-muted">
            Quote Currency
          </label>
          {currencies && onCurrencyChange ? (
            <select
              id={currencyId}
              value={quoteCurrency}
              onChange={(e) => {
                const match = currencies.find((c) => c.code === e.target.value);
                if (match) onCurrencyChange(match.code, match.rate);
              }}
              className="mt-1 w-full rounded border border-line bg-canvas px-2.5 py-1.5 font-mono text-xs text-ink"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-1 rounded border border-line bg-canvas px-2.5 py-1.5 font-mono text-xs text-ink">
              {quoteCurrency}
            </div>
          )}
        </div>

        <div>
          <label htmlFor={rateId} className="block text-xs text-muted">
            Exchange Rate
          </label>
          <input
            id={rateId}
            type="number"
            step="0.01"
            min="0.0001"
            disabled={!onRateChange}
            value={exchangeRate}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next) && next > 0) onRateChange?.(next);
            }}
            className="tabular-nums mt-1 w-full rounded border border-line bg-canvas px-2.5 py-1.5 font-mono text-xs text-ink disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between rounded border border-line bg-canvas px-3 py-2">
        <span className="text-xs text-muted">Converted Total</span>
        <output htmlFor={`${inputId} ${rateId}`} className="tabular-nums font-mono text-sm font-semibold text-ink">
          {formatMoney(converted)} {quoteCurrency}
        </output>
      </div>
    </div>
  );
}
