"use client";

import { useMemo } from "react";

const COLORS = ["var(--sun)", "var(--grass)", "var(--coral)", "var(--blue)"];

/** چند تیکه کاغذ رنگی که از وسط به بیرون پرتاب می‌شن */
export default function Celebrate({ seed }: { seed: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + seed;
        const r = 70 + ((i * 37 + seed * 13) % 60);
        return { dx: `${Math.round(Math.cos(a) * r)}px`, dy: `${Math.round(Math.sin(a) * r)}px`, c: COLORS[i % COLORS.length], d: (i % 5) * 0.04 };
      }),
    [seed],
  );
  return (
    <span className="burst pointer-events-none absolute inset-0" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={`${seed}-${i}`} style={{ background: b.c, animationDelay: `${b.d}s`, ["--dx" as string]: b.dx, ["--dy" as string]: b.dy }} />
      ))}
    </span>
  );
}
