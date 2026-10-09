"use client";

import { useState } from "react";
import { fa, faMoney } from "@/lib/jalali";

function parseNum(s: string) {
  const ascii = s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  return Number(ascii.replace(/[^0-9]/g, "")) || 0;
}

export default function SavingsCalc() {
  const [amt, setAmt] = useState("۱٬۰۰۰٬۰۰۰");
  const [years, setYears] = useState(18);
  const [rate, setRate] = useState(4);
  const p = parseNum(amt);
  const n = years * 12;
  const i = Math.pow(1 + rate / 100, 1 / 12) - 1;
  const fv = i === 0 ? p * n : (p * (Math.pow(1 + i, n) - 1)) / i;
  const paid = p * n;
  return (
    <section className="card flex flex-col gap-3">
      <h2 className="display text-2xl">قلک بزرگ رایان</h2>
      <p className="text-muted">مبلغ کم ولی منظم از روز تولد، از مبلغ زیاد در سال‌های بعد بیشتر اثر داره. با عددها بازی کن.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          پس‌انداز ماهانه (تومان)
          <input className="field text-ink" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          تا چند سالگی رایان
          <select className="field text-ink" value={years} onChange={(e) => setYears(+e.target.value)}>
            {Array.from({ length: 14 }, (_, k) => k + 5).map((y) => (
              <option key={y} value={y}>
                {fa(y)} سالگی
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          بازده سالانه بالاتر از تورم
          <select className="field text-ink" value={rate} onChange={(e) => setRate(+e.target.value)}>
            <option value={0}>۰٪ (بدون سود واقعی)</option>
            <option value={2}>۲٪</option>
            <option value={4}>۴٪</option>
            <option value={6}>۶٪</option>
          </select>
        </label>
      </div>
      <div className="rounded-2xl bg-grass-soft p-4">
        <p className="text-sm text-muted">حاصل، به ارزش پول امروز:</p>
        <p className="display num text-3xl" style={{ color: "var(--grass-deep)" }}>
          {p ? `${faMoney(fv)} تومان` : "—"}
        </p>
        {p ? (
          <p className="text-sm text-muted">
            از این مبلغ {faMoney(paid)} تومان پس‌انداز خودتونه و {faMoney(fv - paid)} تومان حاصل بازده در {fa(years)} سال.
          </p>
        ) : null}
      </div>
      <p className="text-xs text-muted">
        این فقط یه حساب ساده برای دیدن اثر زمانه، نه پیشنهاد سرمایه‌گذاری. با تورم بالا، پول نقد بدون سود ارزشش رو از دست می‌ده؛ پس‌انداز رو بین چند نوع دارایی تقسیم کنید و قبل از تصمیم با یه مشاور مالی مطمئن صحبت کنید.
      </p>
    </section>
  );
}
