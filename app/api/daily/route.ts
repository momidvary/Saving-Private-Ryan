import { K, fail, gate, isDay, isKey, json, readJson } from "@/lib/server/family";

const KEEP_SECONDS = 60 * 60 * 24 * 120;

/** کارهای روزانه؛ برای هر نقش جداست و بعد از ۱۲۰ روز پاک می‌شه. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isDay(body.day) || !isKey(body.key) || typeof body.on !== "boolean") return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  const key = K.daily(s.fid, body.day, s.role);
  try {
    if (body.on) await s.kv.pipe([["SADD", key, body.key], ["EXPIRE", key, KEEP_SECONDS]]);
    else await s.kv.cmd(["SREM", key, body.key]);
  } catch {
    return fail(502, "storage-error");
  }
  return json({ ok: true });
}
