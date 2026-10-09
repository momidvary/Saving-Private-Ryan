import { DEFAULT_DUE_ISO } from "@/lib/preg";
import { fail, gate, isDue, isRole, json, newMember, randomId, readJson, saveFamily, setMemberCookie, type Family } from "@/lib/server/family";

/** ساختن خانواده‌ی جدید؛ سازنده اولین عضو می‌شه. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isRole(body.role)) return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  if (g.session) return fail(409, "already-member");
  const dueSet = isDue(body.due);
  const fid = randomId(12);
  const { mid, token, member } = newMember(body.role);
  const fam: Family = { v: 1, due: dueSet ? (body.due as string) : DEFAULT_DUE_ISO, dueSet, createdAt: Date.now(), members: { [mid]: member } };
  try {
    await saveFamily(g.kv, fid, fam);
  } catch {
    return fail(502, "storage-error");
  }
  await setMemberCookie(fid, mid, token);
  return json({ ok: true });
}

/** تغییر تاریخ موعد (مشترک) یا نقش خود عضو */
export async function PATCH(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  if (body.due !== undefined) {
    if (!isDue(body.due)) return fail(400, "bad-due");
    s.fam.due = body.due;
    s.fam.dueSet = true;
  }
  if (body.role !== undefined) {
    if (!isRole(body.role)) return fail(400, "bad-role");
    s.fam.members[s.mid].role = body.role;
  }
  try {
    await saveFamily(s.kv, s.fid, s.fam);
  } catch {
    return fail(502, "storage-error");
  }
  return json({ ok: true });
}
