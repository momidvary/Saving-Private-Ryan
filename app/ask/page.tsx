"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Send, ShieldAlert, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { fa } from "@/lib/jalali";
import { hasRedFlag } from "@/lib/ai/safety";
import { stageLabel } from "@/lib/ai/prompt";
import Helmet from "@/components/Helmet";
import { Title } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string; urgent?: boolean; failed?: boolean };
type State = { enabled: boolean; reason?: string; remaining?: number; limit?: number } | null;

const SS_KEY = "spr-ask";
const ERRORS: Record<string, string> = {
  timeout: "جواب خیلی طول کشید و نرسید. کمی بعد دوباره بپرس.",
  upstream: "سرویس هوش مصنوعی جواب نداد. ممکنه اعتبار کلید تموم شده باشه یا سرویس در دسترس نباشه.",
  empty: "جوابی دریافت نشد. سؤال رو یه کم متفاوت بپرس.",
  limit: "سؤال‌های امروز تموم شد. فردا دوباره می‌تونی بپرسی.",
  network: "اینترنت وصل نیست؛ سؤال فرستاده نشد.",
};

const SUGGEST_PREG = ["تا کِی تهوع طبیعیه؟", "چه ورزش‌هایی در بارداری مناسبه؟", "برای خوب خوابیدن در ماه‌های آخر چی کار کنیم؟", "بابا چطور می‌تونه بیشتر کمک کنه؟"];
const SUGGEST_BABY = ["رایان زیاد گریه می‌کنه، چی کار کنیم؟", "از کجا بفهمیم شیرش کافیه؟", "چطور خوابش رو منظم‌تر کنیم؟", "چه بازی‌هایی برای این سن خوبه؟"];

function Emergency() {
  return (
    <div className="card card-danger flex gap-3 py-3" role="alert">
      <ShieldAlert className="mt-1 flex-none" style={{ color: "var(--danger)" }} size={24} />
      <p className="text-sm">
        <b>اگه این علامت همین الان وجود داره، منتظر جواب نمونید.</b> با پزشک یا بیمارستان تماس بگیرید یا با اورژانس{" "}
        <b className="num select-all">۱۱۵</b> تماس بگیرید. برای بحران روحی: اورژانس اجتماعی <b className="num">۱۲۳</b>، صدای مشاور <b className="num">۱۴۸۰</b>.
      </p>
    </div>
  );
}

