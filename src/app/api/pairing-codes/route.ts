import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth";
import { hasFirebaseAdminEnv } from "@/lib/firebase/admin";
import { createPairingCode } from "@/lib/store";

export async function POST(request: Request) {
  if (!hasFirebaseAdminEnv) {
    return NextResponse.json({ error: "Firebase admin credentials are missing." }, { status: 503 });
  }

  try {
    const decoded = await requireUserId(request);
    const pairingCode = await createPairingCode(decoded.uid);
    return NextResponse.json(pairingCode);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create a pairing code."
      },
      { status: 500 }
    );
  }
}
