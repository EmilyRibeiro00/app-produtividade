import { Languages, Moon, Search, Settings, Sun, X } from "lucide-react";
import { formatLongDate, getGreeting } from "../lib/date";
import { useT } from "../lib/i18n";

interface HeaderProps {
  name: string;
  search: string;
  onSearch: (q: string) => void;
  onOpenSettings: () => void;
  isLight: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const iconButton =
  "w-9 h-9 shrink-0 rounded-xl border border-border bg-card flex items-center justify-center text-dim hover:border-line-strong hover:text-soft transition-colors";

export function Header({ name, search, onSearch, onOpenSettings, isLight, onToggleTheme, onToggleLanguage }: HeaderProps) {
  const t = useT();
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-8 py-4 md:py-5 border-b border-border shrink-0">
      <div className="min-w-0">
        <p className="text-xs mb-0.5 text-dim">{formatLongDate(t)}</p>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight truncate">{getGreeting(t, name)}.</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card flex-1 sm:w-56 sm:flex-none focus-within:border-primary-soft transition-colors">
          <Search size={13} className="text-dim shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label={t.search.label}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onSearch("")}
            placeholder={t.search.placeholder}
            className="bg-transparent outline-none flex-1 min-w-0 text-[13px] placeholder:text-dim [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button onClick={() => onSearch("")} aria-label={t.search.clear} className="text-dim hover:text-soft">
              <X size={13} />
            </button>
          )}
        </div>
        <button onClick={onToggleLanguage} aria-label={t.header.switchLanguage} title={t.header.switchLanguage} className={`${iconButton} gap-1 w-auto px-2.5 text-[11px] font-semibold`}>
          <Languages size={13} aria-hidden="true" />
          {t.locale === "pt-BR" ? "PT" : "EN"}
        </button>
        <button
          onClick={onToggleTheme}
          aria-label={isLight ? t.header.switchToDark : t.header.switchToLight}
          title={isLight ? t.header.switchToDark : t.header.switchToLight}
          className={iconButton}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <button onClick={onOpenSettings} aria-label={t.nav.settings} className={`${iconButton} hidden md:flex`}>
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}
