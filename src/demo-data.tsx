import type { ColumnDef } from './primitives/index.ts';

export interface LedgerRow {
  id: string;
  terminal: string;
  operator: string;
  amountUsd: number;
  latencyMs: number;
  status: 'SETTLED' | 'PENDING' | 'REJECTED';
}

export const SAMPLE_LEDGER: readonly LedgerRow[] = [
  {
    id: 'TX-9041',
    terminal: 'POS-01',
    operator: 'c.almonte',
    amountUsd: 420.5,
    latencyMs: 18,
    status: 'SETTLED',
  },
  {
    id: 'TX-9042',
    terminal: 'POS-03',
    operator: 'e.vance',
    amountUsd: 89.99,
    latencyMs: 24,
    status: 'SETTLED',
  },
  {
    id: 'TX-9043',
    terminal: 'POS-02',
    operator: 'm.silva',
    amountUsd: 1250.0,
    latencyMs: 41,
    status: 'PENDING',
  },
  {
    id: 'TX-9044',
    terminal: 'POS-01',
    operator: 'c.almonte',
    amountUsd: 19.5,
    latencyMs: 15,
    status: 'SETTLED',
  },
  {
    id: 'TX-9045',
    terminal: 'POS-04',
    operator: 'r.gomez',
    amountUsd: 310.25,
    latencyMs: 92,
    status: 'REJECTED',
  },
  {
    id: 'TX-9046',
    terminal: 'POS-02',
    operator: 'e.vance',
    amountUsd: 640.0,
    latencyMs: 22,
    status: 'SETTLED',
  },
  {
    id: 'TX-9047',
    terminal: 'POS-03',
    operator: 'm.silva',
    amountUsd: 54.75,
    latencyMs: 19,
    status: 'SETTLED',
  },
];

export const CURRENCIES = [
  { code: 'VES', rate: 42.85 },
  { code: 'EUR', rate: 0.92 },
  { code: 'COP', rate: 4120.0 },
  { code: 'MXN', rate: 20.15 },
] as const;

export type DemoTab = 'datatable' | 'pinpad' | 'currency' | 'command' | 'dialog';

export const DEMOS: ReadonlyArray<{ id: DemoTab; label: string; snippet: string }> = [
  {
    id: 'datatable',
    label: 'DataTable<T>',
    snippet: `<DataTable<LedgerRow>
  data={rows}
  rowKey={(r) => r.id}
  pageSize={5}
  columns={[
    { key: 'id', header: 'TX ID', sortable: true, numeric: true, getValue: (r) => r.id },
    {
      key: 'amount', header: 'USD', sortable: true, align: 'right', numeric: true,
      getValue: (r) => r.amountUsd, render: (r) => \`$\${r.amountUsd.toFixed(2)}\`,
    },
  ]}
/>`,
  },
  {
    id: 'pinpad',
    label: 'PinPad',
    snippet: `<PinPad
  length={4}
  value={pin}
  onChange={setPin}
  error={pinError}
  onComplete={(code) => verifyOperatorPin(code)}
/>`,
  },
  {
    id: 'currency',
    label: 'CurrencyInput',
    snippet: `<CurrencyInput
  label="Settlement Amount"
  valueUsd={amountUsd}
  onChangeUsd={(usd) => setAmountUsd(usd)}
  quoteCurrency={currency}
  exchangeRate={rate}
  currencies={CURRENCIES}
  onCurrencyChange={(code, nextRate) => { setCurrency(code); setRate(nextRate); }}
  onRateChange={setRate}
/>`,
  },
  {
    id: 'command',
    label: 'CommandMenu',
    snippet: `<CommandMenu
  open={cmdOpen}
  onOpenChange={setCmdOpen}
  items={[
    { id: 'pin', group: 'Navigate', label: 'Open PinPad demo', shortcut: '2', onSelect: () => setTab('pinpad') },
    { id: 'revoke', group: 'Operations', label: 'Revoke Key...', onSelect: () => setDialogOpen(true) },
  ]}
/>`,
  },
  {
    id: 'dialog',
    label: 'ConfirmDialog',
    snippet: `<ConfirmDialog
  open={dialogOpen}
  variant="danger"
  title="Revoke production key?"
  description="Active clients will receive HTTP 401 immediately."
  confirmLabel="Revoke Key"
  onConfirm={handleRevoke}
  onCancel={() => setDialogOpen(false)}
/>`,
  },
];

const STATUS_TONE = { SETTLED: 'text-ok', PENDING: 'text-warn', REJECTED: 'text-danger' } as const;

export const LEDGER_COLUMNS: readonly ColumnDef<LedgerRow>[] = [
  { key: 'id', header: 'TX ID', sortable: true, numeric: true, getValue: (r) => r.id },
  {
    key: 'terminal',
    header: 'Terminal',
    sortable: true,
    numeric: true,
    getValue: (r) => r.terminal,
  },
  { key: 'operator', header: 'Operator', sortable: true, getValue: (r) => r.operator },
  {
    key: 'amount',
    header: 'Amount (USD)',
    sortable: true,
    align: 'right',
    numeric: true,
    getValue: (r) => r.amountUsd,
    render: (r) => `$${r.amountUsd.toFixed(2)}`,
  },
  {
    key: 'latency',
    header: 'Latency',
    sortable: true,
    align: 'right',
    numeric: true,
    getValue: (r) => r.latencyMs,
    render: (r) => `${r.latencyMs} ms`,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    align: 'right',
    getValue: (r) => r.status,
    render: (r) => <span className={`font-mono ${STATUS_TONE[r.status]}`}>{r.status}</span>,
  },
];
