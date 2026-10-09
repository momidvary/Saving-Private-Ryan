import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@/lib/preg";
import { getKv, type Kv } from "./kv";

export const COOKIE = "spr_member";
export const MAX_MEMBERS = 6;
const COOKIE_AGE = 60 * 60 * 24 * 730;

export const K = {
  fam: (fid: string) => `spr:fam:${fid}`,
  checks: (fid: string) => `spr:checks:${fid}`,
  daily: (fid: string, day: string, role: Role) => `spr:daily:${fid}:${day}:${role}`,
  letters: (fid: string) => `spr:letters:${fid}`,
  invite: (token: string) => `spr:inv:${token}`,
};

export type Member = { role: Role; th: string; at: number };
export type Family = { v: 1; due: string; dueSet: boolean; createdAt: number; members: Record<string, Member> };
export type Session = { kv: Kv; fid: string; mid: string; fam: Family; role: Role };

export function randomId(bytes: number) {
  return randomBytes(bytes).toString("base64url");
}
export function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}
function sameHash(a: string, b: string) {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function fail(status: number, error: string) {
  return json({ error }, status);
}

/** درخواست‌های تغییر‌دهنده باید JSON باشن؛ این کار جلوی ارسال فرم از سایت‌های دیگه رو می‌گیره. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return null;
  try {
    const v = await req.json();
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const isRole = (v: unknown): v is Role => v === "dad" || v === "mom";
export const isKey = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9-]{1,40}$/.test(v);

function serverDayOffset(iso: string) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t)) return Infinity;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((t - today) / 864e5);
}
/** روزِ دستگاه کاربر؛ به خاطر اختلاف ساعت تا ±۲ روز با UTC قبول می‌شه */
export const isDay = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Math.abs(serverDayOffset(v)) <= 2;
/** تاریخ موعد باید در محدوده‌ی معقول باشه */
export const isDue = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Math.abs(serverDayOffset(v)) <= 400;

export async function loadFamily(kv: Kv, fid: string): Promise<Family | null> {
  const raw = await kv.cmd<string | null>(["GET", K.fam(fid)]);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Family;
  } catch {
    return null;
  }
}
export async function saveFamily(kv: Kv, fid: string, fam: Family) {
  await kv.cmd(["SET", K.fam(fid), JSON.stringify(fam)]);
}

export async function setMemberCookie(fid: string, mid: string, token: string) {
  (await cookies()).set(COOKIE, `${fid}.${mid}.${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_AGE,
  });
}
export async function clearMemberCookie() {
  (await cookies()).delete(COOKIE);
}

export type Gate = { kv: null } | { kv: Kv; session: Session | null };

/** کوکی عضو رو بررسی می‌کنه. kv=null یعنی پایگاه داده تنظیم نشده. */
export async function gate(): Promise<Gate> {
  const kv = getKv();
  if (!kv) return { kv: null };
  const raw = (await cookies()).get(COOKIE)?.value || "";
  const [fid, mid, token] = raw.split(".");
  if (!fid || !mid || !token) return { kv, session: null };
  const fam = await loadFamily(kv, fid);
  const m = fam?.members[mid];
  if (!fam || !m || !sameHash(sha256(token), m.th)) return { kv, session: null };
  return { kv, session: { kv, fid, mid, fam, role: m.role } };
}

export function newMember(role: Role) {
  const mid = randomId(9);
  const token = randomId(32);
  return { mid, token, member: { role, th: sha256(token), at: Date.now() } as Member };
}
