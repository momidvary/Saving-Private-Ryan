"use client";

import { useApp } from "@/lib/store";
import { d2j, fa, jText } from "@/lib/jalali";
import { sizeFor, weightText } from "@/content/sizes";

function Ring({ pct, children }: { pct: number; children: React.ReactNode }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[124px] flex-none">
      <svg viewBox="0 0 124 124" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="62" cy="62" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="12" />
        <circle cx="62" cy="62" r={r} fill="none" stroke="var(--sun)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(c * pct).toFixed(1)} ${c.toFixed(1)}`} />
      </svg>
      <div className="absolute inset-[18px] grid place-items-center rounded-full bg-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]">{children}</div>
    </div>
  );
}

export default function Hero() {
  const { info, data } = useApp();
  const due = d2j(info.due);
  const toNowruz = info.nowruz - info.today;
  if (info.born) {
    return (
      <section className="card-hero flex items-center gap-4">
        <Ring pct={1}>
          <span className="text-5xl bob" aria-hidden="true">👶</span>
        </Ring>
        <div className="min-w-0">
          <p className="text-sm opacity-85">رایان امروز</p>
          <p className="display text-3xl leading-tight">{fa(info.ageDays)} روزه‌ست!</p>
          <p className="text-sm opacity-90">بخش‌های بعد از تولد کم‌کم کامل‌تر می‌شن.</p>
        </div>
      </section>
    );
  }
  const size = sizeFor(info.week);
  return (
    <section className="card-hero flex flex-col gap-4" aria-label="سن بارداری">
      <div className="flex items-center gap-4">
        <Ring pct={Math.min(Math.max(info.ga / 280, 0), 1)}>
          <span className="bob text-5xl leading-none" aria-hidden="true">
            {size?.emoji ?? "🌱"}
          </span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="text-sm opacity-85">رایان امروز</p>
          <p className="display text-[2rem] leading-tight num">
            {fa(info.week)} هفته و {fa(info.day)} روز
          </p>
          {size ? (
            <p className="text-sm leading-6 opacity-95">
              اندازه‌ی {size.fruit}
              <br />
              حدود {fa(size.cm).replace(".", "٫")} سانتی‌متر، {weightText(size.g)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="chip chip-on-hero">
          موعد: <b>{jText(due)}</b>
          {!data.dueSet ? " (تخمینی)" : null}
        </span>
        <span className="chip chip-on-hero">
          <b className="num">{fa(info.left)}</b> روز تا دیدن رایان
        </span>
        {toNowruz > 0 ? (
          <span className="chip chip-on-hero">
            <b className="num">{fa(toNowruz)}</b> روز تا نوروز
          </span>
        ) : null}
      </div>
    </section>
  );
}
