import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LEARN } from "@/content/learn";
import { Title } from "@/components/ui";

const CARD: Record<string, string> = { grass: "card-grass", sun: "card-sun", coral: "card-coral", blue: "" };

export default function Learn() {
  return (
    <main className="page">
      <Title sub="هر چیزی که مامان و بابای رایان باید بدونن.">یادگیری</Title>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LEARN.map((l) => (
          <Link key={l.slug} href={`/learn/${l.slug}`} className={`card ${CARD[l.color]} flex items-center gap-3 no-underline text-ink`}>
            <span className="grid size-14 flex-none place-items-center rounded-2xl bg-paper text-3xl" aria-hidden="true">
              {l.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <b className="display block text-xl font-normal">{l.title}</b>
              <span className="text-sm text-muted">{l.sub}</span>
            </span>
            <ChevronLeft size={20} className="flex-none" />
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted">
        منابع اصلی: سازمان جهانی بهداشت، یونیسف، آکادمی اطفال آمریکا، مرکز رشد کودک هاروارد و کالج زنان و زایمان آمریکا. این مطالب برای یادگیری‌ان و جای پزشک، ماما و پزشک اطفال رو نمی‌گیرن.
      </p>
    </main>
  );
}
