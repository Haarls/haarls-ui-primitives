import { useState } from 'react';
import { CodeBlock } from './CodeBlock.tsx';
import { DEMOS, type DemoTab } from './demo-data.tsx';
import { DemoStage } from './DemoStage.tsx';
import { CloseIcon, InfoIcon, SearchIcon } from './icons.tsx';
import { CommandMenu, ConfirmDialog, type CommandItem } from './primitives/index.ts';

const ABOUT_POINTS = [
  {
    title: '1. Zero-Dependency UI Primitives',
    body: 'Five self-contained React + TypeScript controls built with native WAI-ARIA semantics, keyboard navigation, and strict focus management.',
  },
  {
    title: '2. POS, Fintech & ERP Ready',
    body: 'Engineered for shared registers (PinPad), multi-currency settlement (integer-cent CurrencyInput), and high-density operational ledgers (DataTable).',
  },
  {
    title: '3. Safe Overlays & Shortcuts',
    body: 'CommandMenu binds global Ctrl+K / ⌘K with cyclic selection; ConfirmDialog traps Tab focus and defaults to Cancel for destructive actions.',
  },
] as const;

export function App() {
  const [tab, setTab] = useState<DemoTab>('datatable');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [lastAction, setLastAction] = useState('Idle — press Ctrl+K to open CommandMenu');

  const commands: readonly CommandItem[] = [
    ...DEMOS.map((d, idx) => ({
      id: `go-${d.id}`,
      group: 'Navigate',
      label: `Inspect ${d.label}`,
      shortcut: String(idx + 1),
      onSelect: () => {
        setTab(d.id);
        setLastAction(`Navigated to ${d.label}`);
      },
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
    <div className="min-h-screen bg-[#09090B] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.04),transparent)] text-[#F4F4F5]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:py-10">
        <aside className="w-full lg:sticky lg:top-10 lg:w-60 lg:shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.1] bg-[#111113] font-mono text-xs font-semibold text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              H
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight text-zinc-100">
                Haarls <span className="text-zinc-600">/</span> Primitives
              </div>
              <div className="font-mono text-[11px] text-zinc-500">v1.0 • 0 deps</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <SearchIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <span className="truncate">Search or run command...</span>
            </span>
            <kbd className="ml-2 shrink-0 rounded border border-white/[0.08] bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
              Ctrl K
            </kbd>
          </button>

          <nav
            aria-label="Component primitives"
            className="mt-4 flex gap-1.5 overflow-x-auto pb-1 lg:mt-6 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
          >
            <span className="mb-1.5 hidden px-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500 lg:block">
              Primitives
            </span>
            {DEMOS.map((d) => {
              const active = tab === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setTab(d.id)}
                  className={`relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left font-mono text-xs font-medium transition-colors ${
                    active ? 'bg-white/[0.06] text-zinc-100' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                  }`}
                >
                  <span aria-hidden="true" className={`h-4 w-[2px] rounded-full ${active ? 'bg-[#4ECDC4]' : 'bg-transparent'}`} />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 lg:mt-6">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Last action</div>
            <p className="tabular-nums mt-1 break-words font-mono text-[11px] leading-relaxed text-zinc-400">{lastAction}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{activeDemo.label}</h1>
              <p className="mt-1.5 text-sm text-zinc-400">{activeDemo.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeDemo.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-expanded={aboutOpen}
              onClick={() => setAboutOpen((p) => !p)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                aboutOpen
                  ? 'border-white/[0.18] bg-white/[0.07] text-zinc-100'
                  : 'border-white/[0.08] bg-[#111113] text-zinc-400 hover:border-white/[0.16] hover:text-zinc-200'
              }`}
            >
              <InfoIcon className="h-3.5 w-3.5 text-[#4ECDC4]" />
              <span>About this sandbox</span>
            </button>
          </header>

          {aboutOpen && (
            <section
              aria-label="About this sandbox"
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#111113] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
            >
              <div className="grid gap-4 text-xs leading-relaxed text-zinc-400 md:grid-cols-3">
                {ABOUT_POINTS.map((pt) => (
                  <div key={pt.title}>
                    <p className="font-medium text-zinc-200">{pt.title}</p>
                    <p className="mt-1">{pt.body}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                aria-label="Close sandbox overview"
                onClick={() => setAboutOpen(false)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </section>
          )}

          <DemoStage
            tab={tab}
            label={activeDemo.label}
            onAction={setLastAction}
            onOpenCommand={() => setCmdOpen(true)}
            onOpenDialog={() => setDialogOpen(true)}
          />

          <CodeBlock code={activeDemo.snippet} filename="example.tsx" />
        </main>
      </div>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} items={commands} />
      <ConfirmDialog
        open={dialogOpen}
        variant="danger"
        title="Revoke production key pk_live_09a4?"
        description="Active clients authenticating with pk_live_09a4 will receive HTTP 401 immediately. This operation cannot be undone."
        confirmLabel="Revoke Key"
        onConfirm={() => {
          setDialogOpen(false);
          setLastAction('ConfirmDialog: revoked pk_live_09a4');
        }}
        onCancel={() => {
          setDialogOpen(false);
          setLastAction('ConfirmDialog: cancelled (focus restored)');
        }}
      />
    </div>
  );
}
