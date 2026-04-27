import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface SetupNoticeProps {
  title: string;
  body: string;
  lines: string[];
}

export function SetupNotice({ title, body, lines }: SetupNoticeProps) {
  return (
    <main className="grid min-h-[80vh] place-items-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface/60 p-8 backdrop-blur-sm md:p-10">
        <Badge tone="warning">
          <AlertTriangle className="h-3 w-3" />
          Setup needed
        </Badge>
        <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-strong md:text-base">
          {body}
        </p>
        <pre className="scrollbar-thin mt-6 overflow-x-auto rounded-xl border border-border bg-background/60 p-4 font-mono text-[12px] leading-relaxed text-muted-strong">
          {lines.join("\n")}
        </pre>
      </div>
    </main>
  );
}
