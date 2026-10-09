import { K, fail, gate, isDay, json } from "@/lib/server/family";
import { pairs } from "@/lib/server/kv";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await gate();
  if (!g.kv) return fail(503, "no-storage");
  const s = g.session;
  if (!s) return fail(401, "not-member");
  const day = new URL(req.url).searchParams.get("day");
  if (!isDay(day)) return fail(400, "bad-day");
  try {
    const [checks, dad, mom, letters] = await s.kv.pipe([
      ["HGETALL", K.checks(s.fid)],
      ["SMEMBERS", K.daily(s.fid, day, "dad")],
      ["SMEMBERS", K.daily(s.fid, day, "mom")],
      ["HGETALL", K.letters(s.fid)],
    ]);
    const list = Object.entries(pairs(letters))
      .map(([id, raw]) => {
        try {
          const v = JSON.parse(raw) as { body: string; by: string; at: number; mid: string };
          return { id, body: String(v.body), by: v.by === "mom" ? "mom" : "dad", at: Number(v.at) || 0, mine: v.mid === s.mid };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.at - a!.at);
    const roles = Object.values(s.fam.members).map((m) => m.role);
    return json({
      family: { due: s.fam.due, dueSet: s.fam.dueSet, members: { dad: roles.filter((r) => r === "dad").length, mom: roles.filter((r) => r === "mom").length } },
      me: { role: s.role },
      checks: pairs(checks),
      daily: { dad: Array.isArray(dad) ? dad.map(String) : [], mom: Array.isArray(mom) ? mom.map(String) : [] },
      letters: list,
    });
  } catch {
    return fail(502, "storage-error");
  }
}
