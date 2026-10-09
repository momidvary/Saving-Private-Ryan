"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { todayIso } from "./jalali";
import { DEFAULT_DUE_ISO, pregInfo, type PregInfo, type Role } from "./preg";

export type Letter = { id: string; body: string; by: Role; at: number; mine: boolean };
export type Data = {
  due: string;
  dueSet: boolean;
  checks: Record<string, string>;
  daily: Record<Role, string[]>;
  letters: Letter[];
  members: Record<Role, number>;
};
/**
 * loading: در حال بارگذاری
 * local:   پایگاه داده تنظیم نشده؛ همه‌چیز روی همین دستگاه
 * cloud:   عضو خانواده؛ اطلاعات مشترک
 * welcome: پایگاه داده هست ولی این دستگاه هنوز عضو خانواده‌ای نیست
 * offline: اولین بارگذاری به سرور نرسید
 */
export type Status = "loading" | "local" | "cloud" | "welcome" | "offline";

type Ctx = {
  status: Status;
  error: string;
  clearError: () => void;
  role: Role | null;
  day: string;
  data: Data;
  info: PregInfo;
  setRole: (r: Role) => void;
  setDue: (iso: string) => void;
  toggleCheck: (key: string, on: boolean, at?: string) => void;
  toggleDaily: (key: string, on: boolean) => void;
  addLetter: (body: string) => Promise<boolean>;
  deleteLetter: (id: string) => Promise<void>;
  createFamily: (role: Role, due: string | null) => Promise<string | null>;
  joinFamily: (token: string, role: Role) => Promise<string | null>;
  createInvite: () => Promise<string | null>;
  logout: () => Promise<void>;
  reload: () => void;
};

const EMPTY: Data = { due: DEFAULT_DUE_ISO, dueSet: false, checks: {}, daily: { dad: [], mom: [] }, letters: [], members: { dad: 0, mom: 0 } };
const LS_KEY = "spr-local-v1";
const LS_ROLE = "spr-role";

type LocalBlob = {
  role?: Role | null;
  due?: string;
  dueSet?: boolean;
  checks?: Record<string, string>;
  days?: Record<string, Record<Role, string[]>>;
  letters?: Letter[];
};
function readLocal(): LocalBlob {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as LocalBlob;
  } catch {
    return {};
  }
}
function writeLocal(b: LocalBlob) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(b));
    return true;
  } catch {
    return false;
  }
}
const isRole = (v: unknown): v is Role => v === "dad" || v === "mom";

const MESSAGES: Record<number, string> = {
  401: "دسترسی این دستگاه به خانواده قطع شده. از همسرت یه لینک دعوت تازه بگیر.",
  410: "این لینک دعوت قبلاً استفاده شده یا منقضی شده. یه لینک تازه بگیر.",
  409: "این خانواده به سقف تعداد اعضا رسیده.",
  507: "فضای ذخیره پر شده.",
};
function messageFor(status: number) {
  return MESSAGES[status] ?? "ذخیره نشد. اینترنت رو بررسی کن و دوباره امتحان کن.";
}

async function api(path: string, method = "GET", body?: unknown) {
  try {
    const r = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as Record<string, unknown> };
  }
}

