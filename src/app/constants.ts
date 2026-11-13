import type { DayActivity, History, Priority, Settings, Task } from "./types";
import { todayKey, dateKey, addDays } from "./lib/date";
import { DICTIONARIES, detectLang } from "./lib/i18n";

export const PRIORITIES: Priority[] = ["high", "medium", "low"];

// Classes completas (o Tailwind precisa encontrá-las literalmente no código)
export const PRIORITY_CONFIG: Record<Priority, { badge: string; selected: string; bar: string }> = {
  high: {
    badge: "bg-priority-high/15 text-priority-high",
    selected: "bg-priority-high/15 text-priority-high border-priority-high/40",
    bar: "bg-priority-high",
  },
  medium: {
    badge: "bg-priority-medium/15 text-priority-medium",
    selected: "bg-priority-medium/15 text-priority-medium border-priority-medium/40",
    bar: "bg-priority-medium",
  },
  low: {
    badge: "bg-priority-low/15 text-priority-low",
    selected: "bg-priority-low/15 text-priority-low border-priority-low/40",
    bar: "bg-priority-low",
  },
};

export const HEAT_CLASSES = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];
export const heatClass = (sessions: number) => HEAT_CLASSES[Math.min(Math.max(sessions, 0), 4)];

export const DEFAULT_SETTINGS: Settings = {
  language: detectLang(),
  theme: "dark",
  name: "Night Owl",
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsPerCycle: 4,
  autoStartBreaks: false,
  sound: true,
  notifications: true,
};

/** Tarefas de exemplo exibidas só no primeiro acesso, no idioma do navegador */
export const makeInitialTasks = (): Task[] => {
  const titles = DICTIONARIES[detectLang()].sampleTasks;
  const today = todayKey();
  const tomorrow = dateKey(addDays(new Date(), 1));
  return [
    { id: "1", title: titles[0], priority: "high", dueDate: today, dueTime: "09:00", completed: false },
    { id: "2", title: titles[1], priority: "medium", dueDate: today, dueTime: "11:30", completed: false },
    { id: "3", title: titles[2], priority: "high", dueDate: today, dueTime: "10:00", completed: true, completedAt: new Date().toISOString() },
    { id: "4", title: titles[3], priority: "low", dueDate: tomorrow, dueTime: "14:00", completed: false },
    { id: "5", title: titles[4], priority: "high", dueDate: today, dueTime: "15:30", completed: false },
    { id: "6", title: titles[5], priority: "medium", dueDate: tomorrow, dueTime: "17:00", completed: false },
  ];
};

// ── Migrações de dados salvos por versões anteriores ──

export const migrateTasks = (stored: unknown): Task[] => {
  if (!Array.isArray(stored)) return makeInitialTasks();
  return stored.map((t: Partial<Task>) => ({
    id: String(t.id ?? Date.now()),
    title: String(t.title ?? ""),
    priority: t.priority ?? "medium",
    dueDate: t.dueDate ?? todayKey(),
    dueTime: t.dueTime ?? "12:00",
    completed: Boolean(t.completed),
    completedAt: t.completedAt,
  }));
};

export const migrateHistory = (stored: unknown): History => {
  if (!stored || typeof stored !== "object") return {};
  const out: History = {};
  for (const [key, v] of Object.entries(stored as Record<string, number | DayActivity>)) {
    // versão anterior guardava só a contagem de sessões de 25 min
    out[key] = typeof v === "number" ? { sessions: v, minutes: v * 25 } : v;
  }
  return out;
};

export const migrateSettings = (stored: unknown): Settings => ({
  ...DEFAULT_SETTINGS,
  ...(stored && typeof stored === "object" ? (stored as Partial<Settings>) : {}),
});
