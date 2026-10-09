"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Heart, Lightbulb, Medal, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { d2j, fa, faWeekday, isoToJdn, jText, mod } from "@/lib/jalali";
import { ROLE_NAME, clampWeek, other } from "@/lib/preg";
import { TIPS, babyLine, dailyTasks } from "@/content/daily";
import { DAD_WEEKS, MOM_WEEKS } from "@/content/weeks";
import { STAGES, currentStageIndex } from "@/content/missions";
import Hero from "@/components/Hero";
import RolePicker from "@/components/RolePicker";
import Celebrate from "@/components/Celebrate";
import { Meter, Tick } from "@/components/ui";

export default function Today() {
  const { role, setRole, info, data, day, toggleDaily, toggleCheck, status } = useApp();
  const tasks = role ? dailyTasks(role, info.stage) : [];
  const mine = new Set(role ? data.daily[role] : []);
  const done = tasks.filter((t) => mine.has(t.id)).length;
  const all = tasks.length > 0 && done === tasks.length;

  const [burst, setBurst] = useState(0);
  const wasAll = useRef(all);
  useEffect(() => {
    if (all && !wasAll.current) setBurst(Date.now() % 1000);
    wasAll.current = all;
  }, [all]);

  if (!role) {
    return (
      <main className="page">
        <Hero />
        <RolePicker onPick={setRole} />
      </main>
    );
  }

  const p = other(role);
  const ptasks = dailyTasks(p, info.stage);
  const pdone = ptasks.filter((t) => data.daily[p].includes(t.id)).length;
  const tips = TIPS[role];
  const tip = tips[mod(isoToJdn(day), tips.length)];

  const w = clampWeek(info.week);
  const week = (role === "mom" ? MOM_WEEKS : DAD_WEEKS)[w];
  const weekKey = `${role === "mom" ? "mw" : "w"}${w}`;

  const ageRel = info.born ? info.ageDays : -info.left;
  const stage = STAGES[currentStageIndex(ageRel)];
  const nextMission = stage.missions.find((m) => !data.checks[m.id]);

  return (
    <main className="page">
      <div className="flex flex-col pt-1">
        <p className="text-sm text-muted">
          {faWeekday()}، {jText(d2j(isoToJdn(day)))}
        </p>
        <h1 className="display text-3xl leading-tight">سلام {ROLE_NAME[role]}!</h1>
      </div>

      <Hero />
      {!info.born ? <p className="-mt-1 px-1 text-sm text-muted">{babyLine(info.week)}</p> : null}

      <section className="card relative flex flex-col gap-3" aria-labelledby="daily-title">
        {burst ? <Celebrate seed={burst} /> : null}
        <div className="flex items-center justify-between gap-3">
          <h2 id="daily-title" className="display text-2xl">
            کارهای امروز
          </h2>
          <span className="chip num">
            {fa(done)} از {fa(tasks.length)}
          </span>
        </div>
        <Meter value={done} max={tasks.length} />
        <div>
          {tasks.map((t) => (
            <Tick key={t.id} checked={mine.has(t.id)} onChange={(on) => toggleDaily(t.id, on)}>
              {t.text}
            </Tick>
          ))}
        </div>
        {all ? (
          <p className="rounded-2xl bg-grass-soft px-4 py-2 font-bold text-ink">آفرین! همه‌ی کارهای امروز انجام شد. رایان بهت افتخار می‌کنه.</p>
        ) : (
          <p className="text-xs text-muted">این فهرست هر روز از نو شروع می‌شه.</p>
        )}
      </section>

      <section className="card card-sun flex gap-3">
        <Lightbulb className="mt-1 flex-none text-sun-deep" style={{ color: "var(--sun-deep)" }} size={26} />
        <div>
          <p className="eyebrow" style={{ color: "var(--sun-deep)" }}>
            نکته‌ی امروز
          </p>
          <p>{tip}</p>
        </div>
      </section>

      <section className="card flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue" />
          <p className="eyebrow">همراهت امروز</p>
        </div>
        {status === "local" ? (
          <p className="text-muted">
            وقتی اپ به پایگاه داده وصل بشه و {ROLE_NAME[p]} هم عضو بشه، پیشرفت امروزش اینجا دیده می‌شه.
          </p>
        ) : data.members[p] === 0 ? (
          <p className="text-muted">
            {ROLE_NAME[p]} هنوز به اپ نپیوسته.{" "}
            <Link href="/settings" className="font-bold text-blue">
              لینک دعوت بفرست
            </Link>
          </p>
        ) : (
          <>
            <p>
              {pdone === ptasks.length
                ? `${ROLE_NAME[p]} امروز همه‌ی کارهاش رو انجام داده. بهش بگو چقدر بهش افتخار می‌کنی.`
                : pdone === 0
                  ? `${ROLE_NAME[p]} هنوز امروز چیزی تیک نزده. شاید یه پیام محبت‌آمیز روزش رو بهتر کنه.`
                  : `${ROLE_NAME[p]} امروز ${fa(pdone)} از ${fa(ptasks.length)} کارش رو انجام داده.`}
            </p>
            <Meter value={pdone} max={ptasks.length} />
          </>
        )}
      </section>

      {!info.born && week ? (
        <section className="card flex flex-col gap-2" style={{ borderColor: "var(--blue)", boxShadow: "0 4px 0 var(--blue)" }}>
          <p className="eyebrow">کار این هفته، هفته‌ی {fa(w)}</p>
          <h2 className="text-lg font-bold">{week.title}</h2>
          <p>{week.body}</p>
          <Tick checked={!!data.checks[weekKey]} onChange={(on) => toggleCheck(weekKey, on)}>
            انجام شد
          </Tick>
          <Link href="/weeks" className="inline-flex items-center gap-1 text-sm font-bold text-blue">
            همه‌ی هفته‌ها <ChevronLeft size={16} />
          </Link>
        </section>
      ) : null}

      {nextMission ? (
        <Link href="/rayan" className="card card-coral flex items-center gap-3 no-underline text-ink">
          <Medal size={30} className="flex-none text-coral" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow" style={{ color: "var(--coral)" }}>
              ماموریت بعدی رایان، {stage.title}
            </p>
            <p className="font-bold">{nextMission.title}</p>
          </div>
          <ChevronLeft size={20} />
        </Link>
      ) : null}

      <p className="flex items-center justify-center gap-1 pt-2 text-xs text-muted">
        <Heart size={14} /> این اپ جای پزشک و ماما رو نمی‌گیره. اورژانس: <b className="num">۱۱۵</b>
      </p>
    </main>
  );
}
