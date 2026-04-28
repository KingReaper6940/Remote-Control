import * as React from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function Panel({ className, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface/60 backdrop-blur-md transition-all duration-300 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)] hover:border-border-strong/80",
        className
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between md:p-6">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight md:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-pretty text-xs text-muted-strong md:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PanelBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />;
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-6 py-10 text-center">
      {icon ? (
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-gradient-to-b from-surface-elevated to-surface text-muted">
          {icon}
        </div>
      ) : null}
      <p className="mt-1 text-sm font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-pretty text-xs text-muted">{description}</p>
      ) : null}
    </div>
  );
}
