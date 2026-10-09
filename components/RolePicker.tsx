"use client";

import type { Role } from "@/lib/preg";

export default function RolePicker({ onPick, title = "سلام! تو کی هستی؟" }: { onPick: (r: Role) => void; title?: string }) {
  return (
    <section className="card card-sun flex flex-col gap-3">
      <h2 className="display text-2xl">{title}</h2>
      <p className="text-muted">کارهای روزانه‌ی مامان و بابای رایان با هم فرق دارن.</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="btn flex-col py-4" onClick={() => onPick("dad")}>
          <span className="text-3xl" aria-hidden="true">🧔🏻</span>
          بابای رایانم
        </button>
        <button type="button" className="btn flex-col py-4" style={{ background: "var(--coral)", borderColor: "color-mix(in srgb, var(--coral) 70%, #000)", boxShadow: "0 4px 0 color-mix(in srgb, var(--coral) 70%, #000)" }} onClick={() => onPick("mom")}>
          <span className="text-3xl" aria-hidden="true">👩🏻</span>
          مامان رایانم
        </button>
      </div>
    </section>
  );
}
