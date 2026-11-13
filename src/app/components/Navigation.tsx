import { BarChart2, Calendar, CheckSquare, Flame, Home, Settings, type LucideIcon } from "lucide-react";
import type { NavItem } from "../types";

const NAV: { id: NavItem; label: string; Icon: LucideIcon }[] = [
  { id: "today", label: "Today", Icon: Home },
  { id: "upcoming", label: "Upcoming", Icon: Calendar },
  { id: "completed", label: "Completed", Icon: CheckSquare },
  { id: "statistics", label: "Statistics", Icon: BarChart2 },
  { id: "settings", label: "Settings", Icon: Settings },
];

interface NavProps {
  active: NavItem;
  onNavigate: (id: NavItem) => void;
  counts: Partial<Record<NavItem, number>>;
}

function NavButton({ id, label, Icon, active, count, onNavigate }: (typeof NAV)[number] & { active: boolean; count?: number; onNavigate: (id: NavItem) => void }) {
  return (
    <button
      onClick={() => onNavigate(id)}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left border transition-colors duration-200 ${
        active
          ? "bg-primary/15 border-primary/30 text-foreground"
          : "border-transparent text-muted-foreground hover:text-soft hover:bg-muted"
      }`}
    >
      <Icon size={14} className={active ? "text-primary-soft" : "text-dim"} aria-hidden="true" />
      <span className="flex-1 text-xs font-medium">{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-md ${active ? "bg-primary/25 text-priority-high" : "bg-muted text-dim"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/** Barra lateral (tablet e desktop) */
export function Sidebar({ active, onNavigate, counts, name, pomodorosToday }: NavProps & { name: string; pomodorosToday: number }) {
  const main = NAV.filter((n) => n.id !== "settings");
  const settings = NAV.find((n) => n.id === "settings")!;
  return (
    <aside className="hidden md:flex flex-col w-56 h-full shrink-0 border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-primary to-accent">
          <Flame size={15} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">Nocturne</p>
          <p className="text-xs text-muted-foreground">Focus. Create.</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex flex-col gap-0.5 px-2 py-4 flex-1">
        {main.map((item) => (
          <NavButton key={item.id} {...item} active={active === item.id} count={counts[item.id]} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="px-2 pb-4 border-t border-border pt-3">
        <div className="mb-3">
          <NavButton {...settings} active={active === "settings"} onNavigate={onNavigate} />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-gradient-to-br from-primary to-accent">
            {(name.trim()[0] ?? "N").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate text-soft">{name.trim() || "Anonymous"}</p>
            <p className="text-xs truncate text-dim">
              {pomodorosToday} pomodoro{pomodorosToday === 1 ? "" : "s"} today
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Barra de navegação inferior (celular) */
export function MobileNav({ active, onNavigate, counts }: NavProps) {
  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-20 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      {NAV.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const count = counts[id];
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${isActive ? "text-foreground" : "text-dim"}`}
          >
            <Icon size={17} className={isActive ? "text-primary-soft" : ""} aria-hidden="true" />
            {label}
            {count ? (
              <span className="absolute top-1.5 left-1/2 ml-2 min-w-4 px-1 rounded-full bg-primary text-[9px] leading-4 text-foreground">
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
