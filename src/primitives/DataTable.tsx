import { useId, useMemo, useState, type ReactNode } from 'react';
import { SearchIcon } from '../icons.tsx';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  numeric?: boolean;
  getValue: (row: T) => string | number;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: readonly T[];
  columns: readonly ColumnDef<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;
const PAGE_BTN =
  'h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40';

export function DataTable<T>({
  data,
  columns,
  rowKey,
  pageSize = 5,
  searchPlaceholder = 'Filter rows...',
  emptyMessage = 'No matching records.',
}: DataTableProps<T>) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);

  const processed = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((r) => columns.some((c) => String(c.getValue(r)).toLowerCase().includes(q)))
      : data;
    const col = sort ? columns.find((c) => c.key === sort.key) : undefined;
    if (!sort || !col) return filtered;

    return filtered.toSorted((a, b) => {
      const va = col.getValue(a);
      const vb = col.getValue(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, columns, query, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]">
      <div className="flex flex-col gap-2.5 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-lg border border-white/[0.08] bg-[#09090B] pl-8 pr-3 text-xs text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-white/25 focus:outline-none"
          />
        </div>
        <span className="tabular-nums font-mono text-xs text-zinc-500">
          {processed.length} {processed.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/[0.06] bg-white/[0.015] text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              {columns.map((col) => {
                const dir = sort?.key === col.key ? sort.dir : null;
                let glyph = '↕';
                if (dir === 'asc') glyph = '↑';
                else if (dir === 'desc') glyph = '↓';

                return (
                  <th
                    key={col.key}
                    aria-sort={col.sortable ? (dir ? ARIA_SORT[dir] : 'none') : undefined}
                    className={`whitespace-nowrap px-4 py-2.5 font-medium ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSort((p) =>
                            p?.key === col.key
                              ? { key: col.key, dir: p.dir === 'asc' ? 'desc' : 'asc' }
                              : { key: col.key, dir: 'asc' },
                          )
                        }
                        className="inline-flex items-center gap-1 rounded uppercase tracking-wider transition-colors hover:text-zinc-200"
                      >
                        <span>{col.header}</span>
                        <span aria-hidden="true" className={`font-mono text-[10px] ${dir ? 'text-[#4ECDC4]' : 'text-zinc-600'}`}>
                          {glyph}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-3 text-zinc-200 ${col.align === 'right' ? 'text-right' : ''} ${col.numeric ? 'tabular-nums font-mono' : ''}`}
                    >
                      {col.render ? col.render(row) : String(col.getValue(row))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-xs">
        <span className="tabular-nums font-mono text-zinc-500">
          Page {safePage} of {totalPages}
        </span>
        <div className="flex gap-1.5">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className={PAGE_BTN}>
            Prev
          </button>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className={PAGE_BTN}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
