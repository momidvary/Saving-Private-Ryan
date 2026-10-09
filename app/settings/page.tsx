"use client";

import { useState } from "react";
import { Copy, Link2, LogOut, UserPlus } from "lucide-react";
import { useApp } from "@/lib/store";
import { fa } from "@/lib/jalali";
import { ROLE_NAME, type Role } from "@/lib/preg";
import DueEditor from "@/components/DueEditor";
import { Title } from "@/components/ui";

export default function Settings() {
  const { status, role, setRole, data, day, setDue, createInvite, logout } = useApp();
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const total = data.members.dad + data.members.mom;

  const invite = async () => {
    setBusy(true);
    setNote("");
    const l = await createInvite();
    setBusy(false);
    if (l) setLink(l);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setNote("کپی شد. برای همسرت بفرست.");
    } catch {
      setNote("کپی نشد؛ لینک رو انتخاب کن و دستی کپی کن.");
    }
  };

  return (
    <main className="page">
      <Title>تنظیمات</Title>

      <section className="card flex flex-col gap-3">
        <h2 className="display text-xl">من کی هستم؟</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["dad", "mom"] as Role[]).map((r) => (
            <button key={r} type="button" aria-pressed={role === r} className={role === r ? "btn" : "btn btn-ghost"} onClick={() => setRole(r)}>
              {ROLE_NAME[r]}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">کارهای روزانه و برنامه‌ی هفتگی بر اساس این انتخاب نشون داده می‌شه.</p>
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="display text-xl">تاریخ زایمان</h2>
        <DueEditor dueIso={data.due} today={day} onChange={setDue} />
        <p className="text-sm text-muted">{data.dueSet ? "این تاریخ بین بابا و مامان مشترکه." : "فعلاً تخمینی‌ه (۱۶ هفته و ۱ روز در ۱۷ مهر ۱۴۰۵). تاریخ پزشک رو وارد کنید."}</p>
      </section>

      {status === "cloud" ? (
        <section className="card flex flex-col gap-3">
          <h2 className="display text-xl">خانواده</h2>
          <p>
            اعضا: {data.members.dad ? `${fa(data.members.dad)} دستگاه بابا` : "بابا هنوز نه"}، {data.members.mom ? `${fa(data.members.mom)} دستگاه مامان` : "مامان هنوز نه"}
          </p>
          <p className="text-sm text-muted">برای همسرت، یا برای یه گوشی دیگه‌ی خودت، یه لینک دعوت بساز. هر لینک فقط یک بار کار می‌کنه و ۷ روز اعتبار داره.</p>
          <button type="button" className="btn btn-sun self-start" onClick={invite} disabled={busy}>
            <UserPlus size={18} /> {busy ? "در حال ساخت…" : "ساختن لینک دعوت"}
          </button>
          {link ? (
            <div className="flex flex-col gap-2 rounded-2xl bg-sun-soft p-3">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="flex-none" />
                <input readOnly value={link} className="field text-xs" dir="ltr" onFocus={(e) => e.target.select()} aria-label="لینک دعوت" />
              </div>
              <button type="button" className="btn self-start" onClick={copy}>
                <Copy size={18} /> کپی لینک
              </button>
              <p className="text-xs text-muted">این لینک مثل کلید خونه‌ست؛ فقط برای همسرت بفرست.</p>
            </div>
          ) : null}
          <p className="text-sm" role="status">
            {note}
          </p>
        </section>
      ) : status === "local" ? (
        <section className="card card-sun flex flex-col gap-2">
          <h2 className="display text-xl">فقط روی همین دستگاه</h2>
          <p>اپ هنوز به پایگاه داده وصل نشده؛ برای همین اطلاعات فقط روی همین گوشی ذخیره می‌شه و نمی‌شه همسرت رو دعوت کرد.</p>
          <p className="text-sm text-muted">برای فعال کردن حالت دونفره، در ورسل از بخش Storage یه پایگاه داده‌ی Upstash Redis به پروژه وصل کنید و دوباره منتشر کنید. راهنمای کامل در فایل README مخزن هست.</p>
        </section>
      ) : null}

      {status === "cloud" ? (
        <section className="card flex flex-col gap-2">
          <h2 className="display text-xl">خروج این دستگاه</h2>
          {!confirmOut ? (
            <button type="button" className="btn btn-ghost self-start" onClick={() => setConfirmOut(true)}>
              <LogOut size={18} /> خروج
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-2xl bg-danger-soft p-3">
              <p className="text-sm">
                {total <= 1
                  ? "تو تنها عضو این خانواده‌ای. اگه خارج بشی، دیگه هیچ‌کس به این اطلاعات دسترسی نداره. اول برای یه دستگاه دیگه لینک دعوت بساز."
                  : "دسترسی این دستگاه حذف می‌شه. برای برگشت، یه لینک دعوت تازه از همسرت لازم داری."}
              </p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-danger" onClick={() => logout()}>
                  بله، خارج شو
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmOut(false)}>
                  نه
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <p className="text-xs text-muted">نجات سرباز رایان، برای یادگیری و یادآوری. جای پزشک، ماما و پزشک اطفال رو نمی‌گیره. اورژانس: ۱۱۵</p>
    </main>
  );
}
