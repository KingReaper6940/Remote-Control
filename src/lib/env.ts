function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const publicClerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const publicConvexUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");
export const publicConvexSiteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "");

export const hasPublicClerkEnv = Boolean(publicClerkPublishableKey);
export const hasPublicConvexEnv = Boolean(publicConvexUrl && publicConvexSiteUrl);
export const hasPublicStackEnv = hasPublicClerkEnv && hasPublicConvexEnv;
