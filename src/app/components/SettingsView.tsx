import { useEffect, useState, type ReactNode } from "react";
import { Bell, Database, Monitor, Moon, Palette, Sun, Timer, User } from "lucide-react";
import { Card, CardTitle, Segmented } from "./Card";
import type { Settings, ThemeMode } from "../types";
import { notificationsSupported, requestNotificationPermission } from "../lib/notify";
import { useT, type Lang } from "../lib/i18n";

interface SettingsViewProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  completedCount: number;
  onClearCompleted: () => void;
  onResetAll: () => void;
}

export function SettingsView({ settings, onChange, completedCount, onClearCompleted, onResetAll }: SettingsViewProps) {
  const t = useT();
  const [permission, setPermission] = useState(() => (notificationsSupported() ? Notification.permission : "unsupported"));

  const toggleNotifications = async (on: boolean) => {
    onChange({ notifications: on });
    if (on) setPermission(await requestNotificationPermission());
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 max-w-4xl">
      <Card>
        <CardTitle icon={Palette}>{t.settings.appearance}</CardTitle>
        <div className="flex flex-col gap-4">
          <div>
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">{t.settings.language}</span>
            <Segmented<Lang>
              label={t.settings.language}
              value={settings.language}
              onChange={(language) => onChange({ language })}
              options={[
                { value: "pt", label: "Português" },
                { value: "en", label: "English" },
              ]}
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">{t.settings.theme}</span>
            <Segmented<ThemeMode>
              label={t.settings.theme}
              value={settings.theme}
              onChange={(theme) => onChange({ theme })}
              options={[
                { value: "dark", label: t.settings.themeDark, icon: Moon },
                { value: "light", label: t.settings.themeLight, icon: Sun },
                { value: "system", label: t.settings.themeSystem, icon: Monitor },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle icon={User}>{t.settings.profile}</CardTitle>
        <Field label={t.settings.displayName} hint={t.settings.displayNameHint}>
          <input
            value={settings.name}
            onChange={(e) => onChange({ name: e.target.value.slice(0, 40) })}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary-soft"
          />
        </Field>
      </Card>

      <Card>
        <CardTitle icon={Timer}>{t.settings.timer}</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t.settings.focusMin} value={settings.workMinutes} min={1} max={120} onChange={(v) => onChange({ workMinutes: v })} />
          <NumberField label={t.settings.shortMin} value={settings.shortBreakMinutes} min={1} max={60} onChange={(v) => onChange({ shortBreakMinutes: v })} />
          <NumberField label={t.settings.longMin} value={settings.longBreakMinutes} min={1} max={90} onChange={(v) => onChange({ longBreakMinutes: v })} />
          <NumberField label={t.settings.perCycle} value={settings.sessionsPerCycle} min={2} max={8} onChange={(v) => onChange({ sessionsPerCycle: v })} />
        </div>
        <p className="mt-2 text-[11px] text-dim">{t.settings.applyHint}</p>
        <div className="mt-3">
          <Toggle label={t.settings.autoStart} checked={settings.autoStartBreaks} onChange={(v) => onChange({ autoStartBreaks: v })} />
        </div>
      </Card>

      <Card>
        <CardTitle icon={Bell}>{t.settings.alerts}</CardTitle>
        <div className="flex flex-col gap-1">
          <Toggle label={t.settings.sound} checked={settings.sound} onChange={(v) => onChange({ sound: v })} />
          <Toggle label={t.settings.notifications} checked={settings.notifications} disabled={permission === "unsupported"} onChange={toggleNotifications} />
          {settings.notifications && permission === "denied" && <p className="text-[11px] text-priority-medium">{t.settings.blocked}</p>}
          {permission === "unsupported" && <p className="text-[11px] text-dim">{t.settings.unsupported}</p>}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle icon={Database}>{t.settings.data}</CardTitle>
        <p className="text-xs text-dim mb-3">{t.settings.storedLocally}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onClearCompleted}
            disabled={completedCount === 0}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-border bg-muted text-soft hover:border-line-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.settings.clearCompleted(completedCount)}
          </button>
          <button
            onClick={() => {
              if (window.confirm(t.settings.resetConfirm)) onResetAll();
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-primary/50 bg-primary/15 text-priority-high hover:bg-primary/25"
          >
            {t.settings.resetAll}
          </button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-dim">{hint}</span>}
    </label>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  // Rascunho local para permitir apagar o campo enquanto digita
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Math.round(Number(draft));
    const clamped = Number.isFinite(n) && draft.trim() !== "" ? Math.min(max, Math.max(min, n)) : value;
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm tabular-nums outline-none focus:border-primary-soft"
      />
    </Field>
  );
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 w-full py-2 text-left text-xs text-soft disabled:opacity-50"
    >
      {label}
      <span className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${checked ? "bg-primary" : "bg-switch-background"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
