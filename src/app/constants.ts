import type { DayActivity, History, Priority, Settings, Task } from "./types";
import { todayKey, dateKey, addDays } from "./lib/date";

export const PRIORITIES: Priority[] = ["high", "medium", "low"];

// Classes completas (o Tailwind precisa encontrá-las literalmente no código)
export const PRIORITY_CONFIG: Record<Priority, { label: string; badge: string; selected: string; bar: string }> = {
  high: {
    label: "High",
    badge: "bg-priority-high/15 text-priority-high",
    selected: "bg-priority-high/15 text-priority-high border-priority-high/40",
    bar: "bg-priority-high",
  },
  medium: {
    label: "Med",
    badge: "bg-priority-medium/15 text-priority-medium",
    selected: "bg-priority-medium/15 text-priority-medium border-priority-medium/40",
    bar: "bg-priority-medium",
  },
  low: {
    label: "Low",
    badge: "bg-priority-low/15 text-priority-low",
    selected: "bg-priority-low/15 text-priority-low border-priority-low/40",
    bar: "bg-priority-low",
  },
};

export const HEAT_CLASSES = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];
export const heatClass = (sessions: number) => HEAT_CLASSES[Math.min(Math.max(sessions, 0), 4)];

export const DEFAULT_SETTINGS: Settings = {
  name: "Night Owl",
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsPerCycle: 4,
  autoStartBreaks: false,
  sound: true,
  notifications: true,
};

export const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus is not about saying yes. It is about saying no.", author: "Steve Jobs" },
  { text: "Either write something worth reading or do something worth writing.", author: "Benjamin Franklin" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
  { text: "Silence is a source of great strength.", author: "Lao Tzu" },
  { text: "Work is the best method devised for killing time.", author: "William Feather" },
];

/** Tarefas de exemplo exibidas só no primeiro acesso */
export const makeInitialTasks = (): Task[] => {
  const today = todayKey();
  const tomorrow = dateKey(addDays(new Date(), 1));
  return [
    { id: "1", title: "Review quarterly report and prepare summary", priority: "high", dueDate: today, dueTime: "09:00", completed: false },
    { id: "2", title: "Update design system documentation", priority: "medium", dueDate: today, dueTime: "11:30", completed: false },
    { id: "3", title: "Morning standup with the engineering team", priority: "high", dueDate: today, dueTime: "10:00", completed: true, completedAt: new Date().toISOString() },
    { id: "4", title: "Refine the project roadmap for Q3", priority: "low", dueDate: tomorrow, dueTime: "14:00", completed: false },
    { id: "5", title: "Code review: authentication module", priority: "high", dueDate: today, dueTime: "15:30", completed: false },
    { id: "6", title: "Write release notes for v2.4", priority: "medium", dueDate: tomorrow, dueTime: "17:00", completed: false },
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
