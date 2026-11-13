export type Priority = "low" | "medium" | "high";
export type SessionType = "work" | "short-break" | "long-break";
export type NavItem = "today" | "upcoming" | "completed" | "statistics" | "settings";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  /** YYYY-MM-DD */
  dueDate: string;
  /** HH:MM */
  dueTime: string;
  completed: boolean;
  /** ISO timestamp de quando foi concluída */
  completedAt?: string;
}

export type NewTask = Pick<Task, "title" | "priority" | "dueDate" | "dueTime">;

export interface DayActivity {
  sessions: number;
  minutes: number;
}

/** Pomodoros concluídos por dia, chave YYYY-MM-DD */
export type History = Record<string, DayActivity>;

export interface Settings {
  name: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsPerCycle: number;
  autoStartBreaks: boolean;
  sound: boolean;
  notifications: boolean;
}
