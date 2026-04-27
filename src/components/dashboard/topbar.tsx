"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  title: string;
  subtitle?: string;
  wsConnected: boolean;
  copiedHint: string | null;
}

export function Topbar({ title, subtitle, wsConnected, copiedHint }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {copiedHint ? (
            <Badge tone="success" dot>
              {copiedHint}
            </Badge>
          ) : null}
        </div>
        {subtitle ? (
          <p className="hidden truncate text-xs text-muted md:block">{subtitle}</p>
        ) : null}
      </div>

      <div className="hidden flex-1 max-w-md md:block">
        <label className="relative flex items-center">
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-muted" />
          <input
            type="search"
            placeholder="Search devices, commands, prompts…"
            className="h-9 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-xs text-foreground placeholder:text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <span className="absolute right-3 hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted md:inline-flex">
            ⌘K
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Badge tone={wsConnected ? "success" : "warning"} dot>
          {wsConnected ? "Live" : "Reconnecting"}
        </Badge>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-strong transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-1 ring-border-strong",
            },
          }}
        />
      </div>
    </header>
  );
}
