"use client";

import Link from "next/link";
import type { Route } from "next";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  Boxes,
  Cpu,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Settings2,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarProps {
  active: Section;
  onChange: (section: Section) => void;
  onlineDevices: number;
  totalDevices: number;
}

export type Section =
  | "overview"
  | "compose"
  | "devices"
  | "activity"
  | "pairing"
  | "settings";

const items: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "compose", label: "Compose", icon: Terminal },
  { id: "devices", label: "Devices", icon: Cpu },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "pairing", label: "Pairing", icon: KeyRound },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export function Sidebar({
  active,
  onChange,
  onlineDevices,
  totalDevices,
}: SidebarProps) {
  const { user } = useUser();
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") ||
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "U";

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-surface/40 lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <Link href={"/" as Route} className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="relative grid h-7 w-7 place-items-center rounded-md border border-border-strong bg-surface-elevated">
            <span className="absolute inset-1 rounded-sm bg-foreground/90" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-background" />
          </span>
          Remote Control
        </Link>
      </div>

      <div className="border-b border-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5">
          <Boxes className="h-3.5 w-3.5 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted">
              Workspace
            </div>
            <div className="truncate text-xs font-medium">Personal</div>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-success/20 bg-success-soft px-1.5 py-0.5 text-[10px] font-medium text-success">
            <span className="h-1 w-1 rounded-full bg-success" />
            {onlineDevices}/{totalDevices || 0}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          Navigation
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all duration-200",
                    isActive
                      ? "border-border-strong bg-surface-elevated text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "border-transparent text-muted-strong hover:bg-surface hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive ? (
                    <span className="h-1 w-1 rounded-full bg-accent" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href={"#" as Route}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-strong transition-colors hover:bg-surface hover:text-foreground"
        >
          <LifeBuoy className="h-4 w-4 text-muted" />
          Support
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-surface-elevated text-xs font-medium uppercase">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "User"}
            </div>
            <div className="truncate text-[11px] text-muted">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile/tablet bottom nav
export function MobileTabBar({
  active,
  onChange,
}: {
  active: Section;
  onChange: (section: Section) => void;
}) {
  const mobileItems = items.slice(0, 5);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {mobileItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] transition-colors",
                isActive ? "text-foreground" : "text-muted"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", isActive ? "text-accent" : "")}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
