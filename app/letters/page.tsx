"use client";

import { useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { faDateFromTs } from "@/lib/jalali";
import { ROLE_SHORT } from "@/lib/preg";
import { Title } from "@/components/ui";

const PROMPTS = {
  dad: ["امروز که فهمیدم اسمت رایانه…", "دلم می‌خواد وقتی بزرگ شدی بدونی…", "یه چیزی که از پدر خودم یاد گرفتم…", "آرزوی من برای تو…", "مامانت امروز…"],
  mom: ["امروز که تکون خوردنت رو حس کردم…", "دلم می‌خواد وقتی بزرگ شدی بدونی…", "یه چیزی که از مادر خودم یاد گرفتم…", "آرزوی من برای تو…", "بابات امروز…"],
};

export default function Letters() {
  const { role, data, addLetter, deleteLetter } = useApp();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const save = async () => {
    const body = text.trim();
    if (!body) {
      setNote("اول چند خط بنویس.");
      return;
    }
    setBusy(true);
    setNote("");
    const ok = await addLetter(body);
    setBusy(false);
    if (ok) {
      setText("");
      setNote("نامه ذخیره شد.");
    }
  };

  return (
    <main className="page">
      <Title sub="هر وقت حسی داشتید، چند خط برای رایان بنویسید. یه روز که بزرگ شد، این نامه‌ها رو با هم می‌خونید.">نامه به رایان</Title>
      <section className="card flex flex-col gap-3">
        <label htmlFor="letter" className="font-bold">
          نامه‌ی امروز
        </label>
        <div className="flex flex-wrap gap-2">
          {PROMPTS[role || "dad"].map((p) => (
            <button key={p} type="button" className="chip border-2 border-dashed border-line bg-paper" onClick={() => setText((t) => (t ? `${t}\n${p}` : p))}>
              {p}
            </button>
          ))}
        </div>
        <textarea id="letter" className="field min-h-44 leading-8" placeholder="رایان عزیزم، امروز…" value={text} onChange={(e) => setText(e.target.value)} maxLength={10000} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn" onClick={save} disabled={busy}>
            <Mail size={18} /> {busy ? "در حال ذخیره…" : "ذخیره‌ی نامه"}
          </button>
          <span className="text-sm text-muted" role="status">
            {note}
          </span>
        </div>
      </section>
      {data.letters.length === 0 ? (
        <div className="card border-dashed text-center text-muted">هنوز نامه‌ای ننوشتید. یکی از جمله‌های بالا رو بزن و از همون‌جا شروع کن.</div>
      ) : (
        data.letters.map((l) => (
          <article key={l.id} className="card flex flex-col gap-2" style={l.by === "mom" ? { borderColor: "var(--coral)", boxShadow: "0 4px 0 var(--coral)" } : undefined}>
            <div className="flex items-center justify-between gap-2">
              <span className="chip" style={l.by === "mom" ? { background: "var(--coral-soft)" } : undefined}>
                از طرف {ROLE_SHORT[l.by]}
              </span>
              <span className="text-xs text-muted">{faDateFromTs(l.at)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words">{l.body}</p>
            {l.mine ? (
              confirm === l.id ? (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-danger-soft p-3">
                  <span className="flex-1 text-sm">این نامه برای همیشه پاک بشه؟</span>
                  <button
                    type="button"
                    className="btn btn-danger min-h-10 px-3 text-sm"
                    onClick={() => {
                      deleteLetter(l.id);
                      setConfirm(null);
                    }}
                  >
                    پاک کن
                  </button>
                  <button type="button" className="btn btn-ghost min-h-10 px-3 text-sm" onClick={() => setConfirm(null)}>
                    نه
                  </button>
                </div>
              ) : (
                <button type="button" className="inline-flex items-center gap-1 self-start text-xs text-muted" onClick={() => setConfirm(l.id)}>
                  <Trash2 size={14} /> پاک کردن
                </button>
              )
            ) : null}
          </article>
        ))
      )}
    </main>
  );
}
