"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/preg";
import Helmet from "@/components/Helmet";

export default function Join() {
  const { status, joinFamily } = useApp();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setToken(decodeURIComponent(location.hash.slice(1)));
  }, []);

  const join = async () => {
    if (!role || !token) return;
    setBusy(true);
    setErr("");
    const e = await joinFamily(token, role);
    setBusy(false);
    if (e) setErr(e);
    else {
      history.replaceState(null, "", "/join");
      router.replace("/");
    }
  };

  return (
    <main className="page">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <div className="bob">
          <Helmet size={96} />
        </div>
        <h1 className="display text-3xl">به خانواده‌ی رایان خوش اومدی!</h1>
      </div>
      {status === "local" ? (
        <section className="card card-sun">
          <p>اپ هنوز به پایگاه داده وصل نشده؛ برای همین دعوت کار نمی‌کنه. وقتی وصل شد، یه لینک تازه بگیر.</p>
        </section>
      ) : !token && status !== "loading" ? (
        <section className="card card-sun">
          <p>این لینک کامل نیست. از همسرت بخواه لینک دعوت رو دوباره بفرسته.</p>
        </section>
      ) : (
        <section className="card flex flex-col gap-3">
          {status === "cloud" ? <p className="rounded-2xl bg-sun-soft p-3 text-sm">این دستگاه الان عضو یه خانواده‌ست. با پیوستن، به خانواده‌ی این لینک منتقل می‌شه.</p> : null}
          <p className="font-bold">من…</p>
          <div className="grid grid-cols-2 gap-3">
            {(["dad", "mom"] as Role[]).map((r) => (
              <button key={r} type="button" aria-pressed={role === r} className={role === r ? "btn" : "btn btn-ghost"} onClick={() => setRole(r)}>
                {r === "dad" ? "بابای رایانم" : "مامان رایانم"}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-sun" disabled={!role || busy || !token} onClick={join}>
            {busy ? "در حال پیوستن…" : "پیوستن به خانواده"}
          </button>
          {err ? <p className="text-sm text-danger">{err}</p> : null}
        </section>
      )}
    </main>
  );
}
