import type { Route } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";

import { SetupNotice } from "@/components/setup-notice";
import { Badge } from "@/components/ui/badge";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { hasPublicStackEnv } from "@/lib/env";

export default async function SignUpPage() {
  if (!hasPublicStackEnv) {
    return (
      <SetupNotice
        title="Finish Clerk + Convex setup before sign-up."
        body="This repo expects Clerk for authentication and Convex for the backend. Add the public keys and URLs below to .env.local."
        lines={[
          "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
          "NEXT_PUBLIC_CONVEX_URL=",
          "NEXT_PUBLIC_CONVEX_SITE_URL=",
          "CLERK_SECRET_KEY=",
          "CLERK_JWT_ISSUER_DOMAIN=",
        ]}
      />
    );
  }

  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard" as Route);
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-16">
        <div className="hidden lg:block">
          <Badge tone="default">
            <Sparkles className="h-3 w-3 text-accent" />
            Remote Control Cloud
          </Badge>
          <h1 className="mt-6 max-w-md text-balance text-5xl font-semibold leading-[1] tracking-tight">
            Build a cockpit for your machine.
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base text-muted-strong">
            Create an account, pair your desktop in under a minute, and route
            work into your local Codex or Cursor from anywhere.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-strong">
            {[
              "Free while in beta",
              "Bring your own machine",
              "No credit card required",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border bg-surface/60 p-2 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm">
            <SignUp appearance={clerkAppearance} />
          </div>
        </div>
      </div>
    </main>
  );
}
