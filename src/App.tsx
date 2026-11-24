import { useState } from 'react';
import { CURRENCIES, DEMOS, LEDGER_COLUMNS, SAMPLE_LEDGER, type DemoTab } from './demo-data.tsx';
import {
  CommandMenu,
  ConfirmDialog,
  CurrencyInput,
  DataTable,
  PinPad,
  type CommandItem,
} from './primitives/index.ts';

export function App() {
  const [tab, setTab] = useState<DemoTab>('datatable');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastAction, setLastAction] = useState(
    'Ready. Press Ctrl+K / ⌘K anywhere to open CommandMenu.',
  );
  const [pin, setPin] = useState('');
  const [pinStatus, setPinStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [usd, setUsd] = useState('19.99');
  const [quoteCurrency, setQuoteCurrency] = useState('VES');
  const [rate, setRate] = useState(42.85);

  const commands: readonly CommandItem[] = [
    ...DEMOS.slice(0, 4).map((d, idx) => ({
      id: `go-${d.id}`,
      group: 'Navigate',
      label: `Open ${d.label} demo`,
      shortcut: String(idx + 1),
      onSelect: () => setTab(d.id),
    })),
    {
      id: 'act-revoke',
      group: 'Operations',
      label: 'Trigger Destructive ConfirmDialog',
      keywords: ['delete', 'revoke', 'modal', 'focus trap'],
      onSelect: () => {
        setTab('dialog');
        setDialogOpen(true);
      },
    },
  ];

  const activeDemo = DEMOS.find((d) => d.id === tab) ?? DEMOS[0]!;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-sm font-semibold tracking-tight text-ink">
              haarls-ui-primitives
            </h1>
            <span className="rounded border border-line bg-canvas px-2 py-0.5 font-mono text-xs text-muted">
              0 UI deps · WAI-ARIA
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="inline-flex items-center gap-3 rounded border border-line bg-canvas px-3 py-1.5 text-xs text-muted hover:border-accent hover:text-ink"
          >
            <span>Command Palette</span>
            <kbd className="font-mono text-[11px] text-ink">Ctrl K</kbd>
          </button>
        </div>
        <nav
          aria-label="Component primitives"
          className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 text-xs font-medium"
        >
          {DEMOS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setTab(d.id)}
              className={`whitespace-nowrap border-b-2 py-2.5 font-mono transition-colors ${tab === d.id ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}`}
            >
              {d.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between rounded border border-line bg-surface px-4 py-2 text-xs">
          <span className="font-mono text-muted">Event Log</span>
          <span className="tabular-nums font-mono text-ink">{lastAction}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7">
            {tab === 'datatable' && (
              <DataTable
                data={SAMPLE_LEDGER}
                columns={LEDGER_COLUMNS}
                rowKey={(r) => r.id}
                pageSize={5}
                searchPlaceholder="Filter TX ID, terminal, operator..."
              />
            )}
            {tab === 'pinpad' && (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  Try PIN <code className="font-mono text-ink">1042</code> (physical keyboard
                  digits, Backspace, Escape, or pad clicks).
                </p>
                <PinPad
                  length={4}
                  value={pin}
                  onChange={(next) => {
                    setPin(next);
                    if (pinStatus && !pinStatus.ok) {
                      setPinStatus(null);
                    }
                  }}
                  error={pinStatus && !pinStatus.ok ? pinStatus.text : null}
                  onComplete={(entered) => {
                    if (entered === '1042') {
                      setPinStatus({ ok: true, text: 'PIN 1042 verified.' });
                      setLastAction('PinPad: authenticated operator PIN 1042');
                    } else {
                      setPinStatus({ ok: false, text: 'Invalid PIN. Expected 1042.' });
                      setPin('');
                      setLastAction(`PinPad: rejected PIN ${entered}`);
                    }
                  }}
                />
                {pinStatus?.ok && <p className="font-mono text-xs text-ok">{pinStatus.text}</p>}
              </div>
            )}
            {tab === 'currency' && (
              <CurrencyInput
                label="Settlement Amount (Base USD)"
                valueUsd={usd}
                quoteCurrency={quoteCurrency}
                exchangeRate={rate}
                currencies={CURRENCIES}
                onChangeUsd={(nextUsd, converted) => {
                  setUsd(nextUsd);
                  setLastAction(
                    `CurrencyInput: $${nextUsd || '0'} USD -> ${converted.toFixed(2)} ${quoteCurrency}`,
                  );
                }}
                onCurrencyChange={(code, defaultRate) => {
                  setQuoteCurrency(code);
                  setRate(defaultRate);
                }}
                onRateChange={setRate}
              />
            )}
            {tab === 'command' && (
              <div className="rounded border border-line bg-surface p-5">
                <h2 className="text-sm font-semibold text-ink">Global Command Palette</h2>
                <p className="mt-1.5 text-xs text-muted">
                  Listens globally for <code className="font-mono text-ink">Ctrl+K</code> /{' '}
                  <code className="font-mono text-ink">⌘K</code>, supports instant keyword
                  filtering, cyclic arrow selection,{' '}
                  <code className="font-mono text-ink">Enter</code> execution, and restores trigger
                  focus on close.
                </p>
                <button
                  type="button"
                  onClick={() => setCmdOpen(true)}
                  className="mt-4 rounded bg-accent px-3.5 py-1.5 text-xs font-semibold text-canvas hover:opacity-90"
                >
                  Open CommandMenu
                </button>
              </div>
            )}
            {tab === 'dialog' && (
              <div className="rounded border border-line bg-surface p-5">
                <h2 className="text-sm font-semibold text-ink">Focus-Trapped ConfirmDialog</h2>
                <p className="mt-1.5 text-xs text-muted">
                  Traps <code className="font-mono text-ink">Tab</code> and{' '}
                  <code className="font-mono text-ink">Shift+Tab</code> inside the modal, defaults
                  initial focus to Cancel, closes on{' '}
                  <code className="font-mono text-ink">Escape</code>, and restores focus to the
                  trigger button upon dismissal.
                </p>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="mt-4 rounded border border-danger/50 bg-canvas px-3.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  Revoke Production Key...
                </button>
              </div>
            )}
          </section>

          <aside className="lg:col-span-5">
            <div className="rounded border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="font-mono text-xs font-medium text-muted">Usage Contract</span>
                <span className="font-mono text-[11px] text-muted">TypeScript · Strict</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink">
                <code>{activeDemo.snippet}</code>
              </pre>
            </div>
          </aside>
        </div>
      </main>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} items={commands} />
      <ConfirmDialog
        open={dialogOpen}
        variant="danger"
        title="Revoke production key pk_live_09a4?"
        description="Active clients authenticating with pk_live_09a4 will receive HTTP 401 immediately. This operation cannot be undone."
        confirmLabel="Revoke Key"
        onConfirm={() => {
          setDialogOpen(false);
          setLastAction('ConfirmDialog: confirmed revocation of pk_live_09a4');
        }}
        onCancel={() => {
          setDialogOpen(false);
          setLastAction('ConfirmDialog: cancelled (focus returned to trigger)');
        }}
      />
    </div>
  );
}
