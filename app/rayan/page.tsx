"use client";

import { useState } from "react";
import { ChevronDown, Lock, Trophy } from "lucide-react";
import { useApp } from "@/lib/store";
import { fa } from "@/lib/jalali";
import { ALL_MISSIONS, STAGES, currentStageIndex, rankFor } from "@/content/missions";
import { FUTURE_LIST } from "@/content/lists";
import MissionRow from "@/components/MissionRow";
import SavingsCalc from "@/components/SavingsCalc";
import { H2, Meter, Tick, Title } from "@/components/ui";

const HABITS = [
  { age: "۰ تا ۳ سال", text: "هر شب کتاب‌خوندن، حرف زدن زیاد، بازی آزاد و طبیعت. اگه زبان دومی در خونه دارید، از همین سن باهاش حرف بزنید." },
  { age: "۳ تا ۶ سال", text: "کارهای کوچیک خونه، ورزش و بازی با بچه‌های دیگه، یه قلک برای آشنایی با پول." },
  { age: "۶ تا ۱۲ سال", text: "پول توجیبی منظم و تصمیم‌گیری درباره‌ش، یه ورزش یا هنر که خودش انتخاب کنه، حرف زدن درباره‌ی احساسات." },
  { age: "نوجوانی", text: "مسئولیت بیشتر و آزادی بیشتر، با هم. گوش دادن بیشتر از نصیحت کردن." },
];

export default function Rayan() {
  const { info, data, toggleCheck } = useApp();
  const ageRel = info.born ? info.ageDays : -info.left;
  const cur = currentStageIndex(ageRel);
  const [open, setOpen] = useState<Record<string, boolean>>({ [STAGES[cur].id]: true });
  const medals = ALL_MISSIONS.filter((m) => data.checks[m.id]).length;
  const { rank, next } = rankFor(medals);

  return (
    <main className="page">
      <Title sub="«اولین‌ها» و کارهای بزرگ رایان در هر سن. هر ماموریت که انجام بشه، با تاریخش ثبت می‌شه و یه مدال می‌گیره.">ماموریت‌های رایان</Title>

      <section className="card-hero flex items-center gap-4">
        <div className="grid size-20 flex-none place-items-center rounded-full border-4 bg-white" style={{ borderColor: "var(--sun)" }}>
          <Trophy size={40} style={{ color: "var(--sun-deep)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm opacity-85">درجه‌ی رایان</p>
          <p className="display text-3xl leading-tight">{rank.name}</p>
          <p className="text-sm opacity-90">
            {fa(medals)} مدال از {fa(ALL_MISSIONS.length)}
            {next ? `، ${fa(next.min - medals)} مدال تا «${next.name}»` : "، بالاترین درجه!"}
          </p>
          {next ? (
            <div className="mt-2">
              <Meter value={medals - rank.min} max={next.min - rank.min} />
            </div>
          ) : null}
        </div>
      </section>

      {STAGES.map((s, i) => {
        const doneN = s.missions.filter((m) => data.checks[m.id]).length;
        const isOpen = !!open[s.id];
        const future = i > cur;
        return (
          <section key={s.id} className="card" style={i === cur ? { borderColor: "var(--coral)", boxShadow: "0 4px 0 var(--coral)" } : undefined}>
            <button type="button" className="flex w-full items-center gap-3 text-start" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [s.id]: !isOpen })}>
              {future ? <Lock size={18} className="flex-none text-muted" /> : null}
              <div className="min-w-0 flex-1">
                {i === cur ? (
                  <p className="eyebrow" style={{ color: "var(--coral)" }}>
                    الان اینجاییم
                  </p>
                ) : null}
                <h2 className="display text-xl">{s.title}</h2>
              </div>
              <span className="chip num">
                {fa(doneN)}/{fa(s.missions.length)}
              </span>
              <ChevronDown size={20} className={`flex-none transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen ? (
              <div className="mt-2">
                {future ? <p className="mb-1 text-sm text-muted">این ماموریت‌ها مال آینده‌ان؛ ولی اگه رایان زودتر انجامشون داد، مدالش رو بدید!</p> : null}
                {s.missions.map((m) => (
                  <MissionRow key={m.id} m={m} doneAt={data.checks[m.id]} locked={future} onSet={(on, at) => toggleCheck(m.id, on, at)} />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}

      <H2>آینده‌ی رایان</H2>
      <SavingsCalc />
      <section className="card">
        <h2 className="display mb-1 text-xl">کارهای آینده</h2>
        {FUTURE_LIST.map((it) => (
          <Tick key={it.id} checked={!!data.checks[it.id]} onChange={(on) => toggleCheck(it.id, on)}>
            {it.text}
          </Tick>
        ))}
      </section>
      <section className="card flex flex-col gap-3">
        <h2 className="display text-xl">عادت‌هایی که آینده می‌سازن</h2>
        {HABITS.map((h) => (
          <div key={h.age} className="flex flex-col gap-1 rounded-2xl bg-blue-soft p-3">
            <b className="text-blue">{h.age}</b>
            <p>{h.text}</p>
          </div>
        ))}
      </section>
      <section className="card grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ["صندوق اضطراری", "هزینه‌ی ۳ تا ۶ ماه زندگی، جدا از پس‌انداز آینده و قابل برداشت سریع."],
          ["بیمه‌ی درمان", "بعد از گرفتن شناسنامه، رایان رو به بیمه‌ی پایه و تکمیلی اضافه کنید."],
          ["بیمه‌ی عمر", "اگه برای یکی از شما اتفاقی بیفته، خانواده چطور اداره می‌شه؟"],
          ["وصیت‌نامه و سرپرستی", "با یه وکیل یا دفترخانه مشورت کنید."],
          ["مدارک رایان", "شناسنامه رو در روزهای اول بگیرید؛ مهلت قانونی رو از ثبت احوال بپرسید."],
          ["سلامت خودتون", "چکاپ سالانه، ورزش و ترک دخانیات. بهترین سرمایه‌ی رایان، پدر و مادر سالمه."],
        ].map(([t, d]) => (
          <div key={t} className="flex flex-col gap-1">
            <b>{t}</b>
            <span className="text-sm text-muted">{d}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
