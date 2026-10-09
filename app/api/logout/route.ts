import { clearMemberCookie, fail, gate, json, readJson, saveFamily } from "@/lib/server/family";

/** خروج این دستگاه؛ دسترسی همین دستگاه از خانواده حذف می‌شه. */
export async function POST(req: Request) {
  if (!(await readJson(req))) return fail(400, "bad-request");
  const g = await gate();
  if (g.kv && g.session) {
    const s = g.session;
    delete s.fam.members[s.mid];
    try {
      await saveFamily(s.kv, s.fid, s.fam);
    } catch {
      return fail(502, "storage-error");
    }
  }
  await clearMemberCookie();
  return json({ ok: true });
}
