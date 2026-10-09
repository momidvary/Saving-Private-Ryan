import { K, fail, gate, json, randomId, readJson } from "@/lib/server/family";

const MAX_LETTERS = 3000;
const MAX_LEN = 10000;

export async function POST(req: Request) {
  const body = await readJson(req);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text || text.length > MAX_LEN) return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  try {
    const n = await s.kv.cmd<number>(["HLEN", K.letters(s.fid)]);
    if (n >= MAX_LETTERS) return fail(507, "full");
    const id = randomId(9);
    await s.kv.cmd(["HSET", K.letters(s.fid), id, JSON.stringify({ body: text, by: s.role, at: Date.now(), mid: s.mid })]);
    return json({ ok: true, id });
  } catch {
    return fail(502, "storage-error");
  }
}

/** هر کس فقط نامه‌های خودش رو می‌تونه پاک کنه. */
export async function DELETE(req: Request) {
  const body = await readJson(req);
  if (!body || typeof body.id !== "string" || !/^[A-Za-z0-9_-]{1,40}$/.test(body.id)) return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  try {
    const raw = await s.kv.cmd<string | null>(["HGET", K.letters(s.fid), body.id]);
    if (!raw) return json({ ok: true });
    const v = JSON.parse(raw) as { mid?: string };
    if (v.mid !== s.mid) return fail(403, "not-author");
    await s.kv.cmd(["HDEL", K.letters(s.fid), body.id]);
    return json({ ok: true });
  } catch {
    return fail(502, "storage-error");
  }
}
