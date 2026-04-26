"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { hasPublicStackEnv, publicConvexUrl } from "@/lib/env";

const convex = hasPublicStackEnv ? new ConvexReactClient(publicConvexUrl) : null;

function ConvexLayer({ children }: { children: React.ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  if (!hasPublicStackEnv) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider>
      <ConvexLayer>{children}</ConvexLayer>
    </ClerkProvider>
  );
}
