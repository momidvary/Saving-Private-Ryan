import { fail, gate, isDay, json, readJson } from "@/lib/server/family";
import { pregInfo } from "@/lib/preg";
import { AiError, aiConfig, chat, type ChatMsg } from "@/lib/ai/provider";
import { systemPrompt } from "@/lib/ai/prompt";
import { hasRedFlag } from "@/lib/ai/safety";

export const maxDuration = 60;

const MAX_TURNS = 8;
const MAX_QUESTION = 1000;
const MAX_HISTORY_ITEM = 2000;

const usageKey = (fid: string, day: string) => `spr:ai:${fid}:${day}`;

/** وضعیت مشاور: فعاله یا نه، و چند سؤال امروز باقی مونده */
export async function GET(req: Request) {
  const cfg = aiConfig();
  const g = await gate();
  if (!g.kv) return json({ enabled: false, reason: "no-storage" });
  if (!g.session) return fail(401, "not-member");
  if (!cfg) return json({ enabled: false, reason: "no-ai" });
  const day = new URL(req.url).searchParams.get("day");
  if (!isDay(day)) return fail(400, "bad-day");
  const used = Number((await g.kv.cmd<string | null>(["GET", usageKey(g.session.fid, day)]).catch(() => null)) || 0);
  return json({ enabled: true, remaining: Math.max(0, cfg.dailyLimit - used), limit: cfg.dailyLimit });
}

/** فقط اعضای خانواده می‌تونن بپرسن؛ گفتگو در سرور ذخیره نمی‌شه. */
export async function POST(req: Request) {
  const body = await readJson(req);
  const cfg = aiConfig();
  if (!cfg) return fail(503, "no-ai");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  if (!body || !isDay(body.day) || !Array.isArray(body.messages)) return fail(400, "bad-request");

  const history: ChatMsg[] = [];
  for (const m of body.messages.slice(-MAX_TURNS)) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) return fail(400, "bad-request");
    history.push({ role, content: content.slice(0, MAX_HISTORY_ITEM) });
  }
  const last = history[history.length - 1];
  if (!last || last.role !== "user" || last.content.length > MAX_QUESTION) return fail(400, "bad-request");

  const key = usageKey(s.fid, body.day);
  const used = await s.kv.pipe([["INCR", key], ["EXPIRE", key, 60 * 60 * 48]]).catch(() => null);
  if (!used) return fail(502, "storage-error");
  if (Number(used[0]) > cfg.dailyLimit) return fail(429, "limit");

  const urgent = hasRedFlag(last.content);
  const info = pregInfo(s.fam.due, body.day);
  try {
    const answer = await chat([{ role: "system", content: systemPrompt(s.role, info) }, ...history]);
    return json({ answer, urgent, remaining: Math.max(0, cfg.dailyLimit - Number(used[0])) });
  } catch (e) {
    return json({ error: e instanceof AiError ? e.kind : "upstream", urgent }, 502);
  }
}
