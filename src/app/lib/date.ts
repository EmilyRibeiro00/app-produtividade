const pad = (n: number) => String(n).padStart(2, "0");

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

export const formatLongDate = (d = new Date()) =>
  d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

/** "Today", "Tomorrow", "Yesterday" ou "Nov 20" */
export const formatRelativeDay = (key: string) => {
  const now = new Date();
  if (key === dateKey(now)) return "Today";
  if (key === dateKey(addDays(now, 1))) return "Tomorrow";
  if (key === dateKey(addDays(now, -1))) return "Yesterday";
  return parseKey(key).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatClock = (seconds: number) => `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

export const getGreeting = (name: string) => {
  const h = new Date().getHours();
  const who = name.trim();
  const suffix = who ? `, ${who}` : "";
  if (h < 5) return `Still at it${suffix}`;
  if (h < 12) return `Good morning${suffix}`;
  if (h < 17) return `Good afternoon${suffix}`;
  if (h < 21) return `Good evening${suffix}`;
  return `Good night${suffix}`;
};

export const dayOfYear = (d = new Date()) =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
