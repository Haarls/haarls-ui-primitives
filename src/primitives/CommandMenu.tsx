import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { SearchIcon } from '../icons.tsx';

export interface CommandItem {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  keywords?: readonly string[];
  onSelect: () => void;
}

export interface CommandMenuProps {
  items: readonly CommandItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
}

function CommandMenuPanel({
  items,
  onClose,
  placeholder,
}: {
  items: readonly CommandItem[];
  onClose: () => void;
  placeholder: string;
}) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.label, it.group, ...(it.keywords ?? [])].some((v) => v.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const idx = filtered.length > 0 ? Math.min(activeIndex, filtered.length - 1) : -1;
  const current = idx >= 0 ? filtered[idx] : undefined;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault();
      setActiveIndex((idx + 1) % filtered.length);
    } else if (e.key === 'ArrowUp' && filtered.length > 0) {
      e.preventDefault();
      setActiveIndex((idx - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && current) {
      e.preventDefault();
      current.onSelect();
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-20 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-[#111113] shadow-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={current ? `${listboxId}-${current.id}` : undefined}
            aria-label="Search commands"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            Esc
          </kbd>
        </div>

        <ul id={listboxId} role="listbox" className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-xs text-zinc-500">No matching commands.</li>
          ) : (
            filtered.map((item, i) => (
              <li
                key={item.id}
                id={`${listboxId}-${item.id}`}
                role="option"
                aria-selected={i === idx}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                  i === idx ? 'bg-white/[0.07] text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {item.group}
                  </span>
                  <span className="truncate font-medium text-zinc-100">{item.label}</span>
                </div>
                {item.shortcut && (
                  <kbd className="tabular-nums rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    {item.shortcut}
                  </kbd>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export function CommandMenu({
  items,
  open,
  onOpenChange,
  placeholder = 'Type a command or search...',
}: CommandMenuProps) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return <CommandMenuPanel items={items} onClose={() => onOpenChange(false)} placeholder={placeholder} />;
}
