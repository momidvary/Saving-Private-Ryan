"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function Tick({ checked, onChange, children, note }: { checked: boolean; onChange: (on: boolean) => void; children: ReactNode; note?: ReactNode }) {
  return (
    <label className="tick">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="dot">
        <Check size={18} strokeWidth={3.5} />
      </span>
      <span className="label min-w-0 flex-1">
        {children}
        {note ? <span className="block text-xs text-muted no-underline">{note}</span> : null}
      </span>
    </label>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((100 * value) / max) : 0;
  return (
    <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 pt-2">
      <h1 className="display text-3xl leading-tight">{children}</h1>
      {sub ? <p className="text-muted">{sub}</p> : null}
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="display text-2xl leading-snug pt-2">{children}</h2>;
}

export function Phone({ n }: { n: string }) {
  return <span className="num font-bold select-all">{n}</span>;
}
