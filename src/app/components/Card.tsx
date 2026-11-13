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
