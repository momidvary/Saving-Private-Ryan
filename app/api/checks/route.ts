import { K, fail, gate, isKey, json, readJson } from "@/lib/server/family";

const MAX_CHECKS = 2000;

/** تیک‌های مشترک خانواده (چک‌لیست‌ها، کارهای هفته، ماموریت‌های رایان) */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isKey(body.key) || typeof body.on !== "boolean") return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  try {
    if (body.on) {
      const n = await s.kv.cmd<number>(["HLEN", K.checks(s.fid)]);
      if (n >= MAX_CHECKS) return fail(507, "full");
      const at = typeof body.at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.at) ? body.at : new Date().toISOString();
      await s.kv.cmd(["HSET", K.checks(s.fid), body.key, at]);
    } else {
      await s.kv.cmd(["HDEL", K.checks(s.fid), body.key]);
    }
  } catch {
    return fail(502, "storage-error");
  }
  return json({ ok: true });
}
