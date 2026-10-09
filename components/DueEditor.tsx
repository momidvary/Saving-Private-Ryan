"use client";

import { MONTHS, d2j, fa, j2d, jdnToIso, monthLen } from "@/lib/jalali";
import { dueFromGa, pregInfo } from "@/lib/preg";

/** دو راه برای تنظیم: سن بارداری امروز، یا تاریخ موعد شمسی */
export default function DueEditor({ dueIso, today, onChange }: { dueIso: string; today: string; onChange: (iso: string) => void }) {
  const info = pregInfo(dueIso, today);
  const due = d2j(info.due);
  const ty = d2j(info.today).jy;
  const weekOk = info.ga >= 28 && info.ga <= 300;
  const setJ = (jy: number, jm: number, jd: number) => onChange(jdnToIso(j2d(jy, jm, Math.min(jd, monthLen(jy, jm)))));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="ga-w" className="text-sm text-muted">
          سن بارداری امروز:
        </label>
        <select id="ga-w" className="field w-auto" value={weekOk ? info.week : ""} onChange={(e) => onChange(jdnToIso(dueFromGa(today, +e.target.value, weekOk ? info.day : 0)))}>
          {!weekOk ? <option value="">—</option> : null}
          {Array.from({ length: 39 }, (_, i) => i + 4).map((w) => (
            <option key={w} value={w}>
              {fa(w)}
            </option>
          ))}
        </select>
        <span className="text-muted">هفته و</span>
        <select id="ga-d" aria-label="روز" className="field w-auto" value={weekOk ? info.day : 0} onChange={(e) => onChange(jdnToIso(dueFromGa(today, weekOk ? info.week : 16, +e.target.value)))}>
          {Array.from({ length: 7 }, (_, i) => i).map((d) => (
            <option key={d} value={d}>
              {fa(d)}
            </option>
          ))}
        </select>
        <span className="text-muted">روز</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="due-d" className="text-sm text-muted">
          یا تاریخ موعد:
        </label>
        <select id="due-d" className="field w-auto" value={due.jd} onChange={(e) => setJ(due.jy, due.jm, +e.target.value)}>
          {Array.from({ length: monthLen(due.jy, due.jm) }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {fa(d)}
            </option>
          ))}
        </select>
        <select aria-label="ماه" className="field w-auto" value={due.jm} onChange={(e) => setJ(due.jy, +e.target.value, due.jd)}>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select aria-label="سال" className="field w-auto" value={due.jy} onChange={(e) => setJ(+e.target.value, due.jm, due.jd)}>
          {[ty - 1, ty, ty + 1].map((y) => (
            <option key={y} value={y}>
              {fa(y)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
