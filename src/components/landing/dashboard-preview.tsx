"use client";

import { CircleDot, Cpu, Terminal } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-4 -top-12 h-40 bg-gradient-to-b from-accent/10 to-transparent blur-2xl" />
      {/* Ambient glow behind the preview */}
      <div className="absolute inset-0 -m-4 rounded-3xl bg-accent/5 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[0_30px_120px_-40px_rgba(0,0,0,0.8)]">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background/50 px-3 py-1 text-[11px] text-muted">
            <CircleDot className="h-3 w-3 text-success" />
            remote.control / dashboard
          </div>
          <div className="text-[11px] text-muted">v1.4.0</div>
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-border bg-surface/60 p-4">
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs">
              <Cpu className="h-3.5 w-3.5 text-accent" />
              <span className="font-medium">Studio MacBook Pro</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success" />
            </div>
            <div className="space-y-1 text-xs">
              {[
                { label: "Overview", active: true },
                { label: "Devices" },
                { label: "Activity" },
                { label: "Pairing" },
                { label: "Settings" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                    item.active
                      ? "bg-surface-elevated text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${
                      item.active ? "bg-accent" : "bg-border-strong"
                    }`}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="col-span-9 p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Devices", value: "1", sub: "1 online" },
                { label: "Queued", value: "3", sub: "running now" },
                { label: "Latency", value: "42ms", sub: "to Studio Mac" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-border bg-background/40 p-3"
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted">
                    {kpi.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] text-muted">{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Terminal className="h-3.5 w-3.5" />
                Compose remote task
              </div>
              <div className="mt-3 rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-[12px] text-muted-strong">
                <span className="text-accent">codex&gt;</span> polish the auth
                screen, run checks, summarize what changed
                <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-foreground" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] text-muted">
                  target: codex
                </span>
                <span className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] text-muted">
                  workspace: ~/Projects/Remote-Control
                </span>
                <span className="ml-auto rounded-md bg-foreground px-3 py-1 text-[10px] font-medium text-background">
                  Queue
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted">
                Activity
              </div>
              <div className="mt-2 space-y-1.5 text-[12px]">
                {[
                  { state: "completed", text: "Refactored login form components" },
                  { state: "running", text: "Polishing dashboard spacing" },
                  { state: "queued", text: "Run release prep checklist" },
                ].map((row) => (
                  <div
                    key={row.text}
                    className="flex items-center gap-2 border-b border-border/60 py-1.5 last:border-0"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.state === "completed"
                          ? "bg-success"
                          : row.state === "running"
                            ? "bg-info"
                            : "bg-warning"
                      }`}
                    />
                    <span className="text-muted-strong">{row.text}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-[0.1em] text-muted">
                      {row.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
