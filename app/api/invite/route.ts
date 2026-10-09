import { K, MAX_MEMBERS, fail, gate, json, randomId, readJson } from "@/lib/server/family";

const INVITE_SECONDS = 60 * 60 * 24 * 7;

/** لینک دعوت یک‌بارمصرف، با اعتبار ۷ روز */
export async function POST(req: Request) {
  if (!(await readJson(req))) return fail(400, "bad-request");
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  if (Object.keys(s.fam.members).length >= MAX_MEMBERS) return fail(409, "family-full");
  const token = randomId(24);
  try {
    await s.kv.cmd(["SET", K.invite(token), JSON.stringify({ fid: s.fid, by: s.mid, at: Date.now() }), "EX", INVITE_SECONDS]);
  } catch {
    return fail(502, "storage-error");
  }
  return json({ token, expiresInDays: 7 });
}
