import { useId, useMemo, useState, type ReactNode } from 'react';

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
  'rounded border border-line bg-canvas px-2.5 py-1 text-ink hover:border-accent disabled:opacity-40';

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
      : [...data];
    const col = sort ? columns.find((c) => c.key === sort.key) : undefined;
    if (!sort || !col) return filtered;
    return [...filtered].sort((a, b) => {
      const va = col.getValue(a);
      const vb = col.getValue(b);
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, columns, query, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  }

  return (
    <div className="overflow-hidden rounded border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
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
          className="w-60 rounded border border-line bg-canvas px-2.5 py-1 text-xs text-ink placeholder:text-muted"
        />
        <span className="tabular-nums font-mono text-xs text-muted">
          {processed.length} {processed.length === 1 ? 'record' : 'records'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line text-muted">
            <tr>
              {columns.map((col) => {
                const dir = sort?.key === col.key ? sort.dir : null;
                let ariaSort: 'ascending' | 'descending' | 'none' | undefined;
                if (col.sortable) {
                  ariaSort = dir ? ARIA_SORT[dir] : 'none';
                }

                let sortGlyph = '↕';
                if (dir === 'asc') sortGlyph = '↑';
                else if (dir === 'desc') sortGlyph = '↓';

                return (
                  <th
                    key={col.key}
                    aria-sort={ariaSort}
                    className={`px-4 py-2.5 font-medium ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 rounded hover:text-ink"
                      >
                        <span>{col.header}</span>
                        <span aria-hidden="true" className="font-mono text-[10px] text-accent">
                          {sortGlyph}
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
          <tbody className="divide-y divide-line">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 ${col.align === 'right' ? 'text-right' : ''} ${col.numeric ? 'tabular-nums font-mono' : ''}`}
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
      <div className="flex items-center justify-between border-t border-line px-4 py-2 text-xs">
        <span className="tabular-nums font-mono text-muted">
          Page {safePage} of {totalPages}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className={PAGE_BTN}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className={PAGE_BTN}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
