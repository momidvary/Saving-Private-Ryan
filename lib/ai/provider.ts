// اتصال به هر سرویسی که API سازگار با OpenAI (chat/completions) داره.
// کلید فقط در سرور خونده می‌شه و هیچ‌وقت به مرورگر نمی‌ره.

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export function aiConfig() {
  const base = process.env.AI_BASE_URL?.trim();
  const key = process.env.AI_API_KEY?.trim();
  if (!base || !key) return null;
  return {
    base: base.replace(/\/$/, ""),
    key,
    model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
    dailyLimit: Math.max(1, Number(process.env.AI_DAILY_LIMIT) || 30),
  };
}

export class AiError extends Error {
  constructor(public kind: "timeout" | "upstream" | "empty") {
    super(kind);
  }
}

export async function chat(messages: ChatMsg[]) {
  const cfg = aiConfig();
  if (!cfg) throw new AiError("upstream");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const r = await fetch(`${cfg.base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: cfg.model, messages, temperature: 0.4, max_tokens: 700 }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!r.ok) throw new AiError("upstream");
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    const text = j.choices?.[0]?.message?.content?.trim();
    if (!text) throw new AiError("empty");
    return text;
  } catch (e) {
    if (e instanceof AiError) throw e;
    if ((e as Error).name === "AbortError") throw new AiError("timeout");
    throw new AiError("upstream");
  } finally {
    clearTimeout(timer);
  }
}
