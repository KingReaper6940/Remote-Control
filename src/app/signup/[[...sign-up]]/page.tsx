import type { Route } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { hasPublicStackEnv } from "@/lib/env";

export default async function SignUpPage() {
  if (!hasPublicStackEnv) {
    return (
      <SetupNotice
        title="Finish Clerk + Convex setup before sign-up."
        body="This repo now expects Clerk for authentication and Convex for the backend. Add the public keys and URLs below to .env.local."
        lines={[
          "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
          "NEXT_PUBLIC_CONVEX_URL=",
          "NEXT_PUBLIC_CONVEX_SITE_URL=",
          "CLERK_SECRET_KEY=",
          "CLERK_JWT_ISSUER_DOMAIN="
        ]}
      />
    );
  }

  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard" as Route);
  }

  return (
    <section className="hero-shell auth-shell">
      <div className="hero-card auth-card">
        <span className="eyebrow">Remote Control Cloud</span>
        <h1>Create your remote build cockpit.</h1>
        <p className="lede">Create an account, connect your desktop tools, and route work through your own connected machine.</p>
        <div className="clerk-shell">
          <SignUp appearance={clerkAppearance} />
        </div>
      </div>
    </section>
  );
}
