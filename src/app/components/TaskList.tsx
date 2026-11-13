import { useState, type ReactNode } from "react";
import { CheckCircle2, Circle, Clock, Edit2, ListTodo, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { PRIORITY_CONFIG } from "../constants";
import { formatRelativeDay } from "../lib/date";

interface ItemHandlers {
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

interface TaskListProps extends ItemHandlers {
  title: string;
  tasks: Task[];
  today: string;
  now: string;
  emptyText: string;
  /** Mostra a data em cada item (fora da visão "Today") */
  showDate?: boolean;
  action?: ReactNode;
}

export function TaskList({ title, tasks, today, now, emptyText, showDate, action, ...handlers }: TaskListProps) {
  return (
    <section aria-label={title}>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-dim">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        {action}
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-dim">{tasks.length}</span>
      </div>

      {tasks.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} today={today} now={now} showDate={showDate} {...handlers} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-dim">
          <ListTodo size={28} className="mb-3 opacity-40" aria-hidden="true" />
          <p className="text-[13px]">{emptyText}</p>
        </div>
      )}
    </section>
  );
}

function TaskItem({ task, today, now, showDate, onToggle, onDelete, onRename }: { task: Task; today: string; now: string; showDate?: boolean } & ItemHandlers) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const overdue = !task.completed && (task.dueDate < today || (task.dueDate === today && task.dueTime < now));

  const startEdit = () => {
    setDraft(task.title);
    setEditing(true);
  };
  const save = () => {
    if (draft.trim() && draft.trim() !== task.title) onRename(task.id, draft.trim());
    setEditing(false);
  };

  return (
    <li className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border border-line bg-card group transition-colors hover:border-line-strong">
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        aria-pressed={task.completed}
        className={`shrink-0 transition-colors ${task.completed ? "text-primary-soft" : "text-faint hover:text-dim"}`}
      >
        {task.completed ? <CheckCircle2 size={17} /> : <Circle size={17} />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label="Edit task title"
            className="bg-transparent outline-none w-full text-[13px] border-b border-primary-soft"
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={startEdit}
            className={`block truncate text-[13px] ${task.completed ? "text-dim line-through" : "text-soft"}`}
          >
            {task.title}
          </span>
        )}
        {/* Metadados abaixo do título no celular */}
        <div className="flex sm:hidden items-center gap-2 mt-1 text-[11px] text-dim">
          <span className={`px-1.5 rounded ${PRIORITY_CONFIG[task.priority].badge}`}>{PRIORITY_CONFIG[task.priority].label}</span>
          <span className={overdue ? "text-priority-high" : ""}>
            {showDate || overdue ? `${formatRelativeDay(task.dueDate)} · ` : ""}
            {task.dueTime}
          </span>
        </div>
      </div>

      <span className={`hidden sm:inline text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0 ${PRIORITY_CONFIG[task.priority].badge}`}>
        {PRIORITY_CONFIG[task.priority].label}
      </span>

      <div className={`hidden sm:flex items-center gap-1 shrink-0 text-[11px] ${overdue ? "text-priority-high" : "text-dim"}`}>
        <Clock size={11} aria-hidden="true" />
        <span>
          {showDate || overdue ? `${formatRelativeDay(task.dueDate)} · ` : ""}
          {task.dueTime}
        </span>
        {overdue && <span className="sr-only">(overdue)</span>}
      </div>

      {/* Sempre visível no toque; no desktop aparece no hover ou foco */}
      <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
        <button
          onClick={startEdit}
          aria-label={`Edit "${task.title}"`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-dim hover:bg-line hover:text-soft transition-colors"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-dim hover:bg-primary/20 hover:text-priority-high transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </li>
  );
}
