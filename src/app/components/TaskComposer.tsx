import { useState } from "react";
import { Calendar, Clock, Plus } from "lucide-react";
import type { NewTask, Priority } from "../types";
import { PRIORITIES, PRIORITY_CONFIG } from "../constants";
import { todayKey } from "../lib/date";

export function TaskComposer({ onAdd, defaultDate }: { onAdd: (task: NewTask) => void; defaultDate?: string }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(defaultDate ?? todayKey());
  const [dueTime, setDueTime] = useState("12:00");

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority, dueDate: dueDate || todayKey(), dueTime: dueTime || "12:00" });
    setTitle("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="rounded-2xl border border-border bg-card p-4 mb-6 focus-within:border-primary/70 transition-colors"
    >
      <input
        aria-label="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full bg-transparent outline-none mb-3 text-sm placeholder:text-dim"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <div role="radiogroup" aria-label="Priority" className="flex gap-1.5">
          {PRIORITIES.map((p) => {
            const selected = priority === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selected ? PRIORITY_CONFIG[p].selected : "bg-muted text-dim border-border hover:text-soft"
                }`}
              >
                {PRIORITY_CONFIG[p].label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted text-muted-foreground">
          <Calendar size={11} className="text-dim" aria-hidden="true" />
          <span className="sr-only">Due date</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent outline-none text-xs" />
        </label>

        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted text-muted-foreground">
          <Clock size={11} className="text-dim" aria-hidden="true" />
          <span className="sr-only">Due time</span>
          <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="bg-transparent outline-none text-xs" />
        </label>

        <button
          type="submit"
          disabled={!title.trim()}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-br from-primary to-primary-strong shadow-[0_0_20px_rgb(139_30_45/0.3)] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={13} aria-hidden="true" />
          Add Task
        </button>
      </div>
    </form>
  );
}
