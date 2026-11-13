import { BarChart2, CheckSquare, Clock, Flame, ListTodo, Trophy } from "lucide-react";
import { Card, CardTitle } from "./Card";
import { ActivityHeatmap, StatTile, formatMinutes } from "./Widgets";
import type { History, Task } from "../types";
import { PRIORITIES, PRIORITY_CONFIG } from "../constants";
import { addDays, dateKey, formatRelativeDay, formatShortDate } from "../lib/date";
import { useT } from "../lib/i18n";

const CHART_DAYS = 14;

/** Dias seguidos com pelo menos 1 sessão (conta a partir de ontem se hoje ainda está zerado) */
const currentStreak = (history: History) => {
  let d = new Date();
  if (!history[dateKey(d)]?.sessions) d = addDays(d, -1);
  let streak = 0;
  while (history[dateKey(d)]?.sessions) {
    streak++;
    d = addDays(d, -1);
  }
  return streak;
};

export function StatisticsView({ history, tasks, today }: { history: History; tasks: Task[]; today: string }) {
  const t = useT();
  const days = Object.values(history);
  const totalSessions = days.reduce((s, v) => s + v.sessions, 0);
  const totalMinutes = days.reduce((s, v) => s + v.minutes, 0);
  const best = days.reduce((b, v) => Math.max(b, v.sessions), 0);
  const streak = currentStreak(history);

  const completed = tasks.filter((x) => x.completed).length;
  const pending = tasks.filter((x) => !x.completed);
  const overdue = pending.filter((x) => x.dueDate < today).length;
  const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatTile label={t.stats.totalPomodoros} value={totalSessions} Icon={Flame} />
        <StatTile label={t.stats.totalFocus} value={formatMinutes(totalMinutes)} Icon={Clock} tone="accent" />
        <StatTile label={`${t.stats.streak}${best ? t.stats.best(best) : ""}`} value={streak} Icon={Trophy} />
        <StatTile label={t.stats.tasksCompleted} value={`${completed} (${rate}%)`} Icon={CheckSquare} tone="accent" />
      </div>

      <Card>
        <CardTitle icon={BarChart2} aside={<span className="text-[11px] text-dim">{t.stats.lastDays(CHART_DAYS)}</span>}>
          {t.stats.focusSessions}
        </CardTitle>
        <SessionsChart history={history} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle icon={ListTodo} aside={overdue > 0 ? <span className="text-[11px] text-priority-high">{t.stats.overdue(overdue)}</span> : undefined}>
            {t.stats.pendingByPriority}
          </CardTitle>
          <PriorityBreakdown tasks={pending} />
        </Card>
        <ActivityHeatmap history={history} />
      </div>
    </div>
  );
}

/** Barras verticais, uma série: pomodoros por dia. Tooltip no hover de cada coluna; tabela para leitores de tela. */
function SessionsChart({ history }: { history: History }) {
  const t = useT();
  const now = new Date();
  const data = Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = addDays(now, i - (CHART_DAYS - 1));
    const key = dateKey(d);
    return {
      key,
      weekday: d.toLocaleDateString(t.locale, { weekday: "narrow" }).toUpperCase(),
      sessions: history[key]?.sessions ?? 0,
      minutes: history[key]?.minutes ?? 0,
    };
  });
  const max = Math.max(4, ...data.map((d) => d.sessions));
  const isEmpty = data.every((d) => d.sessions === 0);

  return (
    <div>
      <div className="relative">
        <span className="absolute -top-1 left-0 text-[10px] text-dim tabular-nums">{max}</span>
        <div className="absolute top-1 left-0 right-0 border-t border-dashed border-line" aria-hidden="true" />
        <div className="flex items-end gap-0.5 h-36 pt-4 pl-5 border-b border-border" aria-hidden="true">
          {data.map((d, i) => (
            <div key={d.key} className="group relative flex-1 h-full flex items-end justify-center rounded-sm hover:bg-muted/60">
              <div
                className="w-full max-w-7 rounded-t bg-primary-soft transition-[height] duration-300 group-hover:brightness-110"
                style={{ height: `${(d.sessions / max) * 100}%`, minHeight: d.sessions > 0 ? 3 : 0 }}
              />
              <div
                className={`pointer-events-none absolute -top-2 -translate-y-full z-10 hidden group-hover:block whitespace-nowrap rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] shadow-lg ${
                  i < 3 ? "left-0" : i > CHART_DAYS - 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                <p className="text-muted-foreground">{formatRelativeDay(t, d.key)}</p>
                <p className="font-medium text-foreground">
                  {t.stats.sessions(d.sessions)} · {formatMinutes(d.minutes)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {isEmpty && <p className="absolute inset-0 flex items-center justify-center text-xs text-dim">{t.stats.chartEmpty}</p>}
      </div>
      <div className="flex gap-0.5 pl-5 mt-1.5" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.key} className={`flex-1 text-center text-[10px] ${i === CHART_DAYS - 1 ? "text-foreground font-medium" : "text-dim"}`}>
            {d.weekday}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{t.stats.tableCaption(CHART_DAYS)}</caption>
        <thead>
          <tr>
            <th>{t.stats.colDate}</th>
            <th>{t.stats.colSessions}</th>
            <th>{t.stats.colMinutes}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{formatShortDate(t, d.key)}</td>
              <td>{d.sessions}</td>
              <td>{d.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriorityBreakdown({ tasks }: { tasks: Task[] }) {
  const t = useT();
  if (tasks.length === 0) return <p className="py-6 text-center text-xs text-dim">{t.stats.nothingPending}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {PRIORITIES.map((p) => {
        const count = tasks.filter((x) => x.priority === p).length;
        const pct = Math.round((count / tasks.length) * 100);
        return (
          <li key={p}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-soft">{t.priorityFull[p]}</span>
              <span className="text-dim tabular-nums">
                {count} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${PRIORITY_CONFIG[p].bar}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
