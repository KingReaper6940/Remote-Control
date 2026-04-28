import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "info" | "danger" | "accent";

const toneStyles: Record<Tone, string> = {
  default: "bg-surface-elevated text-muted-strong border-border-strong",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  info: "bg-info-soft text-info border-info/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  accent: "bg-accent-soft text-accent border-accent/20",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({
  className,
  tone = "default",
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.08em]",
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {dot ? (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
        </span>
      ) : null}
      {children}
    </span>
  );
}
