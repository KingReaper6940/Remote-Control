"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_8px_24px_-8px_rgba(255,255,255,0.18)]",
        secondary:
          "bg-surface-elevated text-foreground border border-border-strong hover:bg-surface hover:border-border-strong/80",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-elevated border border-transparent hover:border-border",
        outline:
          "bg-transparent text-foreground border border-border-strong hover:bg-surface-elevated",
        accent:
          "bg-accent text-background hover:bg-accent/90 shadow-[0_8px_24px_-12px_rgba(245,181,107,0.6)]",
        danger:
          "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/10",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[0.95rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
