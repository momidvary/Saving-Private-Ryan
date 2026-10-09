"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { fa } from "@/lib/jalali";
import { ROLE_SHORT, type Role } from "@/lib/preg";
import { DAD_WEEKS, MOM_WEEKS, WEEK_MAX, WEEK_MIN } from "@/content/weeks";
import { SIZES, weightText } from "@/content/sizes";
import { Tick, Title } from "@/components/ui";

export default function Weeks() {
  const { role, info, data, toggleCheck } = useApp();
  const [view, setView] = useState<Role>(role || "dad");
  const nowRef = useRef<HTMLElement>(null);
  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center" });
  }, []);
  const weeks = view === "mom" ? MOM_WEEKS : DAD_WEEKS;
  const list = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => WEEK_MIN + i);

  return (
    <main className="page">
      <Title sub="هر هفته یه کار مهم. هفته‌ی جاری با رنگ آبی مشخصه.">هفته به هفته</Title>
      <div className="flex gap-2" role="group" aria-label="برنامه‌ی کی رو ببینم؟">
        {(["dad", "mom"] as Role[]).map((r) => (
          <button key={r} type="button" aria-pressed={view === r} onClick={() => setView(r)} className={view === r ? "btn" : "btn btn-ghost"}>
            برنامه‌ی {ROLE_SHORT[r]}
          </button>
        ))}
      </div>
      {list.map((w) => {
        const item = weeks[w];
        const size = SIZES[Math.min(w, 40)];
        const isNow = !info.born && w === Math.min(Math.max(info.week, WEEK_MIN), WEEK_MAX);
        const start = info.due - 280 + w * 7;
        const nowruzHere = info.nowruz >= start && info.nowruz < start + 7;
        const key = `${view === "mom" ? "mw" : "w"}${w}`;
        const past = !info.born ? w < info.week : true;
        return (
          <article
            key={w}
            ref={isNow ? nowRef : undefined}
            className="card flex flex-col gap-2"
            style={isNow ? { borderColor: "var(--blue)", boxShadow: "0 4px 0 var(--blue)" } : past ? { opacity: 0.85 } : undefined}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-12 flex-none place-items-center rounded-2xl bg-blue-soft text-2xl" aria-hidden="true">
                {size?.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">
                  {isNow ? "این هفته، " : ""}هفته‌ی {fa(w)}
                  {nowruzHere ? <span style={{ color: "var(--grass)" }}>، تحویل سال</span> : null}
                </p>
                <h2 className="font-bold">{item.title}</h2>
              </div>
            </div>
            <p>{item.body}</p>
            {size ? (
              <p className="text-xs text-muted">
                رایان این هفته: اندازه‌ی {size.fruit}، حدود {fa(size.cm)} سانتی‌متر و {weightText(size.g)}
              </p>
            ) : null}
            <Tick checked={!!data.checks[key]} onChange={(on) => toggleCheck(key, on)}>
              انجام شد
            </Tick>
          </article>
        );
      })}
      <p className="text-xs text-muted">
        اندازه‌ها تقریبی‌ان. تا هفته‌ی ۱۹ طول از سر تا باسن و از هفته‌ی ۲۰ از سر تا پا حساب می‌شه؛ برای همین در هفته‌ی ۲۰ یه‌دفعه بزرگ‌تر می‌شه.
      </p>
    </main>
  );
}
