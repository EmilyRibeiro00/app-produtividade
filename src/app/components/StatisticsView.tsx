import { BarChart2, CheckSquare, Clock, Flame, ListTodo, Trophy } from "lucide-react";
import { Card, CardTitle } from "./Card";
import { ActivityHeatmap, StatTile, formatMinutes } from "./Widgets";
import type { History, Task } from "../types";
import { PRIORITIES, PRIORITY_CONFIG } from "../constants";
import { addDays, dateKey, formatRelativeDay, parseKey } from "../lib/date";

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
  const days = Object.entries(history);
  const totalSessions = days.reduce((s, [, v]) => s + v.sessions, 0);
  const totalMinutes = days.reduce((s, [, v]) => s + v.minutes, 0);
  const best = days.reduce<[string, number] | null>((b, [k, v]) => (!b || v.sessions > b[1] ? [k, v.sessions] : b), null);
  const streak = currentStreak(history);

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed);
  const overdue = pending.filter((t) => t.dueDate < today).length;
  const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatTile label="Total pomodoros" value={totalSessions} Icon={Flame} />
        <StatTile label="Total focus time" value={formatMinutes(totalMinutes)} Icon={Clock} tone="accent" />
        <StatTile label={`Day streak${best ? ` · best ${best[1]}/day` : ""}`} value={streak} Icon={Trophy} />
        <StatTile label="Tasks completed" value={`${completed} (${rate}%)`} Icon={CheckSquare} tone="accent" />
      </div>

      <Card>
        <CardTitle icon={BarChart2} aside={<span className="text-[11px] text-dim">Last {CHART_DAYS} days</span>}>
          Focus sessions
        </CardTitle>
        <SessionsChart history={history} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle icon={ListTodo} aside={overdue > 0 ? <span className="text-[11px] text-priority-high">{overdue} overdue</span> : undefined}>
            Pending by priority
          </CardTitle>
          <PriorityBreakdown tasks={pending} />
        </Card>
        <ActivityHeatmap history={history} />
      </div>
    </div>
  );
}

/** Barras verticais, uma série: pomodoros por dia. Tooltip no hover/foco de cada coluna. */
function SessionsChart({ history }: { history: History }) {
  const now = new Date();
  const data = Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = addDays(now, i - (CHART_DAYS - 1));
    const key = dateKey(d);
    return {
      key,
      weekday: d.toLocaleDateString("en-US", { weekday: "narrow" }),
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
                className="w-full max-w-7 rounded-t bg-primary-soft transition-[height] duration-300 group-hover:brightness-125"
                style={{ height: `${(d.sessions / max) * 100}%`, minHeight: d.sessions > 0 ? 3 : 0 }}
              />
              <div
                className={`pointer-events-none absolute -top-2 -translate-y-full z-10 hidden group-hover:block whitespace-nowrap rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] shadow-lg ${
                  i < 3 ? "left-0" : i > CHART_DAYS - 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                <p className="text-muted-foreground">{formatRelativeDay(d.key)}</p>
                <p className="font-medium text-foreground">
                  {d.sessions} session{d.sessions === 1 ? "" : "s"} · {formatMinutes(d.minutes)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-dim">Complete a pomodoro to see it here.</p>
        )}
      </div>
      <div className="flex gap-0.5 pl-5 mt-1.5" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.key} className={`flex-1 text-center text-[10px] ${i === CHART_DAYS - 1 ? "text-foreground font-medium" : "text-dim"}`}>
            {d.weekday}
          </span>
        ))}
      </div>

      {/* Versão em tabela para leitores de tela */}
      <table className="sr-only">
        <caption>Focus sessions in the last {CHART_DAYS} days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Sessions</th>
            <th>Focus minutes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{parseKey(d.key).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
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
  if (tasks.length === 0) return <p className="py-6 text-center text-xs text-dim">Nothing pending. The void is calm.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {PRIORITIES.map((p) => {
        const count = tasks.filter((t) => t.priority === p).length;
        const pct = Math.round((count / tasks.length) * 100);
        return (
          <li key={p}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-soft">{PRIORITY_CONFIG[p].label === "Med" ? "Medium" : PRIORITY_CONFIG[p].label}</span>
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
