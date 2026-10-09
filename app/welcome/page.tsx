"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { DEFAULT_DUE_ISO, type Role } from "@/lib/preg";
import DueEditor from "@/components/DueEditor";
import Helmet from "@/components/Helmet";

export default function Welcome() {
  const { day, createFamily } = useApp();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [due, setDue] = useState(DEFAULT_DUE_ISO);
  const [dueTouched, setDueTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [link, setLink] = useState("");

  const create = async () => {
    if (!role) return;
    setBusy(true);
    setErr("");
    const e = await createFamily(role, dueTouched ? due : null);
    setBusy(false);
    if (e) setErr(e);
    else router.replace("/");
  };
  const goJoin = () => {
    const token = link.trim().split("#").pop()?.split("/").pop() || "";
    if (token) router.push(`/join#${token}`);
  };

  return (
    <main className="page">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <div className="bob">
          <Helmet size={96} />
        </div>
        <h1 className="display text-3xl">به «نجات سرباز رایان» خوش اومدی!</h1>
        <p className="text-muted">همراه روزبه‌روز مامان و بابای رایان.</p>
      </div>

      <section className="card flex flex-col gap-3">
        <h2 className="display text-2xl">ساختن خانواده</h2>
        <p className="text-muted">اگه اولین نفری هستی که از اپ استفاده می‌کنه، از اینجا شروع کن. بعد برای همسرت لینک دعوت می‌فرستی.</p>
        <p className="font-bold">من…</p>
        <div className="grid grid-cols-2 gap-3">
          {(["dad", "mom"] as Role[]).map((r) => (
            <button key={r} type="button" aria-pressed={role === r} className={role === r ? "btn" : "btn btn-ghost"} onClick={() => setRole(r)}>
              {r === "dad" ? "بابای رایانم" : "مامان رایانم"}
            </button>
          ))}
        </div>
        <p className="font-bold">سن بارداری یا تاریخ موعد</p>
        <DueEditor
          dueIso={due}
          today={day}
          onChange={(iso) => {
            setDue(iso);
            setDueTouched(true);
          }}
        />
        <button type="button" className="btn btn-sun" disabled={!role || busy} onClick={create}>
          {busy ? "در حال ساخت…" : "بزن بریم!"}
        </button>
        {err ? <p className="text-sm text-danger">{err}</p> : null}
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="display text-2xl">لینک دعوت دارم</h2>
        <p className="text-muted">اگه همسرت برات لینک فرستاده، همون لینک رو باز کن. یا اینجا بچسبونش:</p>
        <input className="field" dir="ltr" placeholder="https://…/join#…" value={link} onChange={(e) => setLink(e.target.value)} aria-label="لینک دعوت" />
        <button type="button" className="btn self-start" onClick={goJoin} disabled={!link.trim()}>
          ادامه
        </button>
      </section>
    </main>
  );
}
