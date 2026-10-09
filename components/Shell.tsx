"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Medal, Settings, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { ALL_MISSIONS, rankFor } from "@/content/missions";
import Helmet from "./Helmet";
import BottomNav from "./BottomNav";

const OPEN_PATHS = ["/welcome", "/join"];

export default function Shell({ children }: { children: ReactNode }) {
  const { status, error, clearError, data, reload } = useApp();
  const path = usePathname();
  const router = useRouter();
  const open = OPEN_PATHS.some((p) => path.startsWith(p));

  useEffect(() => {
    if (status === "welcome" && !open) router.replace("/welcome");
    if ((status === "cloud" || status === "local") && path.startsWith("/welcome")) router.replace("/");
  }, [status, open, path, router]);

  const medals = ALL_MISSIONS.filter((m) => data.checks[m.id]).length;
  const { rank } = rankFor(medals);

  return (
    <>
      <header className="topbar">
        <div className="mx-auto flex max-w-[640px] items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="flex min-w-0 items-center gap-2 no-underline text-ink">
            <Helmet size={38} />
            <span className="display truncate text-xl">نجات سرباز رایان</span>
          </Link>
          {!open && status !== "loading" ? (
            <div className="flex items-center gap-2">
              <Link href="/rayan" className="chip bg-sun-soft no-underline" aria-label={`درجه‌ی رایان: ${rank.name}`}>
                <Medal size={16} className="text-coral" />
                {rank.name}
              </Link>
              <Link href="/settings" className="grid size-10 place-items-center rounded-full bg-paper text-ink border-2 border-line" aria-label="تنظیمات">
                <Settings size={20} />
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      {error ? (
        <div role="alert" className="mx-auto max-w-[640px] px-4">
          <div className="card card-danger flex items-start gap-3 py-3">
            <p className="flex-1 text-sm">{error}</p>
            <button type="button" onClick={clearError} aria-label="بستن" className="text-danger">
              <X size={20} />
            </button>
          </div>
        </div>
      ) : null}

      {status === "loading" ? (
        <main className="page items-center justify-center pt-24 text-center">
          <div className="bob">
            <Helmet size={84} />
          </div>
          <p className="text-muted">در حال آماده شدن…</p>
        </main>
      ) : status === "offline" && !open ? (
        <main className="page items-center pt-16 text-center">
          <Helmet size={72} />
          <h1 className="display text-2xl">به سرور وصل نشدیم</h1>
          <p className="text-muted">اینترنت رو بررسی کن و دوباره امتحان کن.</p>
          <button type="button" className="btn" onClick={reload}>
            دوباره امتحان کن
          </button>
        </main>
      ) : status === "welcome" && !open ? null : (
        children
      )}

      {!open && (status === "cloud" || status === "local") ? <BottomNav /> : null}
    </>
  );
}