const C = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(C);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [data, setDataState] = useState<Data>(EMPTY);
  const dataRef = useRef<Data>(EMPTY);
  /** همیشه هم state و هم ref رو با هم به‌روز می‌کنه تا تغییرهای پشت‌سرهم روی آخرین مقدار اعمال بشن */
  const setData = useCallback((d: Data) => {
    dataRef.current = d;
    setDataState(d);
  }, []);
  const [role, setRoleState] = useState<Role | null>(null);
  const [day, setDay] = useState(() => todayIso());
  const pending = useRef(0);
  const statusRef = useRef<Status>("loading");
  statusRef.current = status;

  const loadLocal = useCallback((d: string) => {
    const b = readLocal();
    const r = isRole(b.role) ? b.role : null;
    setRoleState(r);
    setData({
      due: b.due || DEFAULT_DUE_ISO,
      dueSet: !!b.dueSet,
      checks: b.checks || {},
      daily: b.days?.[d] || { dad: [], mom: [] },
      letters: (b.letters || []).map((l) => ({ ...l, mine: true })),
      members: { dad: r === "dad" ? 1 : 0, mom: r === "mom" ? 1 : 0 },
    });
    setStatus("local");
  }, [setData]);

  const load = useCallback(async () => {
    const d = todayIso();
    setDay(d);
    const r = await api(`/api/state?day=${d}`);
    if (pending.current > 0) return;
    if (r.ok) {
      const s = r.data as {
        family: { due: string; dueSet: boolean; members: Record<Role, number> };
        me: { role: Role };
        checks: Record<string, string>;
        daily: Record<Role, string[]>;
        letters: Letter[];
      };
      setData({ due: s.family.due, dueSet: s.family.dueSet, checks: s.checks, daily: s.daily, letters: s.letters, members: s.family.members });
      setRoleState(s.me.role);
      try {
        localStorage.setItem(LS_ROLE, s.me.role);
      } catch {}
      setStatus("cloud");
    } else if (r.status === 503) {
      loadLocal(d);
    } else if (r.status === 401) {
      setData(EMPTY);
      setRoleState(null);
      setStatus("welcome");
    } else if (statusRef.current === "cloud") {
      setError("اتصال به سرور برقرار نشد؛ اطلاعات ممکنه به‌روز نباشه.");
    } else {
      setStatus("offline");
    }
  }, [loadLocal, setData]);

  useEffect(() => {
    load();
    const onVis = () => {
      if (!document.hidden && (statusRef.current === "cloud" || todayIso() !== day)) load();
    };
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(() => {
      if (!document.hidden && statusRef.current === "cloud") load();
    }, 45000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
    };
  }, [load, day]);

  /** تغییر محلی فوری، بعد ذخیره؛ اگه ذخیره نشد برمی‌گرده و خطا نشون داده می‌شه */
  const mutate = useCallback(
    async (apply: (d: Data) => Data, send: () => Promise<{ ok: boolean; status: number }>, saveLocal?: (d: Data) => void) => {
      const before = dataRef.current;
      const after = apply(before);
      setData(after);
      if (statusRef.current === "local") {
        saveLocal?.(after);
        return;
      }
      pending.current++;
      const r = await send();
      pending.current--;
      if (!r.ok) {
        setData(before);
        setError(messageFor(r.status));
        if (r.status === 401) load();
      }
    },
    [load, setData],
  );

  const persistLocal = useCallback(
    (d: Data, extra?: Partial<LocalBlob>) => {
      const b = readLocal();
      const days = { ...(b.days || {}), [day]: d.daily };
      const cutoff = Date.parse(day) - 60 * 864e5;
      for (const k of Object.keys(days)) if (Date.parse(k) < cutoff) delete days[k];
      if (!writeLocal({ ...b, due: d.due, dueSet: d.dueSet, checks: d.checks, days, letters: d.letters, ...extra })) {
        setError("ذخیره نشد: مرورگر اجازه‌ی ذخیره نمی‌ده.");
      }
    },
    [day],
  );

  const toggleCheck = useCallback(
    (key: string, on: boolean, at?: string) => {
      const value = at || new Date().toISOString();
      mutate(
        (d) => {
          const checks = { ...d.checks };
          if (on) checks[key] = value;
          else delete checks[key];
          return { ...d, checks };
        },
        () => api("/api/checks", "POST", { key, on, at }),
        persistLocal,
      );
    },
    [mutate, persistLocal],
  );

  const toggleDaily = useCallback(
    (key: string, on: boolean) => {
      const r = role || "dad";
      mutate(
        (d) => {
          const mine = d.daily[r].filter((k) => k !== key);
          if (on) mine.push(key);
          return { ...d, daily: { ...d.daily, [r]: mine } };
        },
        () => api("/api/daily", "POST", { day, key, on }),
        persistLocal,
      );
    },
    [mutate, persistLocal, role, day],
  );

  const setDue = useCallback(
    (iso: string) => {
      mutate((d) => ({ ...d, due: iso, dueSet: true }), () => api("/api/family", "PATCH", { due: iso }), persistLocal);
    },
    [mutate, persistLocal],
  );

  const setRole = useCallback(
    async (r: Role) => {
      const prev = role;
      setRoleState(r);
      try {
        localStorage.setItem(LS_ROLE, r);
      } catch {}
      if (statusRef.current === "local") {
        const b = readLocal();
        writeLocal({ ...b, role: r });
        const d = dataRef.current;
        setData({ ...d, daily: b.days?.[day] || d.daily, members: { dad: r === "dad" ? 1 : 0, mom: r === "mom" ? 1 : 0 } });
        return;
      }
      if (statusRef.current !== "cloud") return;
      pending.current++;
      const res = await api("/api/family", "PATCH", { role: r });
      pending.current--;
      if (!res.ok) {
        setRoleState(prev);
        setError(messageFor(res.status));
      } else load();
    },
    [role, day, load, setData],
  );

  const addLetter = useCallback(
    async (body: string) => {
      const r = role || "dad";
      if (statusRef.current === "local") {
        const letter: Letter = { id: `l${Date.now()}`, body, by: r, at: Date.now(), mine: true };
        const next = { ...dataRef.current, letters: [letter, ...dataRef.current.letters] };
        setData(next);
        persistLocal(next);
        return true;
      }
      const res = await api("/api/letters", "POST", { body });
      if (!res.ok) {
        setError(messageFor(res.status));
        return false;
      }
      await load();
      return true;
    },
    [role, persistLocal, load, setData],
  );

  const deleteLetter = useCallback(
    async (id: string) => {
      await mutate((d) => ({ ...d, letters: d.letters.filter((l) => l.id !== id) }), () => api("/api/letters", "DELETE", { id }), persistLocal);
    },
    [mutate, persistLocal],
  );

  const createFamily = useCallback(
    async (r: Role, due: string | null) => {
      const res = await api("/api/family", "POST", { role: r, due });
      if (!res.ok && res.status !== 409) return messageFor(res.status);
      await load();
      return null;
    },
    [load],
  );

  const joinFamily = useCallback(
    async (token: string, r: Role) => {
      const res = await api("/api/join", "POST", { token, role: r });
      if (!res.ok) return messageFor(res.status);
      await load();
      return null;
    },
    [load],
  );

  const createInvite = useCallback(async () => {
    const res = await api("/api/invite", "POST", {});
    if (!res.ok) {
      setError(messageFor(res.status));
      return null;
    }
    return `${location.origin}/join#${(res.data as { token: string }).token}`;
  }, []);

  const logout = useCallback(async () => {
    const res = await api("/api/logout", "POST", {});
    if (!res.ok) {
      setError(messageFor(res.status));
      return;
    }
    await load();
  }, [load]);

  const info = useMemo(() => pregInfo(data.due, day), [data.due, day]);

  const value: Ctx = {
    status,
    error,
    clearError: () => setError(""),
    role,
    day,
    data,
    info,
    setRole,
    setDue,
    toggleCheck,
    toggleDaily,
    addLetter,
    deleteLetter,
    createFamily,
    joinFamily,
    createInvite,
    logout,
    reload: load,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
