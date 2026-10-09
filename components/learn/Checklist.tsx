"use client";

import { useApp } from "@/lib/store";
import { fa } from "@/lib/jalali";
import { BIRTH_LISTS } from "@/content/lists";
import { Tick } from "@/components/ui";

export default function Checklist() {
  const { data, toggleCheck } = useApp();
  return (
    <>
      <p className="text-muted">هر چیزی که آماده شد تیک بزنید. تیک‌ها بین بابا و مامان مشترکه.</p>
      {BIRTH_LISTS.map((g) => {
        const n = g.items.filter((it) => data.checks[it.id]).length;
        return (
          <section key={g.title} className="card">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="display text-xl">{g.title}</h2>
              <span className={`chip num ${n === g.items.length ? "bg-grass-soft" : ""}`}>
                {fa(n)} از {fa(g.items.length)}
              </span>
            </div>
            {g.items.map((it) => (
              <Tick key={it.id} checked={!!data.checks[it.id]} onChange={(on) => toggleCheck(it.id, on)}>
                {it.text}
              </Tick>
            ))}
          </section>
        );
      })}
    </>
  );
}
