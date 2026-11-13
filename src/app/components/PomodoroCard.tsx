import { Pause, Play, RotateCcw, SkipForward, Target } from "lucide-react";
import { Card, CardTitle } from "./Card";
import { SESSION_LABEL, type Pomodoro } from "../hooks/usePomodoro";
import { formatClock } from "../lib/date";

const SIZE = 184;
const C = SIZE / 2;
const RADIUS = 86;
const CIRC = 2 * Math.PI * RADIUS;

export function PomodoroCard({ pomodoro, onToggle }: { pomodoro: Pomodoro; onToggle: () => void }) {
  const { sessionType, currentSession, sessionsPerCycle, timeLeft, duration, isRunning, reset, skip } = pomodoro;
  const isWork = sessionType === "work";
  const progress = Math.min(1, Math.max(0, 1 - timeLeft / duration));

  return (
    <Card>
      <CardTitle
        icon={Target}
        aside={
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isWork ? "bg-primary/20 text-priority-high" : "bg-accent/40 text-accent-soft"}`}>
            {SESSION_LABEL[sessionType]}
          </span>
        }
      >
        Pomodoro
      </CardTitle>

      <div className="flex justify-center mb-4">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
            <circle cx={C} cy={C} r={RADIUS + 8} fill="none" className="stroke-muted" strokeWidth="1" />
            <circle cx={C} cy={C} r={RADIUS} fill="none" className="stroke-secondary" strokeWidth="5" />
            <circle
              cx={C}
              cy={C}
              r={RADIUS}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              className={isWork ? "stroke-primary-soft text-primary" : "stroke-accent-soft text-accent-soft"}
              style={{
                transition: isRunning ? "stroke-dashoffset 0.25s linear" : "stroke-dashoffset 0.3s ease",
                filter: "drop-shadow(0 0 6px currentColor)",
              }}
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={C + (RADIUS - 12) * Math.cos(a)}
                  y1={C + (RADIUS - 12) * Math.sin(a)}
                  x2={C + (RADIUS - 16) * Math.cos(a)}
                  y2={C + (RADIUS - 16) * Math.sin(a)}
                  className="stroke-border"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span role="timer" aria-live="off" className="font-light text-4xl tracking-tighter tabular-nums leading-none">
              {formatClock(timeLeft)}
            </span>
            <span className="mt-1.5 text-[11px] text-dim">
              Session {currentSession} of {sessionsPerCycle}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-5" aria-hidden="true">
        {Array.from({ length: sessionsPerCycle }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSession - 1 ? "w-5 bg-primary-soft" : i < currentSession - 1 ? "w-2 bg-heat-2" : "w-2 bg-line"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          aria-label="Reset timer"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-surface-2 text-dim hover:border-line-strong hover:text-soft transition-colors"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={onToggle}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isRunning
              ? "bg-surface-2 border border-border"
              : "bg-gradient-to-br from-primary to-primary-strong shadow-[0_0_28px_rgb(139_30_45/0.45)]"
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <button
          onClick={skip}
          aria-label="Skip session"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-surface-2 text-dim hover:border-line-strong hover:text-soft transition-colors"
        >
          <SkipForward size={13} />
        </button>
      </div>
    </Card>
  );
}
