import { useEffect, useRef, useState } from "react";
import type { SessionType, Settings } from "../types";

/**
 * Timer Pomodoro baseado no relógio real (não atrasa em abas em segundo plano).
 * `onSessionEnd(type, completed, minutes)` é chamado ao concluir ou pular uma sessão.
 */
export function usePomodoro(
  settings: Settings,
  onSessionEnd: (type: SessionType, completed: boolean, minutes: number) => void,
) {
  const durationOf = (type: SessionType) =>
    60 *
    (type === "work"
      ? settings.workMinutes
      : type === "short-break"
      ? settings.shortBreakMinutes
      : settings.longBreakMinutes);

  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [currentSession, setCurrentSession] = useState(1);
  const [timeLeft, setTimeLeft] = useState(() => durationOf("work"));
  const [isRunning, setIsRunning] = useState(false);
  const duration = durationOf(sessionType);

  const onEndRef = useRef(onSessionEnd);
  onEndRef.current = onSessionEnd;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Durações alteradas nas configurações: aplica se o timer estiver parado
  useEffect(() => {
    if (!isRunning) setTimeLeft(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  // Ciclo menor nas configurações: mantém a sessão atual dentro do limite
  useEffect(() => {
    setCurrentSession((c) => Math.min(c, settings.sessionsPerCycle));
  }, [settings.sessionsPerCycle]);

  // Mesma regra para concluir e para pular: após a última sessão do ciclo vem a pausa longa
  const advance = (completed: boolean) => {
    const finished = sessionType;
    const elapsedMinutes = Math.round((duration - timeLeft) / 60);
    let next: SessionType;
    if (finished === "work") {
      next = currentSession >= settings.sessionsPerCycle ? "long-break" : "short-break";
    } else {
      next = "work";
      setCurrentSession(finished === "long-break" ? 1 : currentSession + 1);
    }
    setSessionType(next);
    setTimeLeft(durationOf(next));
    setIsRunning(completed && settings.autoStartBreaks && next !== "work");
    onEndRef.current(finished, completed, completed ? duration / 60 : elapsedMinutes);
  };

  // Tique do relógio
  useEffect(() => {
    if (!isRunning) return;
    const endAt = Date.now() + timeLeftRef.current * 1000;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) setIsRunning(false);
    }, 250);
    return () => clearInterval(id);
  }, [isRunning]);

  // Fim natural da sessão
  useEffect(() => {
    if (!isRunning && timeLeft === 0) advance(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft]);

  return {
    sessionType,
    currentSession,
    sessionsPerCycle: settings.sessionsPerCycle,
    timeLeft,
    duration,
    isRunning,
    toggle: () => setIsRunning((r) => !r),
    reset: () => {
      setIsRunning(false);
      setTimeLeft(duration);
    },
    skip: () => advance(false),
  };
}

export type Pomodoro = ReturnType<typeof usePomodoro>;
