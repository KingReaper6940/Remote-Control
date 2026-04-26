import type { Route } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { DashboardClient } from "@/components/dashboard-client";
import { hasPublicStackEnv } from "@/lib/env";

export default async function DashboardPage() {
  if (!hasPublicStackEnv) {
    return (
      <SetupNotice
        title="Finish Clerk + Convex setup before opening the dashboard."
        body="The dashboard now runs on Clerk authentication and Convex realtime data. Add the required env vars, then restart the app."
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

  if (!userId) {
    redirect("/signin" as Route);
  }

  return <DashboardClient />;
}
