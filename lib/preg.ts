import { d2j, isoToJdn, j2d, mod } from "./jalali";

/** ۱۶ هفته و ۱ روز در ۱۷ مهر ۱۴۰۵ (۹ اکتبر ۲۰۲۶) ← موعد ۵ فروردین ۱۴۰۶ */
export const DEFAULT_DUE_ISO = "2027-03-25";

export type Role = "dad" | "mom";
export const ROLE_NAME: Record<Role, string> = { dad: "بابای رایان", mom: "مامان رایان" };
export const ROLE_SHORT: Record<Role, string> = { dad: "بابا", mom: "مامان" };
export function other(r: Role): Role {
  return r === "dad" ? "mom" : "dad";
}

export type Stage = "t2" | "t3" | "late" | "post";

export type PregInfo = {
  today: number;
  due: number;
  left: number;
  ga: number;
  week: number;
  day: number;
  nowruz: number;
  nowruzYear: number;
  born: boolean;
  ageDays: number;
  stage: Stage;
};

export function pregInfo(dueIso: string, todayIsoStr: string): PregInfo {
  const today = isoToJdn(todayIsoStr);
  const due = isoToJdn(dueIso);
  const left = due - today;
  const ga = 280 - left;
  const week = Math.floor(ga / 7);
  const tj = d2j(today);
  const nowruz = j2d(tj.jy + 1, 1, 1);
  const born = left < 0;
  const stage: Stage = born ? "post" : week >= 37 ? "late" : week >= 28 ? "t3" : "t2";
  return { today, due, left, ga, week, day: mod(ga, 7), nowruz, nowruzYear: tj.jy + 1, born, ageDays: born ? -left : 0, stage };
}

/** از سن بارداری امروز، تاریخ موعد رو حساب می‌کنه */
export function dueFromGa(todayIsoStr: string, weeks: number, days: number) {
  return isoToJdn(todayIsoStr) + 280 - (weeks * 7 + days);
}

export function clampWeek(w: number, min = 14, max = 41) {
  return Math.min(Math.max(w, min), max);
}
