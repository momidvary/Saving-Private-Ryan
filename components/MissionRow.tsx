"use client";

import { useState } from "react";
import { Medal } from "lucide-react";
import { MONTHS, d2j, fa, faDateFromTs, isoToJdn, j2d, jdnToIso, monthLen, todayIso } from "@/lib/jalali";
import type { Mission } from "@/content/missions";

/** یه ماموریت؛ با ثبت تاریخ، مدال می‌گیره */
export default function MissionRow({ m, doneAt, onSet, locked }: { m: Mission; doneAt?: string; onSet: (on: boolean, at?: string) => void; locked?: boolean }) {
  const [mode, setMode] = useState<"idle" | "date" | "undo">("idle");
  const t = d2j(isoToJdn(todayIso()));
  const [jd, setJd] = useState(t);
  const done = !!doneAt;

  return (
    <div className="flex flex-col gap-2 border-b-2 border-dashed border-line py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <span
          className="grid size-11 flex-none place-items-center rounded-full border-2"
          style={done ? { background: "var(--sun)", borderColor: "var(--sun-deep)", color: "#7a4b00" } : { background: "var(--blue-soft)", borderColor: "var(--line)", color: "var(--muted)" }}
          aria-hidden="true"
        >
          <Medal size={22} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{m.title}</p>
          <p className="text-sm text-muted">{m.hint}</p>
          {done ? <p className="text-sm font-bold" style={{ color: "var(--grass)" }}>مدال گرفت: {faDateFromTs(doneAt!)}</p> : null}
        </div>
        {mode === "idle" ? (
          done ? (
            <button type="button" className="text-xs text-muted underline" onClick={() => setMode("undo")}>
              برداشتن
            </button>
          ) : (
            <button type="button" className={`btn btn-sun min-h-10 px-3 text-sm ${locked ? "opacity-70" : ""}`} onClick={() => setMode("date")}>
              ثبت مدال
            </button>
          )
        ) : null}
      </div>
      {mode === "date" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-sun-soft p-3">
          <span className="text-sm">کِی؟</span>
          <select aria-label="روز" className="field w-auto" value={jd.jd} onChange={(e) => setJd({ ...jd, jd: +e.target.value })}>
            {Array.from({ length: monthLen(jd.jy, jd.jm) }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {fa(d)}
              </option>
            ))}
          </select>
          <select aria-label="ماه" className="field w-auto" value={jd.jm} onChange={(e) => setJd({ ...jd, jm: +e.target.value, jd: Math.min(jd.jd, monthLen(jd.jy, +e.target.value)) })}>
            {MONTHS.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
          <select aria-label="سال" className="field w-auto" value={jd.jy} onChange={(e) => setJd({ ...jd, jy: +e.target.value })}>
            {Array.from({ length: 20 }, (_, i) => t.jy - 1 + i).map((y) => (
              <option key={y} value={y}>
                {fa(y)}
              </option>
            ))}
          </select>
          <div className="flex w-full gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => {
                onSet(true, jdnToIso(j2d(jd.jy, jd.jm, jd.jd)));
                setMode("idle");
              }}
            >
              ثبت
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode("idle")}>
              بی‌خیال
            </button>
          </div>
        </div>
      ) : null}
      {mode === "undo" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-danger-soft p-3">
          <span className="flex-1 text-sm">مدال این ماموریت برداشته بشه؟</span>
          <button
            type="button"
            className="btn btn-danger min-h-10 px-3 text-sm"
            onClick={() => {
              onSet(false);
              setMode("idle");
            }}
          >
            بله
          </button>
          <button type="button" className="btn btn-ghost min-h-10 px-3 text-sm" onClick={() => setMode("idle")}>
            نه
          </button>
        </div>
      ) : null}
    </div>
  );
}
