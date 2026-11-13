import { useEffect, useState } from "react";
import type { History, NavItem, NewTask, SessionType, Settings, Task } from "./types";
import { DEFAULT_SETTINGS, makeInitialTasks, migrateHistory, migrateSettings, migrateTasks } from "./constants";
import { usePersistentState } from "./lib/storage";
import { addDays, dateKey, nowHHMM, todayKey } from "./lib/date";
import { playChime, requestNotificationPermission, sendNotification } from "./lib/notify";
import { usePomodoro } from "./hooks/usePomodoro";
import { MobileNav, Sidebar } from "./components/Navigation";
import { Header } from "./components/Header";
import { TaskComposer } from "./components/TaskComposer";
import { TaskList } from "./components/TaskList";
import { PomodoroCard } from "./components/PomodoroCard";
import { ActivityHeatmap, DailyStats, QuoteCard } from "./components/Widgets";
import { StatisticsView } from "./components/StatisticsView";
import { SettingsView } from "./components/SettingsView";

const byDue = (a: Task, b: Task) => a.dueDate.localeCompare(b.dueDate) || a.dueTime.localeCompare(b.dueTime);
const byCompletedDesc = (a: Task, b: Task) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "");

/** Data e hora atuais, atualizadas a cada 30s (atrasos e virada do dia) */
function useClock() {
  const [clock, setClock] = useState(() => ({ today: todayKey(), now: nowHHMM() }));
  useEffect(() => {
    const id = window.setInterval(() => setClock({ today: todayKey(), now: nowHHMM() }), 30_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const { today, now } = useClock();

  const [tasks, setTasks] = usePersistentState<Task[]>("nocturne.tasks", makeInitialTasks, migrateTasks);
  const [history, setHistory] = usePersistentState<History>("nocturne.history", {}, migrateHistory);
  const [settings, setSettings] = usePersistentState<Settings>("nocturne.settings", DEFAULT_SETTINGS, migrateSettings);

  // ── Pomodoro ──
  const handleSessionEnd = (type: SessionType, completed: boolean, minutes: number) => {
    if (type === "work" && minutes > 0) {
      const key = todayKey();
      setHistory((h) => {
        const day = h[key] ?? { sessions: 0, minutes: 0 };
        return { ...h, [key]: { sessions: day.sessions + (completed ? 1 : 0), minutes: day.minutes + minutes } };
      });
    }
    if (!completed) return;
    if (settings.sound) playChime();
    if (settings.notifications) {
      sendNotification(type === "work" ? "Focus session complete. Time for a break." : "Break is over. Back to focus.");
    }
  };
  const pomodoro = usePomodoro(settings, handleSessionEnd);
  const togglePomodoro = () => {
    if (!pomodoro.isRunning && settings.notifications) requestNotificationPermission();
    pomodoro.toggle();
  };

  // ── Tarefas ──
  const addTask = (t: NewTask) => setTasks((p) => [{ ...t, id: crypto.randomUUID?.() ?? Date.now().toString(), completed: false }, ...p]);
  const toggleTask = (id: string) =>
    setTasks((p) =>
      p.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: t.completed ? undefined : new Date().toISOString() } : t)),
    );
  const deleteTask = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));
  const renameTask = (id: string, title: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, title } : t)));
  const clearCompleted = () => setTasks((p) => p.filter((t) => !t.completed));
  const resetAll = () => {
    setTasks([]);
    setHistory({});
    setSettings(DEFAULT_SETTINGS);
    pomodoro.reset();
  };

  const navigate = (id: NavItem) => {
    setActiveNav(id);
    setSearchQuery("");
  };

  // ── Dados derivados ──
  const pending = tasks.filter((t) => !t.completed);
  const todayTasks = pending.filter((t) => t.dueDate <= today).sort(byDue);
  const upcomingTasks = pending.filter((t) => t.dueDate > today).sort(byDue);
  const completedTasks = tasks.filter((t) => t.completed).sort(byCompletedDesc);

  const dueToday = tasks.filter((t) => t.dueDate === today);
  const todayActivity = history[today] ?? { sessions: 0, minutes: 0 };

  const counts = { today: todayTasks.length, upcoming: upcomingTasks.length, completed: completedTasks.length };

  const query = searchQuery.trim().toLowerCase();
  const isTaskView = query !== "" || activeNav === "today" || activeNav === "upcoming" || activeNav === "completed";
  const listProps = { today, now, onToggle: toggleTask, onDelete: deleteTask, onRename: renameTask };

  const renderContent = () => {
    if (query) {
      const results = tasks.filter((t) => t.title.toLowerCase().includes(query)).sort(byDue);
      return <TaskList {...listProps} title={`Results for “${searchQuery.trim()}”`} tasks={results} showDate emptyText="No tasks match your search." />;
    }
    switch (activeNav) {
      case "today":
        return (
          <>
            <TaskComposer key="today" onAdd={addTask} />
            <TaskList {...listProps} title="Today" tasks={todayTasks} emptyText="No tasks here. The void awaits." />
          </>
        );
      case "upcoming":
        return (
          <>
            <TaskComposer key="upcoming" onAdd={addTask} defaultDate={dateKey(addDays(new Date(), 1))} />
            <TaskList {...listProps} title="Upcoming" tasks={upcomingTasks} showDate emptyText="Nothing scheduled ahead." />
          </>
        );
      case "completed":
        return (
          <TaskList
            {...listProps}
            title="Completed"
            tasks={completedTasks}
            showDate
            emptyText="Nothing completed yet."
            action={
              completedTasks.length > 0 && (
                <button onClick={clearCompleted} className="text-[11px] text-dim hover:text-priority-high transition-colors">
                  Clear all
                </button>
              )
            }
          />
        );
      case "statistics":
        return <StatisticsView history={history} tasks={tasks} today={today} />;
      case "settings":
        return (
          <SettingsView
            settings={settings}
            onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
            completedCount={completedTasks.length}
            onClearCompleted={clearCompleted}
            onResetAll={resetAll}
          />
        );
    }
  };

  const pomodoroCard = <PomodoroCard pomodoro={pomodoro} onToggle={togglePomodoro} />;
  const dailyStats = (
    <DailyStats
      focusMinutes={todayActivity.minutes}
      pomodoros={todayActivity.sessions}
      completed={dueToday.filter((t) => t.completed).length}
      total={dueToday.length}
    />
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <Sidebar active={activeNav} onNavigate={navigate} counts={counts} name={settings.name} pomodorosToday={todayActivity.sessions} />

      <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header name={settings.name} search={searchQuery} onSearch={setSearchQuery} onOpenSettings={() => navigate("settings")} />

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6 pb-24 md:pb-6">
          {/* Em telas menores o painel direito vira um bloco no topo das listas */}
          {isTaskView && (
            <div className="xl:hidden grid gap-3 md:grid-cols-2 mb-6">
              {pomodoroCard}
              {dailyStats}
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      <aside className="hidden xl:flex flex-col gap-3 w-72 h-full border-l border-border bg-sidebar shrink-0 overflow-y-auto no-scrollbar px-4 py-5">
        {pomodoroCard}
        {dailyStats}
        <QuoteCard />
        {activeNav !== "statistics" && <ActivityHeatmap history={history} />}
      </aside>

      <MobileNav active={activeNav} onNavigate={navigate} counts={counts} />
    </div>
  );
}
