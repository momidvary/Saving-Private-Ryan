// دسترسی به Upstash Redis از طریق REST API (بدون کتابخانه‌ی اضافه).
// اگر متغیرهای محیطی تنظیم نشده باشن، getKv() مقدار null برمی‌گردونه و اپ در حالت «فقط همین دستگاه» می‌مونه.

export type Cmd = (string | number)[];

export interface Kv {
  cmd<T = unknown>(c: Cmd): Promise<T>;
  pipe(cs: Cmd[]): Promise<unknown[]>;
}

function restKv(url: string, token: string): Kv {
  const base = url.replace(/\/$/, "");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return {
    async cmd<T>(c: Cmd) {
      const r = await fetch(base, { method: "POST", headers, body: JSON.stringify(c), cache: "no-store" });
      const j = (await r.json().catch(() => ({}))) as { result?: T; error?: string };
      if (!r.ok || j.error) throw new Error(j.error || `kv ${r.status}`);
      return j.result as T;
    },
    async pipe(cs: Cmd[]) {
      const r = await fetch(`${base}/pipeline`, { method: "POST", headers, body: JSON.stringify(cs), cache: "no-store" });
      const j = (await r.json().catch(() => null)) as { result?: unknown; error?: string }[] | null;
      if (!r.ok || !Array.isArray(j)) throw new Error(`kv pipeline ${r.status}`);
      return j.map((x) => {
        if (x.error) throw new Error(x.error);
        return x.result;
      });
    },
  };
}

/* ---------- حافظه‌ی موقت، فقط برای توسعه‌ی محلی ---------- */
type Entry = { v: string | Map<string, string> | Set<string>; exp?: number };
const g = globalThis as unknown as { __sprMem?: Map<string, Entry> };

function memoryKv(): Kv {
  const m = (g.__sprMem ??= new Map());
  const live = (k: string) => {
    const e = m.get(k);
    if (e && e.exp && e.exp < Date.now()) {
      m.delete(k);
      return undefined;
    }
    return e;
  };
  const hash = (k: string) => {
    const e = live(k);
    if (e && e.v instanceof Map) return e.v;
    const h = new Map<string, string>();
    m.set(k, { v: h });
    return h;
  };
  const set = (k: string) => {
    const e = live(k);
    if (e && e.v instanceof Set) return e.v;
    const s = new Set<string>();
    m.set(k, { v: s, exp: e?.exp });
    return s;
  };
  const run = (c: Cmd): unknown => {
    const [op, ...a] = c.map(String);
    switch (op.toUpperCase()) {
      case "GET": {
        const e = live(a[0]);
        return e && typeof e.v === "string" ? e.v : null;
      }
      case "SET": {
        const ex = a[2]?.toUpperCase() === "EX" ? Date.now() + Number(a[3]) * 1000 : undefined;
        m.set(a[0], { v: a[1], exp: ex });
        return "OK";
      }
      case "GETDEL": {
        const e = live(a[0]);
        m.delete(a[0]);
        return e && typeof e.v === "string" ? e.v : null;
      }
      case "DEL":
        return a.filter((k) => m.delete(k)).length;
      case "EXPIRE": {
        const e = live(a[0]);
        if (!e) return 0;
        e.exp = Date.now() + Number(a[1]) * 1000;
        return 1;
      }
      case "HSET": {
        const h = hash(a[0]);
        for (let i = 1; i < a.length; i += 2) h.set(a[i], a[i + 1]);
        return (a.length - 1) / 2;
      }
      case "HGET":
        return hash(a[0]).get(a[1]) ?? null;
      case "HDEL":
        return a.slice(1).filter((f) => hash(a[0]).delete(f)).length;
      case "HLEN":
        return hash(a[0]).size;
      case "HGETALL":
        return [...hash(a[0]).entries()].flat();
      case "SADD": {
        const s = set(a[0]);
        a.slice(1).forEach((x) => s.add(x));
        return 1;
      }
      case "SREM":
        return a.slice(1).filter((x) => set(a[0]).delete(x)).length;
      case "SMEMBERS":
        return [...set(a[0])];
      default:
        throw new Error(`memory kv: ${op} not supported`);
    }
  };
  return {
    async cmd<T>(c: Cmd) {
      return run(c) as T;
    },
    async pipe(cs: Cmd[]) {
      return cs.map(run);
    },
  };
}

export function getKv(): Kv | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return restKv(url, token);
  if (process.env.NODE_ENV !== "production" && process.env.SPR_DEV_MEMORY === "1") return memoryKv();
  return null;
}

/** HGETALL در REST به شکل آرایه‌ی تخت برمی‌گرده: [field, value, field, value, ...] */
export function pairs(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(raw)) for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = String(raw[i + 1]);
  else if (raw && typeof raw === "object") Object.assign(out, raw as Record<string, string>);
  return out;
}
