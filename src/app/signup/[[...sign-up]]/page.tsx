import { SignUp } from "@clerk/nextjs";

import { SetupNotice } from "@/components/setup-notice";
import { hasPublicStackEnv } from "@/lib/env";

export default function SignUpPage() {
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

  return (
    <section className="hero-shell auth-shell">
      <div className="hero-card auth-card">
        <span className="eyebrow">Remote Control Cloud</span>
        <h1>Create your remote build cockpit.</h1>
        <p className="lede">Create an account, connect your desktop tools, and route work through your own connected machine.</p>
        <div className="clerk-shell">
          <SignUp />
        </div>
      </div>
    </section>
  );
}