export default function Ask() {
  const { status, info, day } = useApp();
  const [state, setState] = useState<State>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SS_KEY) || "[]");
      if (Array.isArray(saved)) setMsgs(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(msgs.slice(-20)));
    } catch {}
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    if (status !== "cloud") return;
    fetch(`/api/ask?day=${day}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setState)
      .catch(() => setState({ enabled: false, reason: "network" }));
  }, [status, day]);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    const urgentNow = hasRedFlag(question);
    const next: Msg[] = [...msgs.filter((m) => !m.failed), { role: "user", content: question, urgent: urgentNow }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.answer) {
        setMsgs([...next, { role: "assistant", content: j.answer }]);
        setState((s) => (s ? { ...s, remaining: j.remaining } : s));
      } else {
        const kind = r.status === 429 ? "limit" : j.error || "upstream";
        setMsgs([...next, { role: "assistant", content: ERRORS[kind] || ERRORS.upstream, failed: true }]);
        if (r.status === 429) setState((s) => (s ? { ...s, remaining: 0 } : s));
      }
    } catch {
      setMsgs([...next, { role: "assistant", content: ERRORS.network, failed: true }]);
    }
    setBusy(false);
  };

  const off =
    status === "local"
      ? "مشاور فقط در حالت دونفره کار می‌کنه تا کلید هوش مصنوعی در دسترس همه نباشه. اول پایگاه داده رو در ورسل وصل کنید."
      : state && !state.enabled
        ? state.reason === "no-ai"
          ? "مشاور هنوز روشن نشده. برای روشن کردنش، کلید سرویس هوش مصنوعی رو در تنظیمات ورسل وارد کنید (راهنماش در README هست)."
          : "الان نمی‌شه به مشاور وصل شد."
        : "";

  const suggestions = info.born ? SUGGEST_BABY : SUGGEST_PREG;

  return (
    <main className="page">
      <Title sub={`سؤال‌هات درباره‌ی بارداری، مراقبت و رشد رایان رو بپرس. الان: ${stageLabel(info)}`}>مشاور رایان</Title>

      <section className="card card-sun flex gap-3 py-3">
        <Sparkles className="mt-1 flex-none" style={{ color: "var(--sun-deep)" }} size={22} />
        <p className="text-sm">
          جواب‌ها رو هوش مصنوعی می‌نویسه و ممکنه اشتباه داشته باشه. جای پزشک و ماما رو نمی‌گیره و تشخیص نمی‌ده. اسم، شماره یا اطلاعات شخصی ننویسید. گفتگو در سرور ذخیره نمی‌شه.
        </p>
      </section>

      {off ? (
        <section className="card flex flex-col items-center gap-2 text-center">
          <Helmet size={64} />
          <p>{off}</p>
        </section>
      ) : (
        <>
          {msgs.length === 0 ? (
            <section className="flex flex-col gap-2">
              <p className="text-sm text-muted">چند تا سؤال برای شروع:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="chip border-2 border-dashed border-line bg-paper py-1.5" onClick={() => send(s)} disabled={busy || !state}>
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-col gap-3" aria-live="polite">
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex flex-col items-start gap-2">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-tr-md px-4 py-2 text-white" style={{ background: "var(--blue)" }}>
                    {m.content}
                  </p>
                  {m.urgent ? <Emergency /> : null}
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2 self-end">
                  <p
                    className="max-w-[88%] whitespace-pre-wrap rounded-3xl rounded-tl-md border-2 px-4 py-3"
                    style={m.failed ? { background: "var(--danger-soft)", borderColor: "var(--danger)" } : { background: "var(--paper)", borderColor: "var(--line)" }}
                  >
                    {m.content}
                  </p>
                  <span className="flex-none">
                    <Helmet size={30} />
                  </span>
                </div>
              ),
            )}
            {busy ? (
              <div className="flex items-center gap-2 self-end text-sm text-muted">
                در حال فکر کردن… <span className="bob">
                  <Helmet size={30} />
                </span>
              </div>
            ) : null}
            <div ref={endRef} style={{ scrollMarginBottom: 200 }} />
          </div>

          <form
            className="card sticky bottom-[calc(96px+env(safe-area-inset-bottom,0px))] flex items-end gap-2 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <label htmlFor="q" className="sr-only">
              سؤالت
            </label>
            <textarea
              id="q"
              className="field min-h-12 flex-1 resize-none"
              rows={2}
              maxLength={1000}
              placeholder="سؤالت رو بنویس…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
            />
            <button type="submit" className="btn size-12 flex-none p-0" disabled={busy || !text.trim() || !state?.enabled || state.remaining === 0} aria-label="فرستادن">
              <Send size={20} className="-scale-x-100" />
            </button>
          </form>
          {state?.enabled ? (
            <p className="-mt-2 text-center text-xs text-muted">
              سؤال‌های باقی‌مونده‌ی امروز: <b className="num">{fa(state.remaining ?? 0)}</b> از {fa(state.limit ?? 0)}
              {msgs.length ? (
                <>
                  {"، "}
                  <button type="button" className="underline" onClick={() => setMsgs([])}>
                    گفتگوی تازه
                  </button>
                </>
              ) : null}
            </p>
          ) : null}
        </>
      )}

      <p className="flex items-center justify-center gap-1 text-xs text-muted">
        <Phone size={14} /> اورژانس: <b className="num">۱۱۵</b>
      </p>
    </main>
  );
}
