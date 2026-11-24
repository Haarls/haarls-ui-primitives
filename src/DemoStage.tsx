import { useState } from 'react';
import { CURRENCIES, LEDGER_COLUMNS, SAMPLE_LEDGER, type DemoTab } from './demo-data.tsx';
import { CheckIcon } from './icons.tsx';
import { CurrencyInput, DataTable, PinPad } from './primitives/index.ts';

interface DemoStageProps {
  tab: DemoTab;
  label: string;
  onAction: (message: string) => void;
  onOpenCommand: () => void;
  onOpenDialog: () => void;
}

export function DemoStage({ tab, label, onAction, onOpenCommand, onOpenDialog }: DemoStageProps) {
  const [pin, setPin] = useState('');
  const [pinStatus, setPinStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [usd, setUsd] = useState('19.99');
  const [quoteCurrency, setQuoteCurrency] = useState('VES');
  const [rate, setRate] = useState(42.85);

  return (
    <section
      aria-label={`${label} interactive stage`}
      className="flex min-h-[320px] items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111113] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-12"
    >
      {tab === 'datatable' && (
        <div className="w-full">
          <DataTable
            data={SAMPLE_LEDGER}
            columns={LEDGER_COLUMNS}
            rowKey={(r) => r.id}
            pageSize={5}
            searchPlaceholder="Filter TX ID, terminal, operator..."
          />
        </div>
      )}

      {tab === 'pinpad' && (
        <div className="w-full space-y-3 text-center">
          <p className="text-xs text-zinc-400">
            Demo passkey: <code className="font-mono text-zinc-200">1042</code> (keyboard or keypad)
          </p>
          <PinPad
            length={4}
            value={pin}
            onChange={(next) => {
              setPin(next);
              if (pinStatus && !pinStatus.ok) setPinStatus(null);
            }}
            error={pinStatus && !pinStatus.ok ? pinStatus.text : null}
            onComplete={(entered) => {
              if (entered === '1042') {
                setPinStatus({ ok: true, text: 'PIN 1042 verified' });
                onAction('PinPad: authenticated PIN 1042');
              } else {
                setPinStatus({ ok: false, text: 'Invalid PIN. Expected 1042.' });
                setPin('');
                onAction(`PinPad: rejected PIN ${entered}`);
              }
            }}
          />
          {pinStatus?.ok && (
            <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400">
              <CheckIcon className="h-3.5 w-3.5" />
              <span>{pinStatus.text}</span>
            </p>
          )}
        </div>
      )}

      {tab === 'currency' && (
        <CurrencyInput
          label="Settlement Amount"
          valueUsd={usd}
          quoteCurrency={quoteCurrency}
          exchangeRate={rate}
          currencies={CURRENCIES}
          onChangeUsd={(nextUsd, converted) => {
            setUsd(nextUsd);
            onAction(`CurrencyInput: $${nextUsd || '0'} -> ${converted.toFixed(2)} ${quoteCurrency}`);
          }}
          onCurrencyChange={(code, defaultRate) => {
            setQuoteCurrency(code);
            setRate(defaultRate);
            onAction(`CurrencyInput: switched quote to ${code} (${defaultRate})`);
          }}
          onRateChange={(nextRate) => {
            setRate(nextRate);
            onAction(`CurrencyInput: rate set to ${nextRate} ${quoteCurrency}/USD`);
          }}
        />
      )}

      {tab === 'command' && (
        <div className="max-w-sm text-center">
          <p className="text-xs leading-relaxed text-zinc-400">
            Press <kbd className="font-mono text-zinc-200">Ctrl+K</kbd> / <kbd className="font-mono text-zinc-200">⌘K</kbd>{' '}
            anywhere in the document, or open the palette directly below.
          </p>
          <button
            type="button"
            onClick={onOpenCommand}
            className="mt-4 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 transition-colors hover:bg-white"
          >
            Open CommandMenu
          </button>
        </div>
      )}

      {tab === 'dialog' && (
        <div className="max-w-sm text-center">
          <p className="text-xs leading-relaxed text-zinc-400">
            Opens a focus-trapped <code className="font-mono text-zinc-200">alertdialog</code> defaulting initial focus to Cancel
            and restoring trigger focus on close.
          </p>
          <button
            type="button"
            onClick={onOpenDialog}
            className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/15 px-4 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/25"
          >
            Revoke Production Key...
          </button>
        </div>
      )}
    </section>
  );
}
