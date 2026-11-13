import { Search, Settings, X } from "lucide-react";
import { formatLongDate, getGreeting } from "../lib/date";

interface HeaderProps {
  name: string;
  search: string;
  onSearch: (q: string) => void;
  onOpenSettings: () => void;
}

export function Header({ name, search, onSearch, onOpenSettings }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-8 py-4 md:py-5 border-b border-border shrink-0">
      <div className="min-w-0">
        <p className="text-xs mb-0.5 text-dim">{formatLongDate()}</p>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight truncate">{getGreeting(name)}.</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card flex-1 sm:w-56 sm:flex-none focus-within:border-primary-soft transition-colors">
          <Search size={13} className="text-dim shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search tasks"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onSearch("")}
            placeholder="Search tasks..."
            className="bg-transparent outline-none flex-1 min-w-0 text-[13px] placeholder:text-dim [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button onClick={() => onSearch("")} aria-label="Clear search" className="text-dim hover:text-soft">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="hidden md:flex w-9 h-9 rounded-xl border border-border bg-card items-center justify-center text-dim hover:border-line-strong hover:text-soft transition-colors"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}
