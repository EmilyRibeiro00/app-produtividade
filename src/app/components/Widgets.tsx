import { BarChart2, Calendar, CheckSquare, Clock, Flame, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardTitle } from "./Card";
import type { History } from "../types";
import { heatClass, HEAT_CLASSES } from "../constants";
import { dateKey, dayOfYear, weekdayInitials } from "../lib/date";
import { useT } from "../lib/i18n";

export const formatMinutes = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${Math.round(min)}m`);

export function StatTile({ label, value, Icon, tone = "primary" }: { label: string; value: string | number; Icon: LucideIcon; tone?: "primary" | "accent" }) {
  return (
    <div className="rounded-xl p-3 bg-sidebar border border-line">
      <Icon size={12} className={`mb-2 ${tone === "primary" ? "text-primary-soft" : "text-accent-soft"}`} aria-hidden="true" />
      <p className="font-semibold text-lg leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-dim">{label}</p>
    </div>
  );
}

export function DailyStats({ focusMinutes, pomodoros, completed, total }: { focusMinutes: number; pomodoros: number; completed: number; total: number }) {
  const t = useT();
  const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Card>
      <CardTitle icon={BarChart2}>{t.daily.title}</CardTitle>
      <div className="grid grid-cols-2 gap-2">
        <StatTile label={t.daily.focusTime} value={formatMinutes(focusMinutes)} Icon={Clock} />
        <StatTile label={t.daily.tasksDone} value={`${completed}/${total}`} Icon={CheckSquare} tone="accent" />
        <StatTile label={t.daily.pomodoros} value={pomodoros} Icon={Flame} />
        <StatTile label={t.daily.productivity} value={`${productivity}%`} Icon={TrendingUp} tone="accent" />
      </div>
    </Card>
  );
}

export function QuoteCard() {
  const t = useT();
  const quote = t.quotes[dayOfYear() % t.quotes.length];
  return (
    <Card>
      <figure className="flex gap-2.5">
        <span className="text-primary-soft text-3xl leading-[0.8] font-serif" aria-hidden="true">
          “
        </span>
        <div>
          <blockquote className="leading-relaxed mb-1.5 text-xs text-muted-foreground">{quote.text}</blockquote>
          <figcaption className="text-[11px] text-dim">— {quote.author}</figcaption>
        </div>
      </figure>
    </Card>
  );
}

/** Mapa de calor do mês atual, alinhado ao dia da semana (semana começa na segunda) */
export function ActivityHeatmap({ history }: { history: History }) {
  const t = useT();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = now.getDate();

  return (
    <Card>
      <CardTitle
        icon={Calendar}
        aside={<span className="text-[11px] text-dim">{now.toLocaleDateString(t.locale, { month: "short", year: "numeric" })}</span>}
      >
        {t.heatmap.title}
      </CardTitle>

      <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden="true">
        {weekdayInitials(t).map((d, i) => (
          <div key={i} className="text-center text-[9px] text-dim">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="list" aria-label={t.heatmap.label}>
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const sessions = history[dateKey(new Date(year, month, day))]?.sessions ?? 0;
          const label = t.heatmap.day(day, sessions);
          return (
            <div
              key={day}
              role="listitem"
              aria-label={label}
              title={label}
              className={`aspect-square rounded-sm ${heatClass(sessions)} ${day === today ? "outline outline-1 outline-offset-1 outline-primary-soft" : ""} ${day > today ? "opacity-50" : ""}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1 mt-2.5" aria-hidden="true">
        <span className="text-[10px] text-dim">{t.heatmap.less}</span>
        {HEAT_CLASSES.map((c) => (
          <div key={c} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-dim">{t.heatmap.more}</span>
      </div>
    </Card>
  );
}
