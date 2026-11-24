import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

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

export function CommandMenu({
  items,
  open,
  onOpenChange,
  placeholder = 'Type a command or search...',
}: CommandMenuProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onGlobalKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      previousFocusRef.current?.focus?.();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q) ||
        it.keywords?.some((kw) => kw.toLowerCase().includes(q)),
    );
  }, [items, query]);

  if (!open) return null;

  const clampedIndex = filtered.length > 0 ? Math.min(activeIndex, filtered.length - 1) : -1;
  const activeItem = clampedIndex >= 0 ? filtered[clampedIndex] : undefined;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
    } else if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault();
      setActiveIndex((clampedIndex + 1) % filtered.length);
    } else if (e.key === 'ArrowUp' && filtered.length > 0) {
      e.preventDefault();
      setActiveIndex((clampedIndex - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && activeItem) {
      e.preventDefault();
      activeItem.onSelect();
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-canvas/85 px-4 pt-20"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg overflow-hidden rounded border border-line bg-surface"
      >
        <div className="flex items-center border-b border-line px-3.5 py-2.5">
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeItem ? `${listboxId}-${activeItem.id}` : undefined}
            aria-label="Search commands"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-xs text-muted">
            Esc
          </kbd>
        </div>

        <ul id={listboxId} role="listbox" className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-muted">No matching commands.</li>
          ) : (
            filtered.map((item, idx) => {
              const selected = idx === clampedIndex;
              return (
                <li
                  key={item.id}
                  id={`${listboxId}-${item.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    item.onSelect();
                    onOpenChange(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 text-xs ${
                    selected ? 'bg-canvas text-ink ring-1 ring-accent' : 'text-muted hover:text-ink'
                  }`}
                >
                  <div>
                    <span className="mr-2 font-mono text-[11px] uppercase text-muted">{item.group}</span>
                    <span className="font-medium text-ink">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className="tabular-nums font-mono text-[11px] text-muted">{item.shortcut}</kbd>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
