import { NextResponse } from "next/server";

import { requireBridgeSession } from "@/lib/auth";
import { hasFirebaseAdminEnv } from "@/lib/firebase/admin";
import { getNextQueuedCommand, markDeviceOnline } from "@/lib/store";

export async function POST(request: Request) {
  if (!hasFirebaseAdminEnv) {
    return NextResponse.json({ error: "Firebase admin credentials are missing." }, { status: 503 });
  }

  try {
    const bridge = await requireBridgeSession(request);
    await markDeviceOnline(bridge.ownerId, bridge.deviceId);

    const command = await getNextQueuedCommand(bridge.ownerId, bridge.deviceId);

    return NextResponse.json({
      deviceId: bridge.deviceId,
      command
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch work for this bridge."
      },
      { status: 500 }
    );
  }
}
