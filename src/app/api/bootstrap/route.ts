import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth";
import { hasFirebaseAdminEnv } from "@/lib/firebase/admin";
import { getBootstrapData, upsertUserProfile } from "@/lib/store";

export async function GET(request: Request) {
  if (!hasFirebaseAdminEnv) {
    return NextResponse.json(
      {
        error: "Firebase admin credentials are missing.",
        firebaseConfigured: false
      },
      { status: 503 }
    );
  }

  try {
    const decoded = await requireUserId(request);
    await upsertUserProfile(decoded.uid, {
      email: decoded.email ?? null,
      displayName: decoded.name ?? null
    });

    const payload = await getBootstrapData(decoded.uid);
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load dashboard data."
      },
      { status: 500 }
    );
  }
}
