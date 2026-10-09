import { K, MAX_MEMBERS, fail, gate, isRole, json, loadFamily, newMember, readJson, saveFamily, setMemberCookie } from "@/lib/server/family";

/** پیوستن به خانواده با لینک دعوت؛ لینک بعد از استفاده باطل می‌شه. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isRole(body.role) || typeof body.token !== "string" || !/^[A-Za-z0-9_-]{20,64}$/.test(body.token)) {
    return fail(400, "bad-request");
  }
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  try {
    const raw = await g.kv.cmd<string | null>(["GETDEL", K.invite(body.token)]);
    if (!raw) return fail(410, "invite-used-or-expired");
    const inv = JSON.parse(raw) as { fid: string };
    const fam = await loadFamily(g.kv, inv.fid);
    if (!fam) return fail(410, "invite-used-or-expired");
    if (Object.keys(fam.members).length >= MAX_MEMBERS) return fail(409, "family-full");
    const { mid, token, member } = newMember(body.role);
    fam.members[mid] = member;
    await saveFamily(g.kv, inv.fid, fam);
    await setMemberCookie(inv.fid, mid, token);
    return json({ ok: true });
  } catch {
    return fail(502, "storage-error");
  }
}
