import { useState, type ReactNode } from 'react';
import { CheckIcon, CopyIcon } from './icons.tsx';

interface CodeBlockProps {
  code: string;
  filename?: string;
}

const TOKEN_RE =
  /(\/\/[^\n]*|`[^`]*`|'[^']*'|"[^"]*"|<\/?[A-Z][\w.]*|\b(?:const|let|return|true|false|null)\b|\b[a-zA-Z_]\w*(?==)|\b\d+(?:\.\d+)?\b|[<>={}[\]().,:;+-]+)/g;

function highlightLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      nodes.push(line.slice(lastIndex, idx));
    }

    const token = match[0];
    let cls = 'text-zinc-300';

    if (token.startsWith('//')) {
      cls = 'text-zinc-500';
    } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
      cls = 'text-amber-300/90';
    } else if (token.startsWith('<')) {
      const bracket = token.startsWith('</') ? '</' : '<';
      nodes.push(
        <span key={`${idx}-br`} className="text-zinc-500">
          {bracket}
        </span>,
      );
      nodes.push(
        <span key={`${idx}-tag`} className="text-[#4ECDC4]">
          {token.slice(bracket.length)}
        </span>,
      );
      lastIndex = idx + token.length;
      continue;
    } else if (/^(?:const|let|return|true|false|null)$/.test(token)) {
      cls = 'text-zinc-400';
    } else if (/^\d/.test(token)) {
      cls = 'text-emerald-300/90';
    } else if (/^[<>={}[\]().,:;+-]+$/.test(token)) {
      cls = 'text-zinc-500';
    }

    nodes.push(
      <span key={idx} className={cls}>
        {token}
      </span>,
    );
    lastIndex = idx + token.length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }
  return nodes;
}

export function CodeBlock({ code, filename = 'example.tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/[0.14]" aria-hidden="true" />
          <span className="font-mono text-xs text-zinc-400">{filename}</span>
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-zinc-100"
        >
          {copied ? (
            <CheckIcon className="h-3.5 w-3.5 text-[#4ECDC4]" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5 text-zinc-400" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-zinc-200">
        <code className="block">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span
                aria-hidden="true"
                className="tabular-nums w-7 shrink-0 select-none pr-3.5 text-right text-[11px] text-zinc-600"
              >
                {i + 1}
              </span>
              <span className="whitespace-pre">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
