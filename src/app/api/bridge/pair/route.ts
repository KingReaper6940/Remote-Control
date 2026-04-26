import { NextResponse } from "next/server";

import { hasFirebaseAdminEnv } from "@/lib/firebase/admin";
import { claimPairingCode } from "@/lib/store";
import type { DevicePlatform } from "@/lib/types";

function normalizePlatforms(value: unknown): DevicePlatform[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((platform): platform is DevicePlatform => platform === "codex" || platform === "cursor");
}

export async function POST(request: Request) {
  if (!hasFirebaseAdminEnv) {
    return NextResponse.json({ error: "Firebase admin credentials are missing." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const deviceName = typeof body.deviceName === "string" ? body.deviceName.trim() : "";
    const workspaceRoot = typeof body.workspaceRoot === "string" ? body.workspaceRoot.trim() : "";
    const platforms = normalizePlatforms(body.platforms);

    if (!code || !deviceName || platforms.length === 0) {
      return NextResponse.json({ error: "code, deviceName, and at least one platform are required." }, { status: 400 });
    }

    const pairing = await claimPairingCode({
      code,
      deviceName,
      platforms,
      workspaceRoot: workspaceRoot || null
    });

    return NextResponse.json(pairing);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to pair this connector."
      },
      { status: 500 }
    );
  }
}
