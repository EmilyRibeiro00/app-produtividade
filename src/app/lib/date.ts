import type { Dict } from "./i18n";

const pad =(n: number) => String(n).padStart(2, "0");

/** Data local no formato YYYY-MM-DD */
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = () => dateKey(new Date());

export const parseKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/** Horário local atual no formato HH:MM */
export const nowHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatLongDate = (t: Dict, d = new Date()) =>
  capitalize(d.toLocaleDateString(t.locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));

export const formatShortDate = (t: Dict, key: string) =>
  parseKey(key).toLocaleDateString(t.locale, { month: "short", day: "numeric" });

/** "Today"/"Hoje", "Tomorrow"/"Amanhã", "Yesterday"/"Ontem" ou "Nov 20"/"20 de nov." */
export const formatRelativeDay = (t: Dict, key: string) => {
  const now = new Date();
  if (key === dateKey(now)) return t.relDay.today;
  if (key === dateKey(addDays(now, 1))) return t.relDay.tomorrow;
  if (key === dateKey(addDays(now, -1))) return t.relDay.yesterday;
  return formatShortDate(t, key);
};

/** Iniciais dos dias da semana, começando na segunda */
export const weekdayInitials = (t: Dict) =>
  Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(t.locale, { weekday: "narrow" }).toUpperCase(),
  );

export const formatClock = (seconds: number) => `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

export const getGreeting = (t: Dict, name: string) => {
  const h = new Date().getHours();
  const who = name.trim();
  const suffix = who ? `, ${who}` : "";
  const g = t.greeting;
  if (h < 5) return `${g.lateNight}${suffix}`;
  if (h < 12) return `${g.morning}${suffix}`;
  if (h < 17) return `${g.afternoon}${suffix}`;
  if (h < 21) return `${g.evening}${suffix}`;
  return `${g.night}${suffix}`;
};

export const dayOfYear = (d = new Date()) =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
