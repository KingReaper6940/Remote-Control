import type { Route } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { hasPublicStackEnv } from "@/lib/env";

export default async function SignInPage() {
  if (!hasPublicStackEnv) {
    return (
      <SetupNotice
        title="Finish Clerk + Convex setup before sign-in."
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
        <h1>Sign in to your remote build cockpit.</h1>
        <p className="lede">Use Clerk to sign in, then pair your own desktop connector and keep working from anywhere.</p>
        <div className="clerk-shell">
          <SignIn appearance={clerkAppearance} />
        </div>
      </div>
    </section>
  );
}
