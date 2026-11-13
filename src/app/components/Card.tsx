import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-card p-4 ${className}`}>{children}</section>;
}

export function CardTitle({ icon: Icon, children, aside }: { icon: LucideIcon; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-primary-soft" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</h3>
      </div>
      {aside}
    </div>
  );
}

/** Controle segmentado (ex.: Escuro / Claro / Sistema) */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: LucideIcon }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 p-1 rounded-xl bg-muted border border-border">
      {options.map(({ value: v, label: l, icon: Icon }) => {
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selected ? "bg-card text-foreground shadow-sm border border-border" : "text-dim hover:text-soft border border-transparent"
            }`}
          >
            {Icon && <Icon size={12} aria-hidden="true" />}
            {l}
          </button>
        );
      })}
    </div>
  );
}
