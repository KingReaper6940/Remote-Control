import {
  Boxes,
  Code2,
  Database,
  GitBranch,
  KeyRound,
  Layers,
  Server,
  Sparkles,
  TerminalSquare,
  Workflow,
  Zap,
} from "lucide-react";

import { SectionHeading } from "@/components/landing/capabilities";

const tools = [
  { icon: TerminalSquare, name: "Codex CLI", category: "Adapter" },
  { icon: Code2, name: "Cursor", category: "Adapter" },
  { icon: GitBranch, name: "GitHub", category: "Source" },
  { icon: Database, name: "Convex", category: "Realtime" },
  { icon: KeyRound, name: "Clerk", category: "Identity" },
  { icon: Server, name: "Local Bridge", category: "Connector" },
  { icon: Workflow, name: "Shell", category: "Runner" },
  { icon: Boxes, name: "Workspaces", category: "Routing" },
  { icon: Sparkles, name: "Prompts", category: "Templates" },
  { icon: Zap, name: "Webhooks", category: "Events" },
  { icon: Layers, name: "Adapters", category: "Pluggable" },
];

export function Integrations() {
  const items = [...tools, ...tools];

  return (
    <section className="relative border-b border-border bg-surface/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Integrations"
          title={
            <>
              Works with what
              <br />
              <span className="text-muted-strong">you already use.</span>
            </>
          }
          description="Codex runs through the local CLI today. Cursor starts in handoff mode and deepens. New adapters slot in without changing the surface."
        />

        <div className="mask-fade-x mt-14 overflow-hidden">
          <div className="animate-marquee-slow flex w-max gap-3">
            {items.map((tool, idx) => (
              <div
                key={`${tool.name}-${idx}`}
                className="group flex w-[210px] shrink-0 items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors duration-300 hover:border-border-strong hover:bg-surface"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-border-strong bg-surface-elevated text-muted-strong transition-colors duration-300 group-hover:text-accent">
                  <tool.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-muted">{tool.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
