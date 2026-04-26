export const publicClerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const publicConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
export const publicConvexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";

export const hasPublicClerkEnv = Boolean(publicClerkPublishableKey);
export const hasPublicConvexEnv = Boolean(publicConvexUrl && publicConvexSiteUrl);
export const hasPublicStackEnv = hasPublicClerkEnv && hasPublicConvexEnv;
